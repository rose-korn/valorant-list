'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createRenderer, disposeObject, onResize, prefersReducedMotion, runLoop, useWebGLSupport } from './utils'

const COLORS = ['#ff4654', '#ff4654', '#2bb5a0', '#f2b84b', '#8ec5ff']

/** เศษกระดาษสี ๆ ค่อย ๆ ปลิวลง — พื้นหลังหน้าแรกแบบทำมือ */
export default function PaperScene() {
  const ref = useRef<HTMLDivElement>(null)
  const supported = useWebGLSupport()

  useEffect(() => {
    const container = ref.current
    if (!container || !supported) return

    const reduced = prefersReducedMotion()
    const small = container.clientWidth < 768
    const renderer = createRenderer(container)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.z = 14

    // เศษกระดาษรูปทรงบิดเบี้ยวนิด ๆ ไม่ให้ดูเป๊ะเกินไป
    const pieces: { mesh: THREE.Mesh; spin: THREE.Vector3; fall: number; drift: number; phase: number }[] = []
    const count = small ? 14 : 36
    // จอใหญ่: กระจายไว้ริมซ้าย-ขวา ไม่ให้บังตัวหนังสือ / จอเล็ก: จางลงแทน
    const spawnX = () => (small ? (Math.random() - 0.5) * 8 : (Math.random() < 0.5 ? -1 : 1) * (5.5 + Math.random() * 6))
    for (let i = 0; i < count; i++) {
      const shape = new THREE.Shape()
      const s = 0.25 + Math.random() * 0.35
      const tri = Math.random() < 0.45
      shape.moveTo(-s, -s * (0.6 + Math.random() * 0.4))
      shape.lineTo(s * (0.8 + Math.random() * 0.3), -s * 0.7)
      if (tri) shape.lineTo(Math.random() * s * 0.4, s)
      else {
        shape.lineTo(s * (0.7 + Math.random() * 0.3), s * 0.8)
        shape.lineTo(-s * 0.9, s * (0.5 + Math.random() * 0.4))
      }
      shape.closePath()
      const mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: COLORS[i % COLORS.length], side: THREE.DoubleSide, transparent: true, opacity: small ? 0.35 : 0.75 }),
      )
      mesh.position.set(spawnX(), (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6)
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
      scene.add(mesh)
      pieces.push({
        mesh,
        spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.6),
        fall: 0.25 + Math.random() * 0.45,
        drift: 0.3 + Math.random() * 0.6,
        phase: Math.random() * 10,
      })
    }

    const mouse = new THREE.Vector2()
    const onPointer = (e: PointerEvent) => mouse.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    window.addEventListener('pointermove', onPointer, { passive: true })

    const stopResize = onResize(container, (w, h) => {
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })

    const speed = reduced ? 0 : 1
    const stopLoop = runLoop(container, (dt, t) => {
      for (const p of pieces) {
        p.mesh.position.y -= p.fall * dt * speed
        p.mesh.position.x += Math.sin(t * p.drift + p.phase) * dt * 0.4 * speed
        p.mesh.rotation.x += p.spin.x * dt * speed
        p.mesh.rotation.y += p.spin.y * dt * speed
        p.mesh.rotation.z += p.spin.z * dt * speed
        if (p.mesh.position.y < -8) {
          p.mesh.position.y = 8
          p.mesh.position.x = spawnX()
        }
      }
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.03
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    })

    return () => {
      stopLoop()
      stopResize()
      window.removeEventListener('pointermove', onPointer)
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [supported])

  return <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />
}
