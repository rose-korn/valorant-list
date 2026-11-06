import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getAgents, getMaps, getWeapons } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { guessPlan } from './data'
import GuessGame from './GuessGame'

export async function generateMetadata({ params }: PageProps<'/[lang]/guess'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/guess', { title: seoTitles[lang].guess, description: seoDescriptions[lang].guess })
}

export default async function GuessPage({ params }: PageProps<'/[lang]/guess'>) {
  const { lang, t } = await getI18n(params)
  const [agents, weapons, maps] = await Promise.all([getAgents(lang), getWeapons(lang), getMaps(lang)])
  const plan = guessPlan({ agents, weapons, maps })

  return (
    <div className="fair">
      <PageHero edition="fair" en="Daily guess" title={t.guess.title} description={t.guess.desc} note={t.guess.note} />
      <Container className="py-8 md:py-12">{plan.agents.length ? <GuessGame plan={plan} /> : <EmptyState text={t.common.empty} />}</Container>
    </div>
  )
}
