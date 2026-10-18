import { useSyncExternalStore } from 'react'
import * as THREE from 'three'

const textureCache = new Map<string, Promise<THREE.Texture>>()

function loadWith(loader: THREE.TextureLoader, url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject))
}

/**
 * โหลด texture จาก media.valorant-api.com
 * ลองโหลดตรงก่อน (crossOrigin anonymous) ถ้าโดน CORS จะ fallback ไปที่ /api/media proxy
 */
export function loadTexture(url: string): Promise<THREE.Texture> {
  const cached = textureCache.get(url)
  if (cached) return cached

  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  const promise = loadWith(loader, url)
    .catch(() => loadWith(loader, `/api/media?u=${encodeURIComponent(url)}`))
    .then((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      return tex
    })
  promise.catch(() => textureCache.delete(url))
  textureCache.set(url, promise)
  return promise
}

export function textureAspect(tex: THREE.Texture) {
  const img = tex.image as { width?: number; height?: number } | undefined
  return img?.width && img?.height ? img.width / img.height : 1
}

let webglSupport: boolean | null = null

export function hasWebGL() {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    webglSupport = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

const noopSubscribe = () => () => {}

/** true ระหว่าง SSR/hydration แล้วค่อยเช็คจริงบน client */
export function useWebGLSupport() {
  return useSyncExternalStore(noopSubscribe, hasWebGL, () => true)
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function createRenderer(container: HTMLElement, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  container.appendChild(renderer.domElement)
  return renderer
}

/**
 * ลูป render ที่หยุดเองเมื่อ canvas ไม่อยู่ในจอหรือแท็บถูกซ่อน (ประหยัดแบตมือถือ)
 * คืนฟังก์ชัน cleanup
 */
export function runLoop(container: HTMLElement, frame: (dt: number, t: number) => void) {
  const clock = new THREE.Clock()
  let raf = 0
  let visible = true

  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible || document.hidden) return
    const dt = Math.min(clock.getDelta(), 0.05)
    frame(dt, clock.elapsedTime)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) clock.getDelta()
  })
  io.observe(container)
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
  }
}

export function onResize(container: HTMLElement, cb: (w: number, h: number) => void) {
  const ro = new ResizeObserver(() => cb(container.clientWidth, container.clientHeight))
  ro.observe(container)
  return () => ro.disconnect()
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    mesh.geometry?.dispose()
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat?.dispose()
  })
}
