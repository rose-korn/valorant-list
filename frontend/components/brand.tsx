// ใช้ร่วมกันทั้ง server และ client component

export const NAV_LINKS = [
  { href: '/agents', label: 'Agents', th: 'เอเจนท์' },
  { href: '/maps', label: 'Maps', th: 'แผนที่' },
  { href: '/weapons', label: 'Arsenal', th: 'อาวุธ & สกิน' },
  { href: '/ranks', label: 'Ranks', th: 'แรงค์' },
  { href: '/bundles', label: 'Bundles', th: 'บันเดิล' },
  { href: '/collection', label: 'Collection', th: 'ของสะสม' },
  { href: '/modes', label: 'Modes', th: 'โหมดเกม' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* โลโก้ V แบบเรขาคณิต */}
      <svg viewBox="0 0 100 100" className="h-7 w-7 shrink-0" aria-hidden>
        <path d="M4 10 L58 90 L36 90 L4 42 Z" fill="#ff4654" />
        <path d="M96 10 L96 42 L76 68 L56 68 Z" fill="#ff4654" />
      </svg>
      <span className="font-display text-xl leading-none tracking-[0.12em] text-val-cream uppercase">
        Valorant<span className="text-val-red">List</span>
      </span>
    </span>
  )
}
