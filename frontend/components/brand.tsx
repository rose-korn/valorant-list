// ใช้ร่วมกันทั้ง server และ client component

// label ดึงจาก dict.nav ตามภาษา
export const NAV_LINKS = [
  { href: '/agents', key: 'agents', emoji: '🦸' },
  { href: '/maps', key: 'maps', emoji: '🗺️' },
  { href: '/weapons', key: 'weapons', emoji: '🔫' },
  { href: '/ranks', key: 'ranks', emoji: '🏆' },
  { href: '/bundles', key: 'bundles', emoji: '🛍️' },
  { href: '/collection', key: 'collection', emoji: '🃏' },
  { href: '/modes', key: 'modes', emoji: '🎮' },
] as const

export const FUN_LINKS = [
  { href: '/share', key: 'share', emoji: '✨' },
  { href: '/play', key: 'play', emoji: '🎯' },
] as const

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 -rotate-6 items-center justify-center rounded-lg border-2 border-ink bg-red font-display text-lg font-bold text-white shadow-[2px_3px_0_var(--color-ink)]">
        V
      </span>
      <span className="font-display text-xl leading-none font-bold text-ink">
        valo<span className="text-red-ink">list</span>
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
