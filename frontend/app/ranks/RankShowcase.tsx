'use client'

import { useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'

interface TierView {
  tier: number
  name: string
  division: string
  color: string
  icon: string
  small: string | null
}

export default function RankShowcase({ tiers }: { tiers: TierView[] }) {
  const [active, setActive] = useState(tiers[tiers.length - 1])

  // จัดกลุ่มตาม division (Iron, Bronze, ...)
  const groups = useMemo(() => {
    const map = new Map<string, TierView[]>()
    for (const t of tiers) map.set(t.division, [...(map.get(t.division) ?? []), t])
    return [...map.entries()]
  }, [tiers])

  const index = tiers.findIndex((t) => t.tier === active.tier)
  const go = (d: number) => {
    const next = tiers[index + d]
    if (next) setActive(next)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="screen h-[42svh] min-h-[300px] md:h-[50svh]" style={{ background: `radial-gradient(circle at 50% 42%, ${active.color}55, #1c1e24 70%)` }}>
          <Viewer3D src={active.icon} alt={active.name} accent={active.color} variant="emblem" className="h-full w-full" />
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div key={active.tier} className="animate-fade-up">
            <p className="text-sm text-ink-soft">
              ระดับที่ {index + 1} จาก {tiers.length}
            </p>
            <h2 className="text-4xl font-bold">{active.name}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} disabled={index <= 0} className="btn btn-paper !px-3 disabled:opacity-40" aria-label="แรงค์ก่อนหน้า">
              ←
            </button>
            <button onClick={() => go(1)} disabled={index >= tiers.length - 1} className="btn btn-paper !px-3 disabled:opacity-40" aria-label="แรงค์ถัดไป">
              →
            </button>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-card">
          <div className="h-full bg-red transition-all duration-500" style={{ width: `${((index + 1) / tiers.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {groups.map(([division, list]) => (
          <div key={division} className="card flex flex-wrap items-center gap-3 p-3">
            <p className="w-full font-display text-lg font-bold sm:w-28">{division}</p>
            <div className="flex flex-1 flex-wrap gap-2">
              {list.map((t) => {
                const on = t.tier === active.tier
                return (
                  <button
                    key={t.tier}
                    onClick={() => setActive(t)}
                    aria-pressed={on}
                    className={`flex flex-col items-center rounded-xl border-2 p-1.5 transition-all ${
                      on ? '-translate-y-0.5 border-ink bg-mustard shadow-[2px_3px_0_var(--color-ink)]' : 'border-transparent hover:border-line'
                    }`}
                  >
                    <img src={t.small ?? t.icon} alt={t.name} loading="lazy" className="h-11 w-11 object-contain md:h-12 md:w-12" />
                    <span className="text-xs text-ink-soft">{t.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
