'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Drives every home-page animation: hero entrance + scroll reveals,
 * pointer-driven 3D tilt on `[data-tilt]` cards, and hero parallax.
 * `tiltDeps` should list anything that changes which `[data-tilt]` cards
 * are mounted (e.g. the preview arrays), so tilt listeners get rebound.
 */
export function useHomeAnimations(tiltDeps: readonly unknown[]) {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroLeftRef = useRef<HTMLDivElement>(null)
  const heroRightRef = useRef<HTMLDivElement>(null)
  const heroBadgeRef = useRef<HTMLDivElement>(null)

  // ===== entrance + scroll-reveal animations =====
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean }
          const edge = isMobile ? 60 : 130

          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

          if (heroBadgeRef.current) {
            tl.fromTo(
              heroBadgeRef.current,
              { autoAlpha: 0, y: -16 },
              { autoAlpha: 1, y: 0, duration: 0.6 }
            )
          }

          if (heroLeftRef.current) {
            tl.fromTo(
              heroLeftRef.current,
              { autoAlpha: 0, xPercent: -edge, rotateY: isMobile ? 0 : 12 },
              { autoAlpha: 1, xPercent: 0, rotateY: 0, duration: 1.1 },
              '-=0.35'
            )
          }

          if (heroRightRef.current) {
            tl.fromTo(
              heroRightRef.current,
              { autoAlpha: 0, xPercent: edge, rotateY: isMobile ? 0 : -14, scale: 0.9 },
              { autoAlpha: 1, xPercent: 0, rotateY: 0, scale: 1, duration: 1.2 },
              '-=0.9'
            )
          }

          // scroll-revealed sections
          gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
            const dir = el.dataset.reveal
            const fromVars: gsap.TweenVars =
              dir === 'left'
                ? { xPercent: isMobile ? -20 : -40, autoAlpha: 0 }
                : dir === 'right'
                ? { xPercent: isMobile ? 20 : 40, autoAlpha: 0 }
                : { y: 60, autoAlpha: 0 }

            gsap.fromTo(el, fromVars, {
              xPercent: 0,
              y: 0,
              autoAlpha: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
              },
            })
          })

          // staggered grid children
          gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
            const items = group.querySelectorAll('[data-reveal-item]')
            gsap.fromTo(
              items,
              { y: 40, autoAlpha: 0, scale: 0.94 },
              {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                duration: 0.7,
                stagger: 0.06,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: group,
                  start: 'top 88%',
                  once: true,
                },
              }
            )
          })
        }
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  // ===== pointer-driven 3D tilt (desktop / fine pointer only) =====
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!canHover || !rootRef.current) return

    const cards = Array.from(rootRef.current.querySelectorAll<HTMLElement>('[data-tilt]'))
    const cleanups: (() => void)[] = []

    cards.forEach((card) => {
      const strength = Number(card.dataset.tiltStrength ?? 10)
      // quickTo's resetTo() skips alias resolution, so it needs GSAP's
      // canonical property names (rotationX/rotationY), not the rotateX/rotateY aliases.
      const quickX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power3.out' })
      const quickY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power3.out' })
      const quickLiftZ = gsap.quickTo(card, 'z', { duration: 0.4, ease: 'power3.out' })

      const onMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5
        quickY(px * strength)
        quickX(-py * strength)
        quickLiftZ(20)
      }
      const onLeave = () => {
        quickX(0)
        quickY(0)
        quickLiftZ(0)
      }

      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
        gsap.killTweensOf(card)
      })
    })

    return () => cleanups.forEach((fn) => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, tiltDeps)

  // ===== hero parallax on mouse move (featured agent + blobs) =====
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!canHover || !heroRightRef.current) return

    const quickX = gsap.quickTo(heroRightRef.current, 'x', { duration: 0.6, ease: 'power3.out' })
    const quickY = gsap.quickTo(heroRightRef.current, 'y', { duration: 0.6, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      const px = e.clientX / window.innerWidth - 0.5
      const py = e.clientY / window.innerHeight - 0.5
      quickX(px * -24)
      quickY(py * -16)
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.killTweensOf(heroRightRef.current)
    }
  }, [])

  return { rootRef, heroLeftRef, heroRightRef, heroBadgeRef }
}
