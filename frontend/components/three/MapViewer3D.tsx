'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { GameMap } from '@/lib/valorant'
import { calloutToUV } from '@/lib/valorant'
import { createRenderer, disposeObject, loadTexture, onResize, prefersReducedMotion, runLoop, useWebGLSupport } from './utils'
import { useI18n } from '../LangProvider'

const PALETTE = ['#ff4654', '#2bb5a0', '#f2b84b', '#8ec5ff', '#ff9f5a', '#c58bff', '#f4efe6', '#7ee081']
const SIZE = 10
const LAYERS = 14
const HEIGHT = 0.35

type MapLike = Pick<GameMap, 'displayIcon' | 'callouts' | 'xMultiplier' | 'yMultiplier' | 'xScalarToAdd' | 'yScalarToAdd' | 'displayName'>

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float uTop;
  uniform float uTime;
  uniform vec3 uAccent;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    if (c.a < 0.35) discard;
    vec3 col;
    if (uTop > 0.5) {
      float scan = smoothstep(0.0, 0.015, fract(vUv.y - uTime * 0.08)) * (1.0 - smoothstep(0.015, 0.03, fract(vUv.y - uTime * 0.08)));
      col = c.rgb * 0.95 + scan * uAccent * 0.6;
    } else {
      col = mix(c.rgb * 0.12, uAccent * 0.35, 0.5);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export default function MapViewer3D({ map, className = '' }: { map: MapLike; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const ctl = useRef<{
    setView: (v: '3d' | 'top') => void
    setLabels: (v: boolean) => void
    setRegion: (r: string | null) => void
  } | null>(null)
  const supported = useWebGLSupport()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'3d' | 'top'>('3d')
  const [labels, setLabels] = useState(true)
  const [region, setRegion] = useState<string | null>(null)

  const regions = useMemo(() => {
    const names = Array.from(new Set((map.callouts ?? []).map((c) => c.superRegionName)))
    return names.map((name, i) => ({ name, color: PALETTE[i % PALETTE.length] }))
  }, [map.callouts])

  useEffect(() => {
    const container = ref.current
    if (!container || !supported || !map.displayIcon) return

    const reduced = prefersReducedMotion()
    const renderer = createRenderer(container)
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(container.clientWidth, container.clientHeight)
    Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
    container.appendChild(labelRenderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x1c1e24, 18, 40)
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
    const views = {
      '3d': new THREE.Vector3(0, 9, 10.5),
      top: new THREE.Vector3(0, 15.5, 0.01),
    }
    camera.position.copy(views['3d'])
    const camGoal = { pos: null as THREE.Vector3 | null }

    const orbit = new OrbitControls(camera, renderer.domElement)
    orbit.enableDamping = true
    orbit.maxPolarAngle = Math.PI / 2.15
    orbit.minDistance = 4
    orbit.maxDistance = 26
    orbit.screenSpacePanning = false
    orbit.target.set(0, 0, 0)

    const accent = new THREE.Color('#ff4654')
    const time = { value: 0 }

    // ---------- โต๊ะ / grid ----------
    const grid = new THREE.GridHelper(30, 30, 0x3a3f4a, 0x2c3038)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.5
    grid.position.y = -0.02
    scene.add(grid)
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE + 0.6, 0.01, SIZE + 0.6)),
      new THREE.LineBasicMaterial({ color: 0xf4efe6, transparent: true, opacity: 0.35 }),
    )
    scene.add(frame)

    // ---------- minimap ซ้อนชั้นให้มีความหนา ----------
    const mapGroup = new THREE.Group()
    scene.add(mapGroup)

    // ---------- callouts ----------
    const pins = new THREE.Group()
    scene.add(pins)
    const labelEls: { el: HTMLDivElement; region: string; pin: THREE.Object3D }[] = []
    const colorOf = new Map(regions.map((r) => [r.name, r.color]))
    const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 6)
    pinGeo.translate(0, 0.5, 0)
    const headGeo = new THREE.OctahedronGeometry(0.09, 0)

    for (const c of map.callouts ?? []) {
      const { u, v } = calloutToUV(map as GameMap, c)
      if (!Number.isFinite(u) || !Number.isFinite(v)) continue
      const color = new THREE.Color(colorOf.get(c.superRegionName) ?? '#ece8e1')
      const pin = new THREE.Group()
      pin.position.set((u - 0.5) * SIZE, HEIGHT, (v - 0.5) * SIZE)
      const stick = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }))
      stick.scale.y = 0.6
      const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color }))
      head.position.y = 0.65
      pin.add(stick, head)

      const el = document.createElement('div')
      el.textContent = c.regionName
      el.className =
        'rounded-md border-2 px-1.5 py-0.5 text-xs leading-none whitespace-nowrap text-ink bg-paper transition-opacity duration-300'
      el.style.borderColor = color.getStyle()
      el.style.fontFamily = 'var(--font-body)'
      el.style.boxShadow = '1px 2px 0 rgb(0 0 0 / .35)'
      const label = new CSS2DObject(el)
      label.position.set(0, 0.95, 0)
      pin.add(label)
      pin.userData.region = c.superRegionName
      pins.add(pin)
      labelEls.push({ el, region: c.superRegionName, pin })
    }

    let showLabels = true
    let activeRegion: string | null = null
    const applyFilters = () => {
      for (const { el, region: r, pin } of labelEls) {
        const on = !activeRegion || activeRegion === r
        el.style.opacity = showLabels && on ? '1' : '0'
        pin.scale.setScalar(on ? 1 : 0.4)
        pin.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined
          if (m) m.opacity = on ? 1 : 0.15
          if (m) m.transparent = true
        })
      }
    }

    let cancelled = false
    loadTexture(map.displayIcon)
      .then((tex) => {
        if (cancelled) return
        const geo = new THREE.PlaneGeometry(SIZE, SIZE)
        geo.rotateX(-Math.PI / 2)
        const top = new THREE.ShaderMaterial({
          uniforms: { map: { value: tex }, uTop: { value: 1 }, uTime: time, uAccent: { value: accent } },
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
        })
        const side = new THREE.ShaderMaterial({
          uniforms: { map: { value: tex }, uTop: { value: 0 }, uTime: time, uAccent: { value: accent } },
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
        })
        for (let i = 0; i < LAYERS; i++) {
          const mesh = new THREE.Mesh(geo, i === LAYERS - 1 ? top : side)
          mesh.position.y = (i / (LAYERS - 1)) * HEIGHT
          mapGroup.add(mesh)
        }
        setLoading(false)
      })
      .catch(() => !cancelled && setLoading(false))

    ctl.current = {
      setView: (v) => {
        camGoal.pos = views[v].clone()
        orbit.target.set(0, 0, 0)
      },
      setLabels: (v) => {
        showLabels = v
        applyFilters()
      },
      setRegion: (r) => {
        activeRegion = r
        applyFilters()
      },
    }

    const stopResize = onResize(container, (w, h) => {
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
      camera.aspect = w / h
      // จอแคบให้ถอยกล้องออกให้เห็นทั้งแมพ
      camera.fov = w / h < 0.9 ? 58 : 40
      camera.updateProjectionMatrix()
    })

    const stopLoop = runLoop(container, (dt, t) => {
      time.value = reduced ? 0 : t
      if (camGoal.pos) {
        camera.position.lerp(camGoal.pos, 0.08)
        if (camera.position.distanceTo(camGoal.pos) < 0.05) camGoal.pos = null
      }
      pins.children.forEach((p, i) => {
        const head = p.children[1]
        head.rotation.y += dt * 1.5
        if (!reduced) head.position.y = 0.65 + Math.sin(t * 2 + i) * 0.04
      })
      orbit.update(dt)
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    })

    return () => {
      cancelled = true
      ctl.current = null
      stopLoop()
      stopResize()
      orbit.dispose()
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
      labelRenderer.domElement.remove()
    }
  }, [map, regions, supported])

  const changeView = (v: '3d' | 'top') => {
    setView(v)
    ctl.current?.setView(v)
  }
  const toggleLabels = () => {
    const next = !labels
    setLabels(next)
    ctl.current?.setLabels(next)
  }
  const pickRegion = (r: string | null) => {
    const next = region === r ? null : r
    setRegion(next)
    ctl.current?.setRegion(next)
  }
  const fullscreen = () => {
    const el = ref.current?.parentElement
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  if (!supported || !map.displayIcon) {
    return map.displayIcon ? (
      <div className={`flex items-center justify-center bg-night ${className}`}>
        <img src={map.displayIcon} alt={`${map.displayName} minimap`} className="max-h-full max-w-full" />
      </div>
    ) : null
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={ref} className="absolute inset-0" role="img" aria-label={`${map.displayName} 3D tactical map`} />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="hand animate-pulse text-lg !text-paper/70">{t.viewer.mapLoading}</span>
        </div>
      )}

      {/* filter super region */}
      {regions.length > 0 && (
        <div className="scrollbar-hide absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-3">
          <RegionChip active={region === null} color="#ece8e1" onClick={() => pickRegion(null)}>
            {t.common.all}
          </RegionChip>
          {regions.map((r) => (
            <RegionChip key={r.name} active={region === r.name} color={r.color} onClick={() => pickRegion(r.name)}>
              {r.name}
            </RegionChip>
          ))}
        </div>
      )}

      <div className="absolute right-3 bottom-3 flex gap-1.5">
        <div className="flex overflow-hidden rounded-lg border-2 border-paper/30 bg-night/70 backdrop-blur">
          {(['3d', 'top'] as const).map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              className={`px-3 py-1 text-sm transition-colors ${
                view === v ? 'bg-mustard text-ink' : 'text-paper/80 hover:text-mustard'
              }`}
            >
              {v === '3d' ? t.viewer.tilt : t.viewer.top}
            </button>
          ))}
        </div>
        <button
          onClick={toggleLabels}
          className={`rounded-lg border-2 px-2.5 py-1 text-sm backdrop-blur transition-colors ${
            labels ? 'border-mustard bg-night/70 text-mustard' : 'border-paper/30 bg-night/70 text-paper/80'
          }`}
        >
          {t.viewer.labels}
        </button>
        <button
          onClick={fullscreen}
          aria-label={t.viewer.fullscreen}
          className="rounded-lg border-2 border-paper/30 bg-night/70 px-2.5 py-1 text-sm text-paper/80 backdrop-blur hover:border-mustard hover:text-mustard"
        >
          {t.viewer.fullscreen}
        </button>
      </div>
      <p className="hand pointer-events-none absolute bottom-3 left-4 hidden -rotate-1 text-base !text-mustard md:block">
        {t.viewer.mapHint}
      </p>
    </div>
  )
}

function RegionChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm backdrop-blur transition-colors ${
        active ? 'border-paper bg-paper text-ink' : 'border-paper/25 bg-night/70 text-paper/85 hover:border-paper/60'
      }`}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {children}
    </button>
  )
}
