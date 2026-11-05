import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getAgents } from '@/lib/api'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { getI18n } from '@/lib/i18n-server'
import { agentColor, groupByRole } from '@/lib/valorant'
import RandomAgent from './RandomAgent'

export async function generateMetadata({ params }: PageProps<'/[lang]/random'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/random', { title: seoTitles[lang].random, description: seoDescriptions[lang].random })
}

export default async function RandomPage({ params }: PageProps<'/[lang]/random'>) {
  const { lang, t } = await getI18n(params)
  const agents = await getAgents(lang)
  const groups = groupByRole(agents)

  const slim = agents
    .map((a) => ({
      uuid: a.uuid,
      name: a.displayName,
      icon: a.displayIcon,
      portrait: a.fullPortrait,
      color: agentColor(a),
      roleUuid: a.role?.uuid ?? '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="fair">
      <PageHero edition="fair" en="Random agent" title={t.random.title} description={t.random.desc} note={t.random.note} />
      <Container className="py-8 md:py-12">
        {slim.length ? (
          <RandomAgent agents={slim} roles={groups.map((g) => ({ uuid: g.uuid, name: g.role.displayName, icon: g.role.displayIcon }))} />
        ) : (
          <EmptyState text={t.common.empty} />
        )}
      </Container>
    </div>
  )
}
