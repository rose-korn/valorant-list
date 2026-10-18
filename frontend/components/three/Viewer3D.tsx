'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  createRenderer,
  disposeObject,
  loadTexture,
  makeGlowTexture,
  onResize,
  prefersReducedMotion,
  runLoop,
  textureAspect,
  useWebGLSupport,
} from './utils'

type Variant = 'weapon' | 'card' | 'emblem'

interface Props {
  src: string | null | undefined
  accent?: string
  variant?: Variant
  className?: string
  alt?: string
  /** แสดงแถบปุ่มควบคุม */
  controls?: boolean
  /** ให้ผู้ใช้ลาก/ซูมได้ไหม (ปิดไว้สำหรับ preview เล็ก ๆ) */
  interactive?: boolean
}

const VARIANT = {
  weapon: { size: 6.4, depth: 0.32, layers: 18, distance: 8.5 },
  card: { size: 5.2, depth: 0.08, layers: 6, distance: 8 },
  emblem: { size: 4.2, depth: 0.45, layers: 20, distance: 8 },
} satisfies Record<Variant, { size: number; depth: number; layers: number; distance: number }>

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ชั้นหน้า/หลังแสดงภาพเต็ม + แสงกวาดแบบโฮโลแกรม, ชั้นกลางเป็นสีเข้มอมสี accent ให้ดูเหมือนมีความหนา
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float uTime;
  uniform float uEdge;
  uniform vec3 uAccent;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    if (c.a < 0.4) discard;
    vec3 col;
    if (uEdge > 0.5) {
      col = mix(c.rgb * 0.18, uAccent * 0.45, 0.55);
    } else {
      float band = fract((vUv.x * 0.7 + vUv.y * 0.3) - uTime * 0.22);
      float sweep = smoothstep(0.0, 0.05, band) * (1.0 - smoothstep(0.05, 0.12, band));
      col = c.rgb + sweep * 0.35 * mix(vec3(1.0), uAccent, 0.4);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export default function Viewer3D({
  src,
  accent = '#ff4654',
  variant = 'weapon',
  className = '',
  alt = '',
  controls = true,
  interactive = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const api = useRef<{
    setSrc: (src: string) => void
    setAuto: (v: boolean) => void
    reset: () => void
  } | null>(null)
  const supported = useWebGLSupport()
  const [loading, setLoading] = useState(true)
  const [auto, setAuto] = useState(true)
  const [error, setError] = useState(false)

  // สร้างฉากครั้งเดียว ต่อ variant/accent
  useEffect(() => {
    const container = ref.current
    if (!container || !supported) return

    const cfg = VARIANT[variant]
    const reduced = prefersReducedMotion()
    const renderer = createRenderer(container)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100)
    const home = new THREE.Vector3(variant === 'weapon' ? 2.2 : 1.6, 0.9, cfg.distance)
    camera.position.copy(home)

    const accentColor = new THREE.Color(accent)

    const orbit = new OrbitControls(camera, renderer.domElement)
    orbit.enableDamping = true
    orbit.dampingFactor = 0.08
    orbit.enablePan = false
    orbit.minDistance = cfg.distance * 0.45
    orbit.maxDistance = cfg.distance * 1.8
    orbit.autoRotate = !reduced
    orbit.autoRotateSpeed = 1.6
    orbit.enabled = interactive
    orbit.target.set(0, 0, 0)

    // ---------- object ----------
    const object = new THREE.Group()
    scene.add(object)
    const time = { value: 0 }

    // ---------- ฐานวงแหวน + particles ----------
    const stage = new THREE.Group()
    const ringGeo = new THREE.RingGeometry(2.6, 2.66, 96)
    const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    const ringA = new THREE.Mesh(ringGeo, ringMat)
    ringA.rotation.x = -Math.PI / 2
    const ringB = new THREE.Mesh(
      new THREE.RingGeometry(3.1, 3.13, 6),
      new THREE.MeshBasicMaterial({ color: 0xece8e1, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    )
    ringB.rotation.x = -Math.PI / 2
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.07, side: THREE.DoubleSide }),
    )
    disc.rotation.x = -Math.PI / 2
    stage.add(ringA, ringB, disc)

    const glow = makeGlowTexture()
    const pCount = 160
    const pPos = new Float32Array(pCount * 3)
    const pSeed = new Float32Array(pCount)
    for (let i = 0; i < pCount; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 2 + Math.random() * 1.6
      pPos.set([Math.cos(a) * r, Math.random() * 5, Math.sin(a) * r], i * 3)
      pSeed[i] = Math.random()
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const sparks = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: accentColor,
        size: 0.09,
        map: glow,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    stage.add(sparks)
    scene.add(stage)

    let halfHeight = 1.5
    let token = 0

    const build = (tex: THREE.Texture) => {
      disposeObject(object)
      object.clear()
      const aspect = textureAspect(tex)
      const w = aspect >= 1 ? cfg.size : cfg.size * aspect
      const h = w / aspect
      halfHeight = h / 2
      const geo = new THREE.PlaneGeometry(w, h)
      const face = new THREE.ShaderMaterial({
        uniforms: { map: { value: tex }, uTime: time, uEdge: { value: 0 }, uAccent: { value: accentColor } },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      })
      const edge = face.clone()
      edge.uniforms.map.value = tex
      edge.uniforms.uTime = time
      edge.uniforms.uEdge = { value: 1 }
      edge.uniforms.uAccent = { value: accentColor }

      for (let i = 0; i < cfg.layers; i++) {
        const isFace = i === 0 || i === cfg.layers - 1
        const mesh = new THREE.Mesh(geo, isFace ? face : edge)
        mesh.position.z = (i / (cfg.layers - 1) - 0.5) * cfg.depth
        // ให้ชั้นหลังกลับด้าน เพื่อมองจากด้านหลังแล้วภาพไม่กลับซ้ายขวา
        if (i === 0) mesh.rotation.y = Math.PI
        mesh.renderOrder = isFace ? 1 : 0
        object.add(mesh)
      }
      stage.position.y = -halfHeight - 0.5
    }

    const setSrc = (url: string) => {
      const my = ++token
      setLoading(true)
      setError(false)
      loadTexture(url)
        .then((tex) => {
          if (my !== token) return
          build(tex)
          setLoading(false)
          // pop-in
          object.scale.setScalar(0.6)
        })
        .catch(() => {
          if (my !== token) return
          setLoading(false)
          setError(true)
        })
    }

    const reset = () => {
      camera.position.copy(home)
      orbit.target.set(0, 0, 0)
      orbit.update()
    }

    api.current = {
      setSrc,
      setAuto: (v) => (orbit.autoRotate = v),
      reset,
    }

    const fit = (w: number, h: number) => {
      camera.aspect = w / h
      // จอแนวตั้ง (มือถือ) ขยายมุมกล้องให้เห็นทั้งชิ้น
      camera.fov = camera.aspect < 1 ? (variant === 'weapon' ? 62 : 46) : 35
      camera.updateProjectionMatrix()
    }
    fit(container.clientWidth, container.clientHeight)
    const stopResize = onResize(container, (w, h) => {
      renderer.setSize(w, h)
      fit(w, h)
    })

    const one = new THREE.Vector3(1, 1, 1)
    const stopLoop = runLoop(container, (dt, t) => {
      time.value = t
      object.scale.lerp(one, 0.12)
      if (variant === 'emblem' && !reduced) object.position.y = Math.sin(t * 1.4) * 0.15
      ringA.rotation.z += dt * 0.5
      ringB.rotation.z -= dt * 0.3
      const pos = pGeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pCount; i++) {
        let y = pos.getY(i) + dt * (0.3 + pSeed[i] * 0.6)
        if (y > halfHeight * 2 + 1.5) y = 0
        pos.setY(i, y)
      }
      pos.needsUpdate = true
      orbit.update(dt)
      renderer.render(scene, camera)
    })

    return () => {
      api.current = null
      stopLoop()
      stopResize()
      orbit.dispose()
      disposeObject(scene)
      glow.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [variant, accent, interactive, supported])

  // เปลี่ยนรูปโดยไม่สร้างฉากใหม่
  useEffect(() => {
    if (src && api.current) api.current.setSrc(src)
  }, [src, variant, accent, interactive, supported])

  const toggleAuto = () => {
    setAuto((v) => {
      api.current?.setAuto(!v)
      return !v
    })
  }

  const fullscreen = () => {
    const el = ref.current?.parentElement
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  if (!supported) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {src && <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />}
      </div>
    )
  }

  return (
    <div className={`relative bg-val-ink ${className}`}>
      <div ref={ref} className="absolute inset-0" role="img" aria-label={alt ? `${alt} — 3D view` : '3D view'} />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-10 w-10 animate-spin border-2 border-val-red border-t-transparent" />
        </div>
      )}
      {error && src && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
        </div>
      )}

      {controls && interactive && (
        <>
          <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 text-[10px] tracking-[0.25em] text-val-cream/50 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse bg-val-red" />
            3D View
          </div>
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            <ViewerButton onClick={toggleAuto} active={auto} label={auto ? 'หยุดหมุน' : 'หมุนอัตโนมัติ'}>
              <path d="M12 4a8 8 0 1 0 8 8" />
              <path d="M20 4v4h-4" />
            </ViewerButton>
            <ViewerButton onClick={() => api.current?.reset()} label="รีเซ็ตมุมกล้อง">
              <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
              <circle cx="12" cy="12" r="3" />
            </ViewerButton>
            <ViewerButton onClick={fullscreen} label="เต็มจอ">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </ViewerButton>
          </div>
          <p className="pointer-events-none absolute bottom-4 left-3 hidden font-thai text-[11px] text-val-cream/40 sm:block">
            ลากเพื่อหมุน · สกรอล/บีบเพื่อซูม
          </p>
        </>
      )}
    </div>
  )
}

function ViewerButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center border backdrop-blur transition-colors ${
        active ? 'border-val-red bg-val-red/20 text-white' : 'border-white/15 bg-black/30 text-val-cream/70 hover:border-val-red hover:text-white'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {children}
      </svg>
    </button>
  )
}
