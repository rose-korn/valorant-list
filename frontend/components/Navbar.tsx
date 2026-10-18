'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo, NAV_LINKS } from './brand'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
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
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open ? 'bg-val-ink/95 backdrop-blur-md' : 'bg-gradient-to-b from-val-ink/90 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="Valorant List home" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`group relative block px-3.5 py-2 font-display text-sm tracking-[0.14em] uppercase transition-colors ${
                    isActive(link.href) ? 'text-white' : 'text-val-cream/60 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left bg-val-red transition-transform duration-300 ${
                      isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="https://playvalorant.com"
              target="_blank"
              rel="noreferrer"
              className="val-btn hidden !px-5 !py-2.5 !text-xs sm:inline-flex"
            >
              Play Free
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
              aria-expanded={open}
              className="relative flex h-10 w-10 items-center justify-center border border-white/15 xl:hidden"
            >
              <span
                className={`absolute h-0.5 w-5 bg-val-cream transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`}
              />
              <span className={`absolute h-0.5 w-5 bg-val-red transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
              <span
                className={`absolute h-0.5 w-5 bg-val-cream transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`}
              />
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-val-red/60 to-transparent" />
      </nav>

      {/* เมนูเต็มจอสำหรับมือถือ/แท็บเล็ต */}
      <div
        className={`fixed inset-0 z-40 bg-val-ink transition-[clip-path] duration-500 ease-[cubic-bezier(.7,0,.2,1)] xl:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="val-grid-bg absolute inset-0 opacity-60" />
        <div className="relative flex h-full flex-col overflow-y-auto px-6 pt-24 pb-10">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                className="border-b border-white/10"
                style={{
                  transition: 'opacity .4s, transform .4s',
                  transitionDelay: open ? `${120 + i * 50}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateY(16px)',
                }}
              >
                <Link href={link.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                  <span
                    className={`font-display text-4xl tracking-wide uppercase sm:text-5xl ${
                      isActive(link.href) ? 'text-val-red' : 'text-val-cream'
                    }`}
                  >
                    {link.label}
                  </span>
                  <span className="font-thai text-sm text-val-cream/40">{link.th}</span>
                </Link>
              </li>
            ))}
          </ul>
          <a href="https://playvalorant.com" target="_blank" rel="noreferrer" className="val-btn mt-10 self-start">
            Play Free
          </a>
        </div>
      </div>
    </>
  )
}
