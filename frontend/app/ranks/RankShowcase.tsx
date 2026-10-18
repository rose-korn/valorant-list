'use client'

import { useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'

interface TierView {
  tier: number
  name: string
  division: string
  color: string
  bg: string
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          className="val-corners relative h-[46svh] min-h-[320px] overflow-hidden border border-white/10 transition-colors duration-700 md:h-[56svh]"
          style={{ background: `radial-gradient(circle at 50% 45%, ${active.color}33, #0f1923 70%)` }}
        >
          <Viewer3D src={active.icon} alt={active.name} accent={active.color} variant="emblem" className="h-full w-full !bg-transparent" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div key={active.tier} className="animate-fade-up">
            <p className="text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Tier {String(index + 1).padStart(2, '0')} / {tiers.length}</p>
            <h2 className="font-display text-5xl leading-none uppercase md:text-6xl" style={{ color: active.color }}>
              {active.name}
            </h2>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => index > 0 && setActive(tiers[index - 1])}
              disabled={index <= 0}
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-val-cream transition-colors hover:border-val-red hover:bg-val-red disabled:opacity-30"
              aria-label="แรงค์ก่อนหน้า"
            >
              ←
            </button>
            <button
              onClick={() => index < tiers.length - 1 && setActive(tiers[index + 1])}
              disabled={index >= tiers.length - 1}
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-val-cream transition-colors hover:border-val-red hover:bg-val-red disabled:opacity-30"
              aria-label="แรงค์ถัดไป"
            >
              →
            </button>
          </div>
        </div>
        {/* progress bar ตามระดับ */}
        <div className="mt-4 flex gap-0.5">
          {tiers.map((t, i) => (
            <span key={t.tier} className="h-1 flex-1 transition-colors" style={{ background: i <= index ? active.color : 'rgb(255 255 255 / .08)' }} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {groups.map(([division, list]) => (
          <div key={division} className="val-panel flex flex-wrap items-center gap-3 p-3 md:p-4">
            <p className="w-full font-display text-xl tracking-wider uppercase sm:w-28" style={{ color: list[0].color }}>
              {division}
            </p>
            <div className="flex flex-1 flex-wrap gap-2">
              {list.map((t) => {
                const on = t.tier === active.tier
                return (
                  <button
                    key={t.tier}
                    onClick={() => setActive(t)}
                    title={t.name}
                    className={`group flex flex-col items-center gap-1 border p-2 transition-all ${
                      on ? 'border-current' : 'border-transparent hover:border-white/20'
                    }`}
                    style={on ? { color: t.color, background: `${t.color}1a` } : undefined}
                  >
                    <img src={t.small ?? t.icon} alt={t.name} loading="lazy" className="h-12 w-12 object-contain transition-transform group-hover:scale-110 md:h-14 md:w-14" />
                    <span className="text-[10px] tracking-wider text-val-cream/60 uppercase">{t.name}</span>
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
