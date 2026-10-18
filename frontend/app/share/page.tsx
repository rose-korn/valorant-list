import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getAgents } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import ShareCardMaker from './ShareCardMaker'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.share.title }
}

export default async function SharePage() {
  const [agents, { t }] = await Promise.all([getAgents(), getI18n()])
  const slim = agents
    .map((a) => ({
      uuid: a.uuid,
      name: a.displayName,
      role: a.role?.displayName ?? '',
      icon: a.displayIcon,
      portrait: a.fullPortrait ?? a.bustPortrait ?? a.displayIcon,
      colors: a.backgroundGradientColors.map((c) => `#${c.slice(0, 6)}`),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <PageHero en="Share card" title={t.share.title} description={t.share.desc} note={t.share.note} />
      <Container className="py-10 md:py-14">
        {slim.length ? (
          <Suspense>
            <ShareCardMaker agents={slim} />
          </Suspense>
        ) : (
          <EmptyState text={t.common.empty} />
        )}
      </Container>
    </>
  )
}
