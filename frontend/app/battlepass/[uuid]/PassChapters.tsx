'use client'

import { useMemo, useState } from 'react'
import { FilterBar, FilterButton } from '@/components/Filters'
import { useI18n } from '@/components/LangProvider'
import RewardCard from '@/components/RewardCard'
import type { ResolvedReward } from '@/lib/rewards'

export interface ChapterView {
  isEpilogue: boolean
  levels: { tier: number; xp: number; reward: ResolvedReward }[]
  free: ResolvedReward[]
}

type Show = 'all' | 'highlight' | 'free'

export default function PassChapters({ chapters }: { chapters: ChapterView[] }) {
  const { t } = useI18n()
  const b = t.battlepass
  const [show, setShow] = useState<Show>('all')
  const [type, setType] = useState('ALL')

  // ประเภทรางวัลที่มีในพาสนี้ (ไว้ทำปุ่มกรอง)
  const types = useMemo(() => {
    const set = new Set<string>()
    for (const ch of chapters) {
      for (const l of ch.levels) set.add(l.reward.type)
      for (const f of ch.free) set.add(f.type)
    }
    return [...set]
  }, [chapters])

  const okType = (r: ResolvedReward) => type === 'ALL' || r.type === type

  // เลขบท (ไม่นับบทส่งท้าย)
  const chapterNos = chapters.map((_, i) => chapters.slice(0, i + 1).filter((c) => !c.isEpilogue).length)

  return (
    <>
      <FilterBar>
        {(['all', 'highlight', 'free'] as const).map((s) => (
          <FilterButton key={s} active={show === s} onClick={() => setShow(s)}>
            {s === 'all' ? b.showAll : s === 'highlight' ? `★ ${b.showHighlight}` : b.showFree}
          </FilterButton>
        ))}
        <span className="mx-1 w-px shrink-0 bg-line" />
        <FilterButton active={type === 'ALL'} onClick={() => setType('ALL')}>
          {t.common.all}
        </FilterButton>
        {types.map((ty) => (
          <FilterButton key={ty} active={type === ty} onClick={() => setType(ty)}>
            {b.types[ty] ?? ty}
          </FilterButton>
        ))}
      </FilterBar>

      <div className="space-y-10">
        {chapters.map((ch, ci) => {
          const levels = show === 'free' ? [] : ch.levels.filter((l) => okType(l.reward) && (show === 'all' || l.reward.isHighlighted))
          const free = show === 'highlight' ? ch.free.filter((f) => f.isHighlighted && okType(f)) : ch.free.filter(okType)
          if (!levels.length && !free.length) return null
          const first = ch.levels[0]?.tier
          const last = ch.levels[ch.levels.length - 1]?.tier
          return (
            <section key={ci}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">{ch.isEpilogue ? b.epilogue : b.chapter(chapterNos[ci])}</h2>
                {first && <span className="text-sm text-ink-soft">{first === last ? b.tier(first) : `${b.tier(first)} – ${last}`}</span>}
                <span className="h-0.5 flex-1 rounded-full bg-line" />
              </div>
              {levels.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {levels.map((l) => (
                    <li key={l.tier}>
                      <RewardCard
                        reward={l.reward}
                        label={b.tier(l.tier)}
                        typeLabel={b.types[l.reward.type] ?? l.reward.type}
                        highlightLabel={b.highlight}
                        fallbackName={b.unknown}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {free.length > 0 && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-teal bg-teal/10 p-3">
                  <p className="mb-2 font-display font-semibold">🎁 {b.freeTrack}</p>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {free.map((f, i) => (
                      <li key={`${f.uuid}-${i}`}>
                        <RewardCard
                          reward={f}
                          typeLabel={b.types[f.type] ?? f.type}
                          free
                          freeLabel={b.free}
                          highlightLabel={b.highlight}
                          fallbackName={b.unknown}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
