'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  createRenderer,
  disposeObject,
  loadTexture,
  onResize,
  prefersReducedMotion,
  runLoop,
  textureAspect,
  useWebGLSupport,
} from './utils'
import { useI18n } from '../LangProvider'

type Variant = 'weapon' | 'card' | 'emblem'

interface Props {
  src: string | null | undefined
  accent?: string
  variant?: Variant
  className?: string
  alt?: string
  /** แสดงปุ่มควบคุม */
  controls?: boolean
}

// size = ความกว้าง/สูงสุดของชิ้นงาน, depth = ความหนาหลอก, sway = มุมโยกซ้ายขวา (เรเดียน)
const VARIANT = {
  weapon: { size: 6, depth: 0.14, layers: 10, sway: 0.38 },
  card: { size: 5, depth: 0.05, layers: 4, sway: 0.42 },
  emblem: { size: 4, depth: 0.3, layers: 14, sway: 0.5 },
} satisfies Record<Variant, { size: number; depth: number; layers: number; sway: number }>

// จำกัดมุมกล้อง ไม่ให้หมุนไปเห็นด้านข้าง/ด้านหลังจนชิ้นงานดูแบนหรือทะลุกัน
const AZIMUTH_LIMIT = 0.75
const POLAR_MIN = Math.PI / 2 - 0.45
const POLAR_MAX = Math.PI / 2 + 0.35

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ชั้นหน้าแสดงภาพจริง + แสงกวาดจาง ๆ, ชั้นในเป็นสีเข้มให้ดูมีความหนา
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float uTime;
  uniform float uEdge;
  uniform vec3 uAccent;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    if (c.a < 0.45) discard;
    vec3 col;
    if (uEdge > 0.5) {
      col = mix(c.rgb * 0.25, uAccent * 0.3, 0.4);
    } else {
      float band = fract((vUv.x * 0.8 + vUv.y * 0.2) - uTime * 0.12);
      float sweep = smoothstep(0.0, 0.06, band) * (1.0 - smoothstep(0.06, 0.14, band));
      col = c.rgb + sweep * 0.14;
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function makeFloorTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,240,220,0.22)')
  g.addColorStop(1, 'rgba(255,240,220,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Viewer3D({ src, accent = '#ff4654', variant = 'weapon', className = '', alt = '', controls = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const api = useRef<{ setSrc: (src: string) => void; setSway: (v: boolean) => void; reset: () => void } | null>(null)
  const supported = useWebGLSupport()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [sway, setSway] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const container = ref.current
    if (!container || !supported) return

    const cfg = VARIANT[variant]
    const reduced = prefersReducedMotion()
    const renderer = createRenderer(container)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 100)
    const accentColor = new THREE.Color(accent)

    const orbit = new OrbitControls(camera, renderer.domElement)
    orbit.enableDamping = true
    orbit.dampingFactor = 0.1
    orbit.enablePan = false
    orbit.minAzimuthAngle = -AZIMUTH_LIMIT
    orbit.maxAzimuthAngle = AZIMUTH_LIMIT
    orbit.minPolarAngle = POLAR_MIN
    orbit.maxPolarAngle = POLAR_MAX

    const object = new THREE.Group()
    scene.add(object)
    const time = { value: 0 }

    // แสงพื้นนุ่ม ๆ ใต้ชิ้นงาน (อยู่ต่ำกว่าชิ้นงานเสมอ ไม่ชนกัน)
    const floorTex = makeFloorTexture()
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false }),
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    let objW = cfg.size
    let objH = cfg.size
    let swaying = !reduced
    let userMoved = false
    let token = 0

    // คำนวณระยะกล้องให้ชิ้นงานพอดีจอทุกขนาด (กันล้นขอบบนมือถือ)
    const home = new THREE.Vector3()
    const fit = () => {
      const vFov = THREE.MathUtils.degToRad(camera.fov)
      const tan = Math.tan(vFov / 2)
      const dist = Math.max(objH / 2 / tan, objW / 2 / (tan * camera.aspect)) * 1.3 + cfg.depth
      home.set(0, objH * 0.06, dist)
      orbit.minDistance = dist * 0.55
      orbit.maxDistance = dist * 1.5
      if (!userMoved) {
        camera.position.copy(home)
        orbit.target.set(0, 0, 0)
        orbit.update()
      }
    }

    const build = (tex: THREE.Texture) => {
      disposeObject(object)
      object.clear()
      const aspect = textureAspect(tex)
      objW = aspect >= 1 ? cfg.size : cfg.size * aspect
      objH = objW / aspect
      const geo = new THREE.PlaneGeometry(objW, objH)
      const uniforms = (edge: number) => ({ map: { value: tex }, uTime: time, uEdge: { value: edge }, uAccent: { value: accentColor } })
      const face = new THREE.ShaderMaterial({ uniforms: uniforms(0), vertexShader, fragmentShader, side: THREE.DoubleSide })
      const edge = new THREE.ShaderMaterial({ uniforms: uniforms(1), vertexShader, fragmentShader, side: THREE.DoubleSide })

      for (let i = 0; i < cfg.layers; i++) {
        const isFront = i === cfg.layers - 1
        const mesh = new THREE.Mesh(geo, isFront ? face : edge)
        mesh.position.z = (i / (cfg.layers - 1) - 0.5) * cfg.depth
        object.add(mesh)
      }
      floor.scale.set(objW * 0.9, Math.max(objW * 0.35, 1.2), 1)
      floor.position.y = -objH / 2 - 0.35
      fit()
    }

    const setSrc = (url: string) => {
      const my = ++token
      setLoading(true)
      setError(false)
      loadTexture(url)
        .then((tex) => {
          if (my !== token) return
          build(tex)
          object.scale.setScalar(0.9)
          setLoading(false)
        })
        .catch(() => {
          if (my !== token) return
          setLoading(false)
          setError(true)
        })
    }

    const reset = () => {
      userMoved = false
      object.rotation.set(0, 0, 0)
      fit()
    }

    const onStart = () => {
      userMoved = true
    }
    orbit.addEventListener('start', onStart)

    api.current = {
      setSrc,
      setSway: (v) => (swaying = v && !reduced),
      reset,
    }

    const stopResize = onResize(container, (w, h) => {
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      fit()
    })

    const one = new THREE.Vector3(1, 1, 1)
    const stopLoop = runLoop(container, (_dt, t) => {
      time.value = reduced ? 0 : t
      object.scale.lerp(one, 0.15)
      // โยกเบา ๆ ซ้ายขวา แทนการหมุนรอบตัว 360°
      const targetY = swaying ? Math.sin(t * 0.6) * cfg.sway : 0
      const targetX = swaying ? Math.sin(t * 0.45) * 0.06 : 0
      object.rotation.y += (targetY - object.rotation.y) * 0.05
      object.rotation.x += (targetX - object.rotation.x) * 0.05
      if (variant === 'emblem' && swaying) object.position.y = Math.sin(t * 1.2) * 0.12
      orbit.update()
      renderer.render(scene, camera)
    })

    return () => {
      api.current = null
      stopLoop()
      stopResize()
      orbit.removeEventListener('start', onStart)
      orbit.dispose()
      disposeObject(scene)
      floorTex.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [variant, accent, supported])

  // เปลี่ยนรูปโดยไม่สร้างฉากใหม่
  useEffect(() => {
    if (src && api.current) api.current.setSrc(src)
  }, [src, variant, accent, supported])

  const toggleSway = () => {
    const next = !sway
    setSway(next)
    api.current?.setSway(next)
  }

  const fullscreen = () => {
    const el = ref.current?.parentElement
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  if (!supported) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        {src && <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="absolute inset-0" role="img" aria-label={alt ? `${alt} (3D)` : '3D'} />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="hand animate-pulse text-lg !text-paper/70">{t.viewer.loading}</span>
        </div>
      )}
      {error && src && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
        </div>
      )}

      {controls && (
        <>
          <p className="hand pointer-events-none absolute top-3 left-4 -rotate-2 text-base !text-mustard">{t.viewer.hint}</p>
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            <ViewerButton onClick={toggleSway} label={sway ? t.viewer.pause : t.viewer.resume} />
            <ViewerButton onClick={() => api.current?.reset()} label={t.viewer.reset} />
            <ViewerButton onClick={fullscreen} label={t.viewer.fullscreen} />
          </div>
        </>
      )}
    </div>
  )
}

function ViewerButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-2 border-paper/30 bg-night/70 px-2.5 py-1 text-sm text-paper/90 backdrop-blur transition-colors hover:border-mustard hover:text-mustard"
    >
      {label}
    </button>
  )
}
