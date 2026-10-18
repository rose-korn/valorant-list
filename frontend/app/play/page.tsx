import type { Metadata } from 'next'
import { Container, PageHero } from '@/components/ui'
import { getCompetitiveTiers } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { latestTiers, rgbaHex } from '@/lib/valorant'
import AimRush from './AimRush'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.play.title }
}

export default async function PlayPage() {
  const [tierSeasons, { t }] = await Promise.all([getCompetitiveTiers(), getI18n()])
  const ranks = latestTiers(tierSeasons).map((r) => ({ name: r.tierName, icon: r.largeIcon, color: rgbaHex(r.color, '#1d1f24') }))

  return (
    <>
      <PageHero en="Mini game" title={t.play.title} description={t.play.desc} note={t.play.note} />
      <Container className="py-8 md:py-12">
        <AimRush ranks={ranks} />
      </Container>
    </>
  )
}
