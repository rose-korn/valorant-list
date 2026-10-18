'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FUN_LINKS, Logo, NAV_LINKS, Scribble } from './brand'
import { LangSwitch, useI18n } from './LangProvider'

export default function Navbar() {
  const pathname = usePathname()
  const { t } = useI18n()
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
                  {/* เส้นใต้กว้างเท่าตัวหนังสือพอดี ไม่รวม padding */}
                  <span className="relative">
                    {t.nav[link.key]}
                    {isActive(link.href) && <Scribble className="absolute -bottom-1.5 left-0 h-2 w-full" />}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {FUN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden rounded-full border-2 border-ink px-3 py-1 font-display text-sm font-semibold whitespace-nowrap transition-transform hover:-rotate-2 xl:block ${
                  isActive(link.href) ? 'bg-ink text-paper' : link.key === 'play' ? 'bg-mustard' : 'bg-[#ffd3d6]'
                }`}
              >
                {link.emoji} {t.nav[link.key]}
              </Link>
            ))}
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
          <p className="hand mb-4 -rotate-2 text-xl">{t.nav.menuNote}</p>
          <ul className="grid grid-cols-2 gap-3">
            {[...FUN_LINKS, ...NAV_LINKS].map((link, i) => (
              <li
                key={link.href}
                style={{
                  transition: 'opacity .35s, transform .35s',
                  transitionDelay: open ? `${40 + i * 35}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? `rotate(${i % 2 ? 1 : -1}deg)` : 'translateY(12px)',
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`card flex h-full items-center gap-2 p-4 ${isActive(link.href) ? '!bg-mustard' : ''}`}
                >
                  <span className="text-2xl">{link.emoji}</span>
                  <span className="font-display text-xl font-bold">{t.nav[link.key]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
