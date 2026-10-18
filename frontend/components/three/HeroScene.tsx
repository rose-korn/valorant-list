'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createRenderer, disposeObject, hasWebGL, makeGlowTexture, onResize, prefersReducedMotion, runLoop } from './utils'

/**
 * ฉากพื้นหลังหน้าแรก: พื้น grid แบบ synthwave, รูปทรง low-poly ลอยหมุน,
 * ประกาย radianite ลอยขึ้น และกล้องขยับตามเมาส์/การเอียงเครื่อง
 */
export default function HeroScene({ accent = '#ff4654' }: { accent?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container || !hasWebGL()) return

    const reduced = prefersReducedMotion()
    const isSmall = container.clientWidth < 768
    const renderer = createRenderer(container)
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0f1923, 0.045)

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200)
    camera.position.set(0, 2.2, 12)

    const red = new THREE.Color(accent)
    const cream = new THREE.Color('#ece8e1')
    const teal = new THREE.Color('#3fe3c6')

    // ---------- พื้น grid ที่เลื่อนเข้าหากล้อง ----------
    const grid = new THREE.GridHelper(120, 60, red, red)
    const gridMat = grid.material as THREE.LineBasicMaterial
    gridMat.transparent = true
    gridMat.opacity = 0.22
    grid.position.y = -3
    scene.add(grid)

    // ---------- รูปทรง low-poly ----------
    const shapes = new THREE.Group()
    const geos = [
      new THREE.IcosahedronGeometry(1.6, 0),
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.TetrahedronGeometry(0.9, 0),
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.IcosahedronGeometry(0.7, 0),
    ]
    const layout: [number, number, number][] = [
      [isSmall ? 0 : 3.8, 0.8, -1],
      [-5.5, 2.4, -4],
      [6.5, -0.6, -6],
      [-3, -1.2, 1.5],
      [1.5, 3.4, -7],
    ]
    geos.forEach((geo, i) => {
      const color = i === 0 ? red : i % 2 ? cream : red
      const solid = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: 0x0f1923,
          emissive: color,
          emissiveIntensity: i === 0 ? 0.18 : 0.08,
          metalness: 0.6,
          roughness: 0.3,
          flatShading: true,
          transparent: true,
          opacity: 0.85,
        }),
      )
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: i === 0 ? 0.95 : 0.6 }),
      )
      const g = new THREE.Group()
      g.add(solid, edges)
      g.position.set(...layout[i])
      g.userData = { speed: 0.2 + i * 0.07, phase: i * 1.3, baseY: layout[i][1] }
      shapes.add(g)
    })
    scene.add(shapes)

    // วงแหวนรอบรูปทรงหลัก
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.015, 8, 120),
      new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: 0.6 }),
    )
    ring.position.copy(shapes.children[0].position)
    ring.rotation.x = Math.PI / 2.4
    scene.add(ring)
    const ring2 = ring.clone()
    ring2.scale.setScalar(1.25)
    ring2.material = new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: 0.25 })
    scene.add(ring2)

    // ---------- particles ----------
    const count = isSmall ? 350 : 900
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 16 - 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4
      const c = Math.random() < 0.7 ? red : Math.random() < 0.5 ? cream : teal
      colors.set([c.r, c.g, c.b], i * 3)
      speeds[i] = 0.2 + Math.random() * 0.8
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const glow = makeGlowTexture()
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.14,
        map: glow,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    scene.add(particles)

    // ---------- แสง ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const key = new THREE.PointLight(red, 60, 30)
    key.position.set(4, 4, 4)
    scene.add(key)
    const rim = new THREE.PointLight(teal, 30, 30)
    rim.position.set(-6, 2, -2)
    scene.add(rim)

    // ---------- input ----------
    const target = new THREE.Vector2()
    const onPointer = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      target.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })

    let scrollY = 0
    const onScroll = () => (scrollY = window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })

    const stopResize = onResize(container, (w, h) => {
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })

    const motion = reduced ? 0.15 : 1
    const stopLoop = runLoop(container, (dt, t) => {
      grid.position.z = ((t * 1.2 * motion) % 2) - 0
      shapes.children.forEach((g) => {
        const { speed, phase, baseY } = g.userData as { speed: number; phase: number; baseY: number }
        g.rotation.x += dt * speed * 0.6 * motion
        g.rotation.y += dt * speed * motion
        g.position.y = baseY + Math.sin(t * speed * 2 + phase) * 0.3 * motion
      })
      ring.position.y = shapes.children[0].position.y
      ring2.position.y = ring.position.y
      ring.rotation.z += dt * 0.4 * motion
      ring2.rotation.z -= dt * 0.25 * motion

      const pos = pGeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        let y = pos.getY(i) + dt * speeds[i] * 0.6 * motion
        if (y > 12) y = -4
        pos.setY(i, y)
      }
      pos.needsUpdate = true

      camera.position.x += (target.x * 1.6 - camera.position.x) * 0.04
      camera.position.y += (2.2 - target.y * 0.8 - scrollY * 0.004 - camera.position.y) * 0.04
      camera.lookAt(0, 0.5 - scrollY * 0.003, 0)
      renderer.render(scene, camera)
    })

    return () => {
      stopLoop()
      stopResize()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
      window.removeEventListener('scroll', onScroll)
      disposeObject(scene)
      glow.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [accent])

  return <div ref={ref} className="absolute inset-0" aria-hidden />
}
