'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useI18n } from './LangProvider'
import { FUN_LINKS, NAV_LINKS } from './brand'

// ================= เปิด/ปิดลูกเล่น (เก็บใน localStorage) =================
const FX_KEY = 'valolist:fx'
const FX_EVENT = 'valolist-fx'

function readFx() {
  try {
    return localStorage.getItem(FX_KEY) !== 'off'
  } catch {
    return true
  }
}
function subscribeFx(cb: () => void) {
  window.addEventListener(FX_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(FX_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
function writeFx(on: boolean) {
  try {
    localStorage.setItem(FX_KEY, on ? 'on' : 'off')
  } catch {
    // private mode — ไม่เป็นไร
  }
  window.dispatchEvent(new Event(FX_EVENT))
}

export function useFx() {
  return useSyncExternalStore(subscribeFx, readFx, () => true)
}

/** ปุ่มเปิด/ปิดลูกเล่น (ใช้ใน footer) */
export function FxToggle() {
  const { t } = useI18n()
  const on = useFx()
  return (
    <button
      onClick={() => writeFx(!on)}
      aria-pressed={on}
      className="inline-flex items-center gap-2 rounded-full border-2 border-paper/25 px-3 py-1 text-sm text-paper/80 transition-colors hover:border-mustard hover:text-mustard"
    >
      ✨ {t.fx.toggle}: <b>{on ? t.fx.on : t.fx.off}</b>
    </button>
  )
}

/** ลูกเล่นทั้งเว็บ: แถบ spike ตาม scroll, kill feed ตอนเปลี่ยนหน้า, hit marker ตอนคลิก, easter egg ACE */
export default function FunLayer() {
  const on = useFx()
  const reduced = useSyncExternalStore(
    () => () => {},
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )

  // เคอร์เซอร์เป้าเล็ง (เฉพาะเมาส์) — เปิดด้วย class บน <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('fx-cursor', on)
    return () => root.classList.remove('fx-cursor')
  }, [on])

  if (!on) return null
  return (
    <>
      <SpikeBar />
      <KillFeed />
      {!reduced && <HitMarkers />}
      <AceEgg reduced={reduced} />
    </>
  )
}

// ================= แถบ spike ตามการเลื่อนหน้า =================
function SpikeBar() {
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 40 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const done = progress > 0.985
  if (progress <= 0) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-16 z-40 h-1">
      <div className={`h-full transition-colors duration-300 ${done ? 'bg-teal' : 'bg-red'}`} style={{ width: `${progress * 100}%` }} />
      {/* หัว spike วิ่งตามแถบ */}
      <span
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-ink ${done ? 'bg-teal' : 'bg-red'}`}
        style={{ left: `${progress * 100}%` }}
      />
      {done && (
        <span className="absolute top-2 right-3 animate-fade-in rounded-full border-2 border-ink bg-teal px-2.5 py-0.5 font-display text-xs font-bold text-ink shadow-[2px_3px_0_var(--color-ink)]">
          {t.fx.defused}
        </span>
      )}
    </div>
  )
}

// ================= kill feed ตอนเปลี่ยนหน้า =================
const LINKS = [...NAV_LINKS, ...FUN_LINKS]

function KillFeed() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [prev, setPrev] = useState({ path: pathname, seq: 0 })
  const [feed, setFeed] = useState<{ id: number; to: string; emoji: string }[]>([])

  // เปลี่ยนหน้าเมื่อไหร่ เพิ่มรายการใหม่ (ปรับ state ระหว่าง render ตามแนวทางของ React แทนการใช้ effect)
  if (prev.path !== pathname) {
    const seq = prev.seq + 1
    setPrev({ path: pathname, seq })
    const link = LINKS.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    const to = link ? t.nav[link.key] : t.nav.home
    setFeed((f) => [...f.slice(-2), { id: seq, to, emoji: link?.emoji ?? '🏠' }])
  }

  // ลบรายการเก่าทีละอันหลังโชว์ ~2.8 วิ
  useEffect(() => {
    if (!feed.length) return
    const timer = window.setTimeout(() => setFeed((f) => f.slice(1)), 2800)
    return () => window.clearTimeout(timer)
  }, [feed])

  return (
    <div aria-live="polite" className="pointer-events-none fixed top-20 right-3 z-40 flex flex-col items-end gap-1.5">
      {feed.map((f) => (
        <div
          key={f.id}
          className="flex animate-[feed-in_.35s_cubic-bezier(.2,.7,.2,1)_both] items-center gap-2 rounded-md border-2 border-red bg-night/90 px-2.5 py-1 text-sm text-paper shadow-[2px_3px_0_var(--color-ink)]"
        >
          <span className="font-display font-bold text-teal">{t.fx.you}</span>
          <svg viewBox="0 0 40 16" className="h-3.5 w-9 fill-paper" aria-hidden>
            <path d="M2 6h24l4-3h8v4h-6l-2 3h-6l-1 4h-4l1-4H2z" />
          </svg>
          <span className="font-display font-bold">
            {f.emoji} {f.to}
          </span>
        </div>
      ))}
    </div>
  )
}

// ================= hit marker ตอนคลิก =================
function HitMarkers() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = document.createElement('div')
      el.className = 'fx-hit'
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      document.body.appendChild(el)
      window.setTimeout(() => el.remove(), 380)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])
  return null
}

// ================= easter egg: พิมพ์ "ace" หรือแตะโลโก้ 5 ครั้ง =================
function AceEgg({ reduced }: { reduced: boolean }) {
  const { t } = useI18n()
  const [show, setShow] = useState(0)
  const typed = useRef('')
  const taps = useRef<number[]>([])

  useEffect(() => {
    const fire = () => setShow((n) => n + 1)
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable]')) return
      typed.current = (typed.current + e.key.toLowerCase()).slice(-3)
      if (typed.current === 'ace') fire()
    }
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest('[data-logo]')) return
      const now = Date.now()
      taps.current = [...taps.current.filter((x) => now - x < 1500), now]
      if (taps.current.length >= 5) {
        taps.current = []
        e.preventDefault()
        fire()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick, true)
    }
  }, [])

  useEffect(() => {
    if (!show) return
    const timer = window.setTimeout(() => setShow(0), 2200)
    return () => window.clearTimeout(timer)
  }, [show])

  if (!show) return null
  const colors = ['#ff4654', '#f2b84b', '#2bb5a0', '#8ec5ff', '#1d1f24']
  return (
    <div key={show} aria-live="assertive" className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
      {!reduced &&
        Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className="fx-confetti absolute top-1/2 left-1/2 h-3 w-2"
            style={
              {
                background: colors[i % colors.length],
                '--dx': `${Math.cos((i / 36) * Math.PI * 2) * (180 + (i % 5) * 60)}px`,
                '--dy': `${Math.sin((i / 36) * Math.PI * 2) * (140 + (i % 4) * 50) - 60}px`,
                '--r': `${(i * 47) % 360}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      <div className="fx-stamp rounded-2xl border-4 border-ink bg-red px-10 py-5 text-center shadow-[6px_8px_0_var(--color-ink)]">
        <p className="font-display text-7xl leading-none font-bold text-white md:text-8xl">{t.fx.ace}</p>
        <p className="hand mt-1 text-xl !text-paper">{t.fx.aceSub}</p>
      </div>
    </div>
  )
}
