'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'

export interface WeaponCard {
  uuid: string
  displayName: string
  category: string
  displayIcon: string
  cost: number
  fireRate: number
  magazine: number
  head: number
  body: number
  wallPen: string | null
  skins: number
}

export default function ArsenalClient({
  weapons,
  categories,
}: {
  weapons: WeaponCard[]
  categories: { key: string; label: string; th: string }[]
}) {
  const [cat, setCat] = useState('ALL')
  const [query, setQuery] = useState('')

  const max = useMemo(
    () => ({
      fireRate: Math.max(...weapons.map((w) => w.fireRate), 1),
      magazine: Math.max(...weapons.map((w) => w.magazine), 1),
      head: Math.max(...weapons.map((w) => w.head), 1),
    }),
    [weapons],
  )

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories
      .filter((c) => cat === 'ALL' || c.key === cat)
      .map((c) => ({
        ...c,
        items: weapons.filter((w) => w.category === c.key && (!q || w.displayName.toLowerCase().includes(q))),
      }))
      .filter((g) => g.items.length)
  }, [weapons, categories, cat, query])

  return (
    <>
      <FilterBar search={<SearchInput value={query} onChange={setQuery} placeholder="ค้นหาอาวุธ..." />}>
        <FilterButton active={cat === 'ALL'} onClick={() => setCat('ALL')}>
          All
        </FilterButton>
        {categories.map((c) => (
          <FilterButton key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
            {c.label}
          </FilterButton>
        ))}
      </FilterBar>

      <div className="space-y-14">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-5 flex items-baseline gap-4 border-b border-white/10 pb-3">
              <h2 className="font-display text-4xl text-val-cream uppercase md:text-5xl">{g.label}</h2>
              <span className="font-thai text-sm text-val-cream/40">{g.th}</span>
              <span className="ml-auto font-display text-val-red">{String(g.items.length).padStart(2, '0')}</span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.items.map((w) => (
                <li key={w.uuid}>
                  <Link
                    href={`/weapons/${w.uuid}`}
                    className="group val-panel relative flex h-full flex-col overflow-hidden p-5 transition-colors hover:border-val-red/60"
                  >
                    <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-val-red transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="flex items-start justify-between">
                      <h3 className="font-display text-2xl text-val-cream uppercase">{w.displayName}</h3>
                      {w.cost > 0 && <span className="font-display text-val-red">¤ {w.cost.toLocaleString()}</span>}
                    </div>
                    <div className="relative my-4 flex h-24 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-val-red/0 blur-2xl transition-colors duration-500 group-hover:bg-val-red/20" />
                      <img
                        src={w.displayIcon}
                        alt={w.displayName}
                        loading="lazy"
                        className="relative max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                      />
                    </div>
                    {w.fireRate > 0 ? (
                      <dl className="mt-auto space-y-2">
                        <StatBar label="Fire rate" value={w.fireRate} max={max.fireRate} unit="/s" />
                        <StatBar label="Magazine" value={w.magazine} max={max.magazine} />
                        <StatBar label="Head dmg" value={w.head} max={max.head} />
                      </dl>
                    ) : (
                      <p className="mt-auto font-thai text-xs text-val-cream/40">อาวุธระยะประชิด</p>
                    )}
                    <p className="mt-4 text-[10px] tracking-[0.25em] text-val-cream/40 uppercase">
                      {w.skins} skins <span className="text-val-red">→</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="py-20 text-center font-thai text-val-cream/40">ไม่พบอาวุธที่ค้นหา</p>}
      </div>
    </>
  )
}

function StatBar({ label, value, max, unit = '' }: { label: string; value: number; max: number; unit?: string }) {
  return (
    <div className="grid grid-cols-[72px_1fr_44px] items-center gap-2 text-[11px]">
      <dt className="tracking-wider text-val-cream/45 uppercase">{label}</dt>
      <div className="h-1 bg-white/10">
        <div className="h-full bg-val-cream/70 transition-all group-hover:bg-val-red" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <dd className="text-right font-mono text-val-cream/80">
        {Number.isInteger(value) ? value : value.toFixed(1)}
        {unit}
      </dd>
    </div>
  )
}
