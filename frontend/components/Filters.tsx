'use client'

/** แถบ filter แบบ sticky ใต้ navbar — ปุ่ม filter เลื่อนแนวนอนได้บนมือถือ */
export function FilterBar({ children, search }: { children: React.ReactNode; search?: React.ReactNode }) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-8 flex flex-col gap-3 border-b border-white/5 bg-val-ink/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:-mx-10 lg:px-10">
      <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1">{children}</div>
      {search}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="relative block shrink-0 md:w-72">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-white/10 bg-white/5 py-2.5 pr-3 pl-9 font-thai text-sm text-val-cream placeholder:text-val-cream/30 focus:border-val-red focus:outline-none"
      />
      <svg viewBox="0 0 24 24" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-val-cream/40" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </label>
  )
}

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 px-4 py-2.5 font-display text-sm tracking-[0.14em] whitespace-nowrap uppercase transition-colors ${
        active ? 'bg-val-red text-white' : 'border border-white/10 text-val-cream/60 hover:border-white/30 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
