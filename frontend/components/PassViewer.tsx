'use client'

import { useState } from 'react'
import HScroller from './HScroller'
import { useI18n } from './LangProvider'
import type { PassChapterData, ResolvedReward } from '@/lib/rewards'


export type PassChapter = PassChapterData

type Picked = { reward: ResolvedReward; tier: number | null; xp: number; total: number; free: boolean }

/**
 * ดู Battle Pass / สัญญาเอเจนท์ แบบในเกม: พรีวิวใหญ่ด้านบน + แถวการ์ดของแต่ละบทด้านล่าง
 * ไม่ลิงก์ไปหน้าอื่น — กดการ์ดแค่เพื่อดูรายละเอียด
 */
export default function PassViewer({ chapters }: { chapters: PassChapter[] }) {
  const { t } = useI18n()
  const b = t.battlepass
  const [chapterIdx, setChapterIdx] = useState(0)
  const first = chapters[0]?.levels[0]
  const [picked, setPicked] = useState<Picked | null>(first ? { reward: first.reward, tier: first.tier, xp: first.xp, total: first.total, free: false } : null)

  if (!chapters.length || !picked) return null

  // เลขบท (บทส่งท้ายไม่นับ)
  const chapterLabel = (i: number) => (chapters[i].isEpilogue ? b.epilogue : b.chapter(chapters.slice(0, i + 1).filter((c) => !c.isEpilogue).length))
  const chapter = chapters[chapterIdx]

  const go = (i: number) => {
    const next = Math.max(0, Math.min(chapters.length - 1, i))
    setChapterIdx(next)
    const l = chapters[next].levels[0]
    if (l) setPicked({ reward: l.reward, tier: l.tier, xp: l.xp, total: l.total, free: false })
  }

  const r = picked.reward
  const name = rewardName(r, b.unknown)

  return (
    <div>
      {/* ================= พรีวิวใหญ่ ================= */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="screen relative flex h-[34svh] min-h-[240px] items-center justify-center p-6 lg:h-[44svh]">
          <div className={`absolute inset-0 ${r.isHighlighted ? 'bg-[radial-gradient(ellipse_at_50%_45%,rgba(242,184,75,.35),transparent_65%)]' : 'bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,.12),transparent_65%)]'}`} />
          {r.type === 'Title' ? (
            <p key={r.uuid} className="relative animate-fade-in rounded-xl border-2 border-paper/30 bg-night px-6 py-4 text-center font-display text-3xl font-bold text-paper uppercase md:text-4xl">
              “{name}”
            </p>
          ) : r.preview ? (
            <img key={r.uuid} src={r.preview} alt={name} className="relative max-h-full max-w-full animate-fade-in object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,.5)]" />
          ) : (
            <span className="text-6xl">🎁</span>
          )}
        </div>

        <div className="card flex flex-col p-5">
          <div className="flex flex-wrap gap-1.5">
            <span className="chip text-sm">{b.types[r.type] ?? r.type}</span>
            {picked.free ? <span className="chip !bg-teal text-sm">{b.freeReward}</span> : <span className="chip !bg-mustard text-sm">{b.premiumTrack}</span>}
            {r.isHighlighted && <span className="chip !bg-[#ffd3d6] text-sm">★ {b.highlight}</span>}
          </div>
          <h2 key={r.uuid} className="mt-3 animate-fade-up text-3xl font-bold">
            {name}
            {r.type === 'Currency' && r.amount > 1 && <span className="ml-2 text-ink-soft">×{r.amount}</span>}
          </h2>
          {picked.tier !== null && <p className="mt-1 font-display text-lg font-semibold text-red-ink">{b.tier(picked.tier)}</p>}
          {!picked.free && picked.xp > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-paper-2 px-3 py-2">
                <dt className="text-xs text-ink-soft">{b.xpTier}</dt>
                <dd className="font-display text-lg font-bold">{picked.xp.toLocaleString()}</dd>
              </div>
              <div className="rounded-lg bg-paper-2 px-3 py-2">
                <dt className="text-xs text-ink-soft">{b.xpCumulative}</dt>
                <dd className="font-display text-lg font-bold">{picked.total.toLocaleString()}</dd>
              </div>
            </dl>
          )}
          <p className="hand mt-auto pt-4 text-base">{b.pickHint}</p>
        </div>
      </div>

      {/* ================= เลือกบท ================= */}
      <div className="mt-8 flex items-center gap-2">
        <button onClick={() => go(chapterIdx - 1)} disabled={chapterIdx === 0} aria-label={t.common.prev} className="btn btn-paper !px-3 !py-1.5 disabled:opacity-30">
          ◀
        </button>
        <div className="scrollbar-hide flex flex-1 gap-1.5 overflow-x-auto py-1">
          {chapters.map((c, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-pressed={i === chapterIdx}
              className={`shrink-0 rounded-full border-2 px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
                i === chapterIdx ? 'border-ink bg-ink text-paper' : 'border-line bg-card hover:border-ink'
              } ${c.levels.some((l) => l.reward.isHighlighted) && i !== chapterIdx ? '!border-mustard' : ''}`}
            >
              {chapterLabel(i)}
            </button>
          ))}
        </div>
        <button
          onClick={() => go(chapterIdx + 1)}
          disabled={chapterIdx === chapters.length - 1}
          aria-label={t.common.next}
          className="btn btn-paper !px-3 !py-1.5 disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      {/* ================= แถวการ์ดของบทนี้ ================= */}
      {/* มีปุ่ม ◀ ▶ + ลากเมาส์ได้ (key = รีเซ็ตตำแหน่งเลื่อนเมื่อเปลี่ยนบท) */}
      <div key={chapterIdx} className="mt-4 animate-fade-in">
        <HScroller className="soft-scroll -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pt-3 pb-4 sm:mx-0 sm:scroll-px-1 sm:px-1">
        {chapter.levels.map((l) => (
          <TierCard
            key={l.tier}
            reward={l.reward}
            badge={String(l.tier)}
            selected={!picked.free && picked.tier === l.tier}
            onClick={() => setPicked({ reward: l.reward, tier: l.tier, xp: l.xp, total: l.total, free: false })}
            typeLabel={b.types[l.reward.type] ?? l.reward.type}
            fallback={b.unknown}
          />
        ))}
        {chapter.free.length > 0 && (
          <>
            <span className="mx-1 w-0.5 shrink-0 self-stretch rounded-full bg-line" aria-hidden />
            {chapter.free.map((f, i) => (
              <TierCard
                key={`free-${i}`}
                reward={f}
                badge={b.free}
                free
                selected={picked.free && picked.reward === f}
                onClick={() => setPicked({ reward: f, tier: null, xp: 0, total: 0, free: true })}
                typeLabel={b.types[f.type] ?? f.type}
                fallback={b.unknown}
              />
            ))}
          </>
        )}
        </HScroller>
      </div>
    </div>
  )
}

function rewardName(r: ResolvedReward, fallback: string) {
  return r.name || (r.amount > 1 ? `${r.amount}` : fallback)
}

/** การ์ดแนวตั้งแบบในเกม */
function TierCard({
  reward,
  badge,
  free = false,
  selected,
  onClick,
  typeLabel,
  fallback,
}: {
  reward: ResolvedReward
  badge: string
  free?: boolean
  selected: boolean
  onClick: () => void
  typeLabel: string
  fallback: string
}) {
  const name = rewardName(reward, fallback)
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex w-32 shrink-0 snap-start flex-col overflow-hidden rounded-xl border-2 text-left transition-all sm:w-36 ${
        selected ? '-translate-y-1.5 border-ink bg-mustard shadow-[3px_5px_0_var(--color-ink)]' : 'border-ink bg-card shadow-[2px_3px_0_var(--color-ink)] hover:-translate-y-0.5'
      }`}
    >
      <span className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden ${reward.type === 'Title' ? 'bg-paper-2 p-2' : 'skeleton-dark p-2'}`}>
        {reward.type === 'Title' ? (
          <span className="line-clamp-4 text-center font-display text-sm font-bold uppercase">{name}</span>
        ) : reward.image ? (
          <img
            src={reward.image}
            alt={name}
            loading="lazy"
            className={reward.type === 'PlayerCard' ? 'absolute inset-0 h-full w-full object-cover' : 'max-h-full max-w-full object-contain'}
          />
        ) : (
          <span className="text-3xl">🎁</span>
        )}
        <span
          className={`absolute top-1.5 left-1.5 rounded-md border-2 border-ink px-1.5 font-display text-xs font-bold ${free ? 'bg-teal text-ink' : 'bg-card text-ink'}`}
        >
          {badge}
        </span>
        {reward.isHighlighted && <span className="absolute top-1.5 right-1.5 rounded-full border-2 border-ink bg-mustard px-1 text-xs">★</span>}
        {reward.type === 'Currency' && reward.amount > 1 && (
          <span className="absolute right-1.5 bottom-1.5 rounded-md bg-ink px-1.5 font-display text-xs font-bold text-paper">×{reward.amount}</span>
        )}
      </span>
      <span className="px-2 pt-1.5 text-[11px] text-ink-soft">{typeLabel}</span>
      <span className="line-clamp-2 px-2 pb-2 text-sm leading-snug font-semibold">{name}</span>
    </button>
  )
}
