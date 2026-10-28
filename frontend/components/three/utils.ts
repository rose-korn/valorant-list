import { useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { withProxyFallback } from '@/lib/media'

const textureCache = new Map<string, Promise<THREE.Texture>>()

function loadWith(loader: THREE.TextureLoader, url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject))
}

/**
 * โหลด texture จาก media.valorant-api.com
 * ลองโหลดตรงก่อน (crossOrigin anonymous) ถ้าโดน CORS จะ fallback ไปที่ media proxy (ถ้าตั้งไว้)
 */
export function loadTexture(url: string): Promise<THREE.Texture> {
  const cached = textureCache.get(url)
  if (cached) return cached

  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  const promise = withProxyFallback(url, (u) => loadWith(loader, u))
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

/** ขอบเขตส่วนที่ทึบของภาพ เป็นค่า UV (v นับจากล่าง ตาม flipY ของ texture) */
export interface UvBounds {
  u0: number
  v0: number
  u1: number
  v1: number
}

const FULL: UvBounds = { u0: 0, v0: 0, u1: 1, v1: 1 }
const boundsCache = new WeakMap<object, UvBounds>()

/**
 * หาขอบของส่วนที่ทึบในภาพ — ภาพเต็มตัวของเอเจนท์แต่ละตัวเว้นขอบใสไม่เท่ากัน
 * ถ้าไม่ตัดออก บางตัวจะดูเล็ก/ไกลกว่าตัวอื่น (อ่าน pixel ไม่ได้ก็คืนทั้งภาพ)
 */
export function opaqueBounds(tex: THREE.Texture, alphaMin = 0.45): UvBounds {
  const img = tex.image as CanvasImageSource & { width: number; height: number }
  if (!img?.width || !img?.height) return FULL
  const cached = boundsCache.get(img)
  if (cached) return cached

  let found = FULL
  try {
    const scale = Math.min(1, 256 / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const ctx = Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d', { willReadFrequently: true })
    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data
      const min = alphaMin * 255
      let x0 = w, y0 = h, x1 = -1, y1 = -1
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] < min) continue
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
      if (x1 >= x0 && y1 >= y0) found = { u0: x0 / w, u1: (x1 + 1) / w, v0: 1 - (y1 + 1) / h, v1: 1 - y0 / h }
    }
  } catch {
    // canvas ติด CORS → ใช้ทั้งภาพ
  }
  boundsCache.set(img, found)
  return found
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
