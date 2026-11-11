'use client'

import Link from '@/components/Link'
import { useEffect, useRef, useState } from 'react'
import { FUN_LINKS, Logo, NAV_LINKS, isLinkActive } from './brand'
import { LangSwitch, useBarePath, useI18n } from './LangProvider'
import { useScrollLock } from './useScrollLock'

export default function Navbar() {
  const pathname = useBarePath()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // เมนูกลุ่ม "เล่น" บนจอใหญ่
  const [playOpen, setPlayOpen] = useState(false)
  const playRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ล็อก scroll ตอนเปิดเมนูมือถือ
  useScrollLock(open)

  // ปิดเมนู "เล่น" เมื่อกดลิงก์ / คลิกข้างนอก / กด Esc
  useEffect(() => {
    if (!playOpen) return
    const onDown = (e: PointerEvent) => {
      if (!playRef.current?.contains(e.target as Node)) setPlayOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlayOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [playOpen])

  const isActive = (href: string) => isLinkActive(pathname, href)
  const playActive = FUN_LINKS.some((l) => isActive(l.href))

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 border-b-[1.5px] bg-paper/95 backdrop-blur transition-[border-color] ${
          scrolled || open ? 'border-blue' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label={t.nav.home} data-logo onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <ul className="hidden items-center xl:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative block px-2.5 py-1.5 font-display font-semibold whitespace-nowrap transition-colors ${
                    isActive(link.href) ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {/* หน้าปัจจุบัน: ไฮไลต์ปากกาแดงจาง ๆ แบบขีดในสมุด */}
                  <span className={isActive(link.href) ? 'mark' : ''}>{t.nav[link.key]}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* กลุ่ม "เล่น": ปุ่มเดียว กดแล้วกางรายการ */}
            <div ref={playRef} className="relative hidden xl:block">
              <button
                onClick={() => setPlayOpen((v) => !v)}
                aria-expanded={playOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 border-[1.5px] border-ink px-3 py-1 font-display text-sm font-semibold whitespace-nowrap transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[2px_2px_0_var(--color-blue)] ${
                  playActive ? 'bg-ink text-paper' : 'bg-pink'
                }`}
              >
                {t.nav.groupPlay}
                <svg viewBox="0 0 12 8" className={`h-2 w-3 transition-transform ${playOpen ? 'rotate-180' : ''}`} aria-hidden>
                  <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <ul
                className={`card absolute top-full right-0 mt-2 w-60 p-1.5 transition-[opacity,transform] ${
                  playOpen ? 'opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
              >
                {FUN_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      tabIndex={playOpen ? undefined : -1}
                      onClick={() => setPlayOpen(false)}
                      className={`block rounded-md px-3 py-2 font-display font-semibold ${isActive(link.href) ? 'bg-pink' : 'hover:bg-paper-2'}`}
                    >
                      {t.nav[link.key]}
                      <span className="block text-xs font-normal text-ink-soft">{t.nav.notes[link.key]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <LangSwitch />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
              className="btn btn-paper !px-3 !py-1.5 text-sm xl:hidden"
            >
              {open ? t.nav.close : t.nav.menu}
            </button>
          </div>
        </div>
      </nav>

      {/* เมนูมือถือ */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-opacity duration-300 xl:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="dotted-bg flex h-full flex-col overflow-y-auto px-6 pt-24 pb-10">
          <p className="kicker mb-1">Contents</p>
          <p className="mb-5 text-ink-soft">{t.nav.menuNote}</p>
          {(
            [
              [t.nav.groupPlay, FUN_LINKS, 0],
              [t.nav.groupData, NAV_LINKS, FUN_LINKS.length],
            ] as const
          ).map(([title, links, offset]) => (
            <section key={title} className="mb-6">
              <h2 className="mb-2 font-display text-sm font-bold text-blue">{title}</h2>
              <ul className="grid grid-cols-2 gap-3">
                {links.map((link, j) => {
                  const i = offset + j
                  return (
                    <li
                      key={link.href}
                      style={{
                        transition: 'opacity .35s, transform .35s',
                        transitionDelay: open ? `${40 + i * 30}ms` : '0ms',
                        opacity: open ? 1 : 0,
                        transform: open ? 'none' : 'translateY(12px)',
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`card flex h-full items-baseline gap-2.5 p-4 ${isActive(link.href) ? '!bg-pink' : ''}`}
                      >
                        <span className="font-mono text-sm font-bold text-blue">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-xl font-bold">{t.nav[link.key]}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
