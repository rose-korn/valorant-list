import type { Metadata } from 'next'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getCompetitiveTiers, getSeasons, latestTiers, nowMs, rgbaHex } from '@/lib/valorant'
import RankShowcase from './RankShowcase'

export const metadata: Metadata = { title: 'แรงค์' }

export default async function RanksPage() {
  const [tierSeasons, seasons] = await Promise.all([getCompetitiveTiers(), getSeasons()])
  const tiers = latestTiers(tierSeasons).map((t) => ({
    tier: t.tier,
    name: t.tierName,
    division: t.divisionName,
    color: rgbaHex(t.color, '#1d1f24'),
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
        en="Ranks"
        title="แรงค์"
        description="จาก Iron ไปจนถึง Radiant — กดที่แรงค์ไหนก็ได้เพื่อดูตราแบบ 3D"
        facts={[
          { label: 'ระดับ', value: tiers.length },
          { label: 'Episode', value: episodes.length },
        ]}
        note="สู้ ๆ นะ ขึ้นแรงค์ได้แน่"
      />

      <Container className="py-10 md:py-14">{tiers.length ? <RankShowcase tiers={tiers} /> : <EmptyState />}</Container>

      {episodes.length > 0 && (
        <section className="border-t-2 border-ink bg-paper-2 py-12 md:py-16">
          <Container>
            <SectionHeading title="ไทม์ไลน์ซีซั่น" note="Episode กับ Act ที่ผ่านมา" />
            <ol className="relative space-y-8 border-l-2 border-dashed border-ink/40 pl-6 md:pl-8">
              {episodes.map((ep) => {
                const live = isNow(ep)
                return (
                  <li key={ep.uuid} className="relative">
                    <span className={`absolute top-2 -left-[33px] h-4 w-4 rounded-full border-2 border-ink md:-left-[41px] ${live ? 'bg-red' : 'bg-card'}`} />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-2xl font-bold">{ep.title ?? ep.displayName}</h3>
                      <span className="text-sm text-ink-soft">
                        {fmt(ep.startTime)} – {fmt(ep.endTime)}
                      </span>
                      {live && <span className="hand text-lg">← ตอนนี้อยู่ตรงนี้!</span>}
                    </div>
                    {ep.acts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ep.acts.map((act) => (
                          <span key={act.uuid} className={`chip ${isNow(act) ? '!bg-red !text-white' : ''}`}>
                            <b>{act.title ?? act.displayName}</b>
                            <span className="text-xs opacity-75">
                              {fmt(act.startTime)} – {fmt(act.endTime)}
                            </span>
                          </span>
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
