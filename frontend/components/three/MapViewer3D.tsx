'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { GameMap } from '@/lib/valorant'
import { calloutToUV } from '@/lib/valorant'
import { createRenderer, disposeObject, loadTexture, onResize, prefersReducedMotion, runLoop, useWebGLSupport } from './utils'

const PALETTE = ['#ff4654', '#3fe3c6', '#f5c96b', '#8fa8ff', '#ff9f5a', '#c58bff', '#ece8e1', '#7ee081']
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
    scene.fog = new THREE.Fog(0x0f1923, 18, 40)
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
    const grid = new THREE.GridHelper(30, 30, 0xff4654, 0x1f2b38)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.5
    grid.position.y = -0.02
    scene.add(grid)
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE + 0.6, 0.01, SIZE + 0.6)),
      new THREE.LineBasicMaterial({ color: 0xff4654, transparent: true, opacity: 0.7 }),
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
        'px-1.5 py-0.5 text-[10px] leading-none whitespace-nowrap uppercase tracking-wider text-white bg-black/70 border-l-2 transition-opacity duration-300'
      el.style.borderColor = color.getStyle()
      el.style.fontFamily = 'var(--font-body)'
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
      <div className={`flex items-center justify-center bg-val-deep ${className}`}>
        <img src={map.displayIcon} alt={`${map.displayName} minimap`} className="max-h-full max-w-full" />
      </div>
    ) : null
  }

  return (
    <div className={`relative overflow-hidden bg-val-deep ${className}`}>
      <div ref={ref} className="absolute inset-0" role="img" aria-label={`${map.displayName} 3D tactical map`} />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-10 w-10 animate-spin border-2 border-val-red border-t-transparent" />
        </div>
      )}

      {/* filter super region */}
      {regions.length > 0 && (
        <div className="scrollbar-hide absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-3">
          <RegionChip active={region === null} color="#ece8e1" onClick={() => pickRegion(null)}>
            ทั้งหมด
          </RegionChip>
          {regions.map((r) => (
            <RegionChip key={r.name} active={region === r.name} color={r.color} onClick={() => pickRegion(r.name)}>
              {r.name}
            </RegionChip>
          ))}
        </div>
      )}

      <div className="absolute right-3 bottom-3 flex gap-1.5">
        <div className="flex border border-white/15 bg-black/40 backdrop-blur">
          {(['3d', 'top'] as const).map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              className={`px-3 py-2 font-display text-xs tracking-widest uppercase transition-colors ${
                view === v ? 'bg-val-red text-white' : 'text-val-cream/60 hover:text-white'
              }`}
            >
              {v === '3d' ? '3D' : 'Top'}
            </button>
          ))}
        </div>
        <button
          onClick={toggleLabels}
          className={`border px-3 py-2 font-display text-xs tracking-widest uppercase backdrop-blur transition-colors ${
            labels ? 'border-val-red bg-val-red/20 text-white' : 'border-white/15 bg-black/40 text-val-cream/60'
          }`}
        >
          Labels
        </button>
        <button
          onClick={fullscreen}
          aria-label="เต็มจอ"
          className="flex w-9 items-center justify-center border border-white/15 bg-black/40 text-val-cream/70 backdrop-blur hover:border-val-red hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-4 left-3 hidden font-thai text-[11px] text-val-cream/40 md:block">
        ลากเพื่อหมุน · คลิกขวา/สองนิ้วเพื่อเลื่อน · สกรอลเพื่อซูม
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
      className={`flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] tracking-wider uppercase backdrop-blur transition-colors ${
        active ? 'border-white/60 bg-white/15 text-white' : 'border-white/10 bg-black/40 text-val-cream/60 hover:text-white'
      }`}
    >
      <span className="h-2 w-2 rotate-45" style={{ background: color }} />
      {children}
    </button>
  )
}
