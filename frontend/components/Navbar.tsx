'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo, NAV_LINKS, Scribble } from './brand'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ล็อก scroll ตอนเปิดเมนูมือถือ
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 border-b-2 bg-paper/95 backdrop-blur transition-[border-color] ${
          scrolled || open ? 'border-ink' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="หน้าแรก" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative block px-3 py-1.5 font-display font-semibold transition-colors ${
                    isActive(link.href) ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && <Scribble className="absolute inset-x-2 -bottom-1 h-2.5" />}
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={open}
            className="btn btn-paper !px-3 !py-1.5 text-sm lg:hidden"
          >
            {open ? 'ปิด ✕' : 'เมนู'}
          </button>
        </div>
      </nav>

      {/* เมนูมือถือ */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="dotted-bg flex h-full flex-col overflow-y-auto px-6 pt-24 pb-10">
          <p className="hand mb-4 -rotate-2 text-xl">ไปดูอะไรดีวันนี้~</p>
          <ul className="grid grid-cols-2 gap-3">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                style={{
                  transition: 'opacity .35s, transform .35s',
                  transitionDelay: open ? `${60 + i * 40}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? `rotate(${i % 2 ? 1 : -1}deg)` : 'translateY(12px)',
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`card flex h-full flex-col p-4 ${isActive(link.href) ? '!bg-mustard' : ''}`}
                >
                  <span className="font-display text-2xl font-bold">{link.label}</span>
                  <span className="text-sm text-ink-soft">{link.en}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
