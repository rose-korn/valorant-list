import type { Metadata } from 'next'
import { Container, PageHero } from '@/components/ui'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { getI18n } from '@/lib/i18n-server'
import AimRush from './AimRush'
import { GameTabs, getRanks } from './shared'

export async function generateMetadata({ params }: PageProps<'/[lang]/play'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/play', { title: seoTitles[lang].play, description: seoDescriptions[lang].play })
}

export default async function PlayPage({ params }: PageProps<'/[lang]/play'>) {
  const { lang, t } = await getI18n(params)
  const ranks = await getRanks(lang)

  return (
    <div className="fair">
      <PageHero edition="fair" en="Mini game" title={t.play.title} description={t.play.desc} note={t.play.note} />
      <Container className="py-8 md:py-12">
        <GameTabs active="aim" t={t} />
        <AimRush ranks={ranks} />
      </Container>
    </div>
  )
}
