import type { Metadata } from 'next'
import { Container, PageHero } from '@/components/ui'
import { getI18n } from '@/lib/i18n-server'
import SpikeBeat from '../SpikeBeat'
import { GameTabs, getRanks, getStageAgents } from '../shared'

export async function generateMetadata({ params }: PageProps<'/[lang]/play/beat'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.beat.title }
}

export default async function SpikeBeatPage({ params }: PageProps<'/[lang]/play/beat'>) {
  const { lang, t } = await getI18n(params)
  const [ranks, agents] = await Promise.all([getRanks(lang), getStageAgents(lang)])

  return (
    <>
      <PageHero en="Mini game" title={t.beat.title} description={t.beat.desc} note={t.beat.note} />
      <Container className="py-8 md:py-12">
        <GameTabs active="beat" t={t} />
        <SpikeBeat ranks={ranks} agents={agents} />
      </Container>
    </>
  )
}
