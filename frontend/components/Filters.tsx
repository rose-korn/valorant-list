'use client'

/** แถบตัวกรอง — ปุ่มเลื่อนแนวนอนได้บนมือถือ */
export function FilterBar({ children, search }: { children: React.ReactNode; search?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0">{children}</div>
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
        className="w-full rounded-xl border-2 border-ink bg-card py-2.5 pr-3 pl-10 text-ink placeholder:text-ink-soft/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-mustard/60"
      />
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft">⌕</span>
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
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 font-display font-semibold whitespace-nowrap transition-all ${
        active ? 'bg-ink text-paper' : 'bg-card text-ink hover:-translate-y-0.5 hover:bg-mustard/40'
      }`}
    >
      {children}
    </button>
  )
}
