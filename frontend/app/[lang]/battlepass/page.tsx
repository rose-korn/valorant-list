import type { Metadata } from 'next'
import Link from '@/components/Link'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getContracts, getSeasons } from '@/lib/api'
import { dateLocale } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'
import { buildRewardIndex } from '@/lib/rewards'
import { type Contract, actLabel } from '@/lib/valorant'

export async function generateMetadata({ params }: PageProps<'/[lang]/battlepass'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.battlepass.title }
}

const tilt = ['-rotate-1', 'rotate-1', 'rotate-[0.5deg]', '-rotate-[0.5deg]']

export default async function BattlePassPage({ params }: PageProps<'/[lang]/battlepass'>) {
  const { lang, t } = await getI18n(params)
  const [contracts, seasons, resolve] = await Promise.all([getContracts(lang), getSeasons(lang), buildRewardIndex(lang)])
  const b = t.battlepass
  const fmt = (d: string) => new Date(d).toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: '2-digit' })

  const passes = contracts
    .filter((c) => c.content.relationType === 'Season')
    .map((c) => ({ c, ...actLabel(c, seasons) }))
    .sort((x, y) => +new Date(y.act?.startTime ?? 0) - +new Date(x.act?.startTime ?? 0))
  const events = contracts.filter((c) => c.content.relationType === 'Event').reverse()

  const cover = (c: Contract) => {
    const levels = c.content.chapters.flatMap((ch) => ch.levels)
    const pick = levels.find((l) => l.reward.isHighlighted && l.reward.type === 'EquippableSkinLevel') ?? levels.find((l) => l.reward.type === 'EquippableSkinLevel')
    return pick ? resolve(pick.reward).image : null
  }
  const tierCount = (c: Contract) => c.content.chapters.reduce((n, ch) => n + ch.levels.length, 0)

  return (
    <>
      <PageHero en="Battle Pass" title={b.title} description={b.desc} facts={[{ label: b.unit, value: passes.length + events.length }]} note={b.note} />
      <Container className="py-10 md:py-14">
        {passes.length + events.length === 0 && <EmptyState text={t.common.empty} />}
        {passes.length > 0 && (
          <>
            <SectionHeading title={b.acts} note={b.actsNote} />
            <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {passes.map(({ c, act, label }, i) => (
                <Reveal key={c.uuid} delay={(i % 3) * 60}>
                  <PassCard c={c} i={i} img={cover(c)} tiers={b.tiers(tierCount(c))} sub={[label, act ? `${fmt(act.startTime)} – ${fmt(act.endTime)}` : ''].filter(Boolean).join(' · ')} />
                </Reveal>
              ))}
            </div>
          </>
        )}
        {events.length > 0 && (
          <div className="mt-14">
            <SectionHeading title={b.events} note={b.eventsNote} />
            <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((c, i) => (
                <PassCard key={c.uuid} c={c} i={i} img={cover(c)} tiers={b.tiers(tierCount(c))} sub="" />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  )
}

function PassCard({ c, sub, i, img, tiers }: { c: Contract; sub: string; i: number; img: string | null; tiers: string }) {
  return (
    <Link href={`/battlepass/${c.uuid}`} className={`card card-hover block p-2.5 ${tilt[i % tilt.length]}`}>
      <div className="skeleton-dark flex aspect-[16/9] items-center justify-center overflow-hidden rounded-md px-4">
        {img ? <img src={img} alt="" loading="lazy" className="max-h-[75%] max-w-full object-contain" /> : <span className="text-4xl">🎟️</span>}
      </div>
      <div className="px-1 pt-2">
        <p className="font-display text-lg leading-tight font-bold">{c.displayName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
          {sub && <span>{sub}</span>}
          <span className="chip !py-0 text-xs">{tiers}</span>
        </div>
      </div>
    </Link>
  )
}
