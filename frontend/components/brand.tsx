// ใช้ร่วมกันทั้ง server และ client component

import { markSvg } from '@/lib/mark'

// label ดึงจาก dict.nav ตามภาษา
export const NAV_LINKS = [
  { href: '/agents', key: 'agents' },
  { href: '/maps', key: 'maps' },
  { href: '/weapons', key: 'weapons' },
  { href: '/ranks', key: 'ranks' },
  { href: '/battlepass', key: 'battlepass' },
  { href: '/bundles', key: 'bundles' },
  { href: '/collection', key: 'collection' },
  { href: '/modes', key: 'modes' },
] as const

export const FUN_LINKS = [
  { href: '/share', key: 'share' },
  // มินิเกมเปิดที่ Spike Beat ก่อน (Aim Rush อยู่แท็บที่สองที่ /play)
  { href: '/play/beat', key: 'play' },
  { href: '/random', key: 'random' },
  { href: '/crosshair', key: 'crosshair' },
] as const

/** ลิงก์นี้คือหน้าปัจจุบันไหม — มินิเกมนับทั้ง /play และ /play/beat */
export function isLinkActive(pathname: string, href: string) {
  const base = href.startsWith('/play') ? '/play' : href
  return pathname === base || pathname.startsWith(`${base}/`)
}

const MARK = markSvg()

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`group flex items-center gap-2 ${className}`}>
      {/* สติกเกอร์ตัวเดียวกับ favicon — ชี้แล้วมุมเผยอขึ้นเหมือนจะลอกออก */}
      <span
        aria-hidden
        className="block h-10 w-10 origin-bottom-left transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] group-hover:-translate-y-0.5 group-hover:rotate-[8deg] group-hover:scale-110 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: MARK }}
      />
      <span className="font-display text-xl leading-none font-extrabold tracking-tight text-ink">
        valo<span className="riso">list.</span>
      </span>
    </span>
  )
}

/** เส้นขีดเส้นใต้แบบมือวาด */
export function Scribble({ className = '', color = 'var(--color-red)' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={`pointer-events-none ${className}`} aria-hidden>
      <path
        d="M2 9 C 30 3, 55 12, 85 7 S 140 2, 165 8 S 192 10, 198 5"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: 1, animation: 'draw .9s .2s ease-out both' }}
      />
    </svg>
  )
}

/** ลูกศรวาดมือ */
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={`pointer-events-none ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M4 6 C 18 30, 36 34, 54 26" />
      <path d="M44 20 L 55 26 L 46 35" />
    </svg>
  )
}

/** ดาววาดมือ */
export function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`pointer-events-none ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" aria-hidden>
      <path d="M20 4 L24 15 L36 16 L27 24 L30 36 L20 29 L10 36 L13 24 L4 16 L16 15 Z" />
    </svg>
  )
}

/** เป้าเล็งวาดเส้นหมึก (แบบบนโปสเตอร์) ใช้แทนอีโมจิ */
export function Crosshair({ className = '', dot = 'var(--color-red)' }: { className?: string; dot?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`pointer-events-none ${className}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden>
      <circle cx="50" cy="50" r="30" />
      <circle cx="50" cy="50" r="16" strokeDasharray="7 6" />
      <path d="M50 4v24M50 72v24M4 50h24M72 50h24" />
      <circle cx="50" cy="50" r="4" fill={dot} stroke="none" />
    </svg>
  )
}

/** เครื่องหมายตัดกระดาษ (registration mark) ไว้ประดับมุม */
export function RegMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`pointer-events-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="20" cy="20" r="9" />
      <path d="M20 2v36M2 20h36" />
    </svg>
  )
}
