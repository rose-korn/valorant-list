import type { Metadata } from 'next'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getCompetitiveTiers, getSeasons, latestTiers, nowMs, rgbaHex } from '@/lib/valorant'
import RankShowcase from './RankShowcase'

export const metadata: Metadata = { title: 'Ranks' }

export default async function RanksPage() {
  const [tierSeasons, seasons] = await Promise.all([getCompetitiveTiers(), getSeasons()])
  const tiers = latestTiers(tierSeasons).map((t) => ({
    tier: t.tier,
    name: t.tierName,
    division: t.divisionName,
    color: rgbaHex(t.color, '#ece8e1'),
    bg: rgbaHex(t.backgroundColor, '#0f1923'),
    icon: t.largeIcon!,
    small: t.smallIcon,
  }))

  // Episode (ไม่มี parent) → Acts (parentUuid = episode)
  const now = nowMs()
  const episodes = seasons
    .filter((s) => !s.parentUuid)
    .map((ep) => ({
      ...ep,
      acts: seasons.filter((s) => s.parentUuid === ep.uuid).sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    }))
    .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime))
  const isNow = (s: { startTime: string; endTime: string }) => +new Date(s.startTime) <= now && now <= +new Date(s.endTime)
  const fmt = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <>
      <PageHero
        eyebrow="Competitive"
        title="Ranks"
        th="ระบบแรงค์"
        description="ไต่ระดับจาก Iron สู่ Radiant — กดเลือกแรงค์เพื่อดูตราสัญลักษณ์แบบ 3D"
        stats={[
          { label: 'Tiers', value: tiers.length },
          { label: 'Episodes', value: episodes.length },
          { label: 'Acts', value: seasons.filter((s) => s.parentUuid).length },
        ]}
      />

      <Container className="py-10 md:py-14">{tiers.length ? <RankShowcase tiers={tiers} /> : <EmptyState />}</Container>

      {episodes.length > 0 && (
        <section className="border-t border-white/5 bg-val-deep py-14 md:py-20">
          <Container>
            <SectionHeading index="Timeline" title="Seasons" th="ไทม์ไลน์ Episode และ Act" />
            <ol className="relative space-y-6 border-l border-white/10 pl-6 md:pl-10">
              {episodes.map((ep) => {
                const live = isNow(ep)
                return (
                  <li key={ep.uuid} className="relative">
                    <span className={`absolute top-2 -left-[29px] h-3 w-3 rotate-45 md:-left-[45px] ${live ? 'bg-val-red' : 'bg-white/20'}`} />
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className={`font-display text-3xl uppercase md:text-4xl ${live ? 'text-val-red' : 'text-val-cream'}`}>
                        {ep.title ?? ep.displayName}
                      </h3>
                      {ep.title && <span className="text-xs tracking-widest text-val-cream/40 uppercase">{ep.displayName}</span>}
                      <span className="font-mono text-xs text-val-cream/40">
                        {fmt(ep.startTime)} — {fmt(ep.endTime)}
                      </span>
                      {live && <span className="val-chip !border-val-red !text-val-red">Live</span>}
                    </div>
                    {ep.acts.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {ep.acts.map((act) => (
                          <div
                            key={act.uuid}
                            className={`border px-3 py-2 ${isNow(act) ? 'border-val-red bg-val-red/10' : 'border-white/10 bg-white/[0.02]'}`}
                          >
                            <p className="font-display text-lg text-val-cream uppercase">{act.title ?? act.displayName}</p>
                            <p className="font-mono text-[10px] text-val-cream/40">
                              {fmt(act.startTime)} — {fmt(act.endTime)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </Container>
        </section>
      )}
    </>
  )
}
