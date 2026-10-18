import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink, Container } from '@/components/ui'
import { getContract, getSeasons } from '@/lib/api'
import { dateLocale } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'
import { buildPassChapters, buildRewardIndex } from '@/lib/rewards'
import { actLabel } from '@/lib/valorant'
import PassViewer from '@/components/PassViewer'

export async function generateMetadata({ params }: PageProps<'/battlepass/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const c = await getContract(uuid)
  return { title: c?.displayName ?? 'Battle Pass' }
}

export default async function PassPage({ params }: PageProps<'/battlepass/[uuid]'>) {
  const { uuid } = await params
  const [contract, seasons, resolve, { lang, t }] = await Promise.all([getContract(uuid), getSeasons(), buildRewardIndex(), getI18n()])
  if (!contract) notFound()
  const b = t.battlepass
  const { act, label } = actLabel(contract, seasons)
  const fmt = (d: string) => new Date(d).toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' })

  // ระดับนับต่อเนื่องข้ามบท (บท 1 = ระดับ 1-5, บท 2 = 6-10 ...)
  const chapters = buildPassChapters(contract, resolve)
  const tier = chapters.reduce((n, ch) => n + ch.levels.length, 0)
  const totalXp = contract.content.chapters.reduce((n, ch) => n + ch.levels.reduce((m, l) => m + l.xp, 0), 0)
  const freeCount = chapters.reduce((n, ch) => n + ch.free.length, 0)

  return (
    <>
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="pt-8 pb-8">
          <BackLink href="/battlepass" label={b.back} />
          <h1 className="mt-4 animate-fade-up text-5xl font-bold sm:text-6xl">{contract.displayName}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {label && <span className="chip">{label}</span>}
            {act && (
              <span className="chip">
                {fmt(act.startTime)} – {fmt(act.endTime)}
              </span>
            )}
            <span className="chip">{b.tiers(tier)}</span>
            {totalXp > 0 && (
              <span className="chip">
                {b.totalXp}: <b>{totalXp.toLocaleString()}</b>
              </span>
            )}
            {freeCount > 0 && (
              <span className="chip !bg-teal">
                {b.free}: <b>{freeCount}</b>
              </span>
            )}
            {contract.content.premiumVPCost > 0 && <span className="chip !bg-mustard">{contract.content.premiumVPCost.toLocaleString()} VP</span>}
          </div>
        </Container>
      </section>
      <Container className="py-10 md:py-14">
        <PassViewer chapters={chapters} />
      </Container>
    </>
  )
}
