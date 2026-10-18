'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from './LangProvider'

/** แถวเลื่อนแนวนอน + ปุ่ม ◀ ▶ (ซ่อนเองเมื่อสุดทางแล้ว) */
export default function HScroller({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = () => {
    const el = ref.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scroll = (dir: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div ref={ref} onScroll={measure} className={className}>
        {children}
      </div>
      <ArrowButton side="left" hidden={edges.start} onClick={() => scroll(-1)} label={t.common.prev} />
      <ArrowButton side="right" hidden={edges.end} onClick={() => scroll(1)} label={t.common.next} />
    </div>
  )
}

function ArrowButton({ side, hidden, onClick, label }: { side: 'left' | 'right'; hidden: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      tabIndex={hidden ? -1 : 0}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-card text-lg font-bold shadow-[2px_3px_0_var(--color-ink)] transition-all hover:bg-mustard ${
        side === 'left' ? '-left-2 sm:-left-4' : '-right-2 sm:-right-4'
      } ${hidden ? 'pointer-events-none scale-75 opacity-0' : 'opacity-100'}`}
    >
      {side === 'left' ? '◀' : '▶'}
    </button>
  )
}
