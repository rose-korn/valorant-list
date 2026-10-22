'use client'

import Link from '@/components/Link'
import { useMemo, useState } from 'react'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'
import { useI18n } from '@/components/LangProvider'

export interface WeaponCard {
  uuid: string
  displayName: string
  category: string
  displayIcon: string
  cost: number
  fireRate: number
  magazine: number
  head: number
  skins: number
}

export default function ArsenalClient({
  weapons,
  categories,
}: {
  weapons: WeaponCard[]
  categories: { key: string; label: string; sub: string }[]
}) {
  const { t } = useI18n()
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
      .map((c) => ({ ...c, items: weapons.filter((w) => w.category === c.key && (!q || w.displayName.toLowerCase().includes(q))) }))
      .filter((g) => g.items.length)
  }, [weapons, categories, cat, query])

  return (
    <>
      <FilterBar search={<SearchInput value={query} onChange={setQuery} placeholder={t.weapons.search} />}>
        <FilterButton active={cat === 'ALL'} onClick={() => setCat('ALL')}>
          {t.common.all}
        </FilterButton>
        {categories.map((c) => (
          <FilterButton key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
            {c.label}
          </FilterButton>
        ))}
      </FilterBar>

      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-3xl font-bold">{g.label}</h2>
              {g.sub && <span className="text-ink-soft">{g.sub}</span>}
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.items.map((w) => (
                <li key={w.uuid}>
                  <Link href={`/weapons/${w.uuid}`} className="card card-hover group flex h-full flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold">{w.displayName}</h3>
                      {w.cost > 0 && <span className="chip !px-2 text-sm">{w.cost.toLocaleString()}</span>}
                    </div>
                    <div className="my-4 flex h-20 items-center justify-center rounded-lg bg-ink px-3">
                      <img
                        src={w.displayIcon}
                        alt={w.displayName}
                        loading="lazy"
                        className="max-h-14 max-w-full object-contain transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
                      />
                    </div>
                    {w.fireRate > 0 ? (
                      <dl className="mt-auto space-y-1.5">
                        <StatBar label={t.weapons.fireRate} value={w.fireRate} max={max.fireRate} />
                        <StatBar label={t.weapons.magazine} value={w.magazine} max={max.magazine} />
                        <StatBar label={t.weapons.head} value={w.head} max={max.head} />
                      </dl>
                    ) : (
                      <p className="mt-auto text-sm text-ink-soft">{t.weapons.melee}</p>
                    )}
                    <p className="mt-3 text-sm font-semibold text-red-ink">{t.weapons.skinCount(w.skins)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="hand py-16 text-center text-xl">{t.common.noResult}</p>}
      </div>
    </>
  )
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[84px_1fr_36px] items-center gap-2 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <div className="h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-red" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <dd className="text-right font-display font-semibold">{Number.isInteger(value) ? value : value.toFixed(1)}</dd>
    </div>
  )
}
