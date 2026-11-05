'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * fade-up ตอน scroll เข้ามาในจอ
 *
 * HTML ที่ export ออกมาแสดงการ์ดครบตั้งแต่แรก (ไม่ซ่อนไว้รอ JS)
 * พอ mount แล้วค่อยซ่อนเฉพาะตัวที่อยู่ไกลกว่าขอบจอล่างพอสมควร
 * และเริ่ม fade ก่อนที่การ์ดจะโผล่เข้าจอ — การ์ดที่โผล่มาครึ่งใบที่ขอบล่าง
 * จึงเห็นเสมอ คนจะรู้ว่ายังมีต่อข้างล่าง
 */
const AHEAD = 0.25 // เริ่ม reveal ก่อนถึงขอบจอล่าง 25% ของความสูงจอ

type State = 'static' | 'hidden' | 'shown'

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const ref = useRef<HTMLElement>(null)
  const [state, setState] = useState<State>('static')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // อยู่ในจอหรือใกล้จออยู่แล้ว → แสดงเลย ไม่ต้องเล่นอนิเมชัน
    if (el.getBoundingClientRect().top < window.innerHeight * (1 + AHEAD)) return

    setState('hidden')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown')
          io.disconnect()
        }
      },
      { rootMargin: `0px 0px ${AHEAD * 100}% 0px` },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={className}
      style={
        state === 'static'
          ? undefined
          : {
              transition: 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)',
              transitionDelay: `${delay}ms`,
              opacity: state === 'shown' ? 1 : 0,
              transform: state === 'shown' ? 'none' : 'translateY(14px)',
            }
      }
    >
      {children}
    </Tag>
  )
}
