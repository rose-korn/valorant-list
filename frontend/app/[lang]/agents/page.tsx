import type { Metadata } from 'next'
import { Suspense } from 'react'
import AgentsClient from './AgentsClient'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getAgents } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { SLOT_ORDER, groupByRole } from '@/lib/valorant'

export async function generateMetadata({ params }: PageProps<'/[lang]/agents'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.agents.title }
}

export default async function AgentsPage({ params }: PageProps<'/[lang]/agents'>) {
  const { lang, t } = await getI18n(params)
  const agents = await getAgents(lang)
  const groups = groupByRole(agents)

  // ส่งเฉพาะ field ที่การ์ด/รายการใช้ ลดขนาด payload
  const slim = agents
    .map((a) => ({
      uuid: a.uuid,
      displayName: a.displayName,
      developerName: a.developerName,
      description: a.description,
      bustPortrait: a.bustPortrait,
      displayIcon: a.displayIcon,
      backgroundGradientColors: a.backgroundGradientColors,
      roleUuid: a.role?.uuid ?? '',
      roleName: a.role?.displayName ?? '',
      roleIcon: a.role?.displayIcon ?? '',
      abilityIcons: [...a.abilities]
        .filter((ab) => ab.displayIcon)
        .sort((x, y) => SLOT_ORDER.indexOf(x.slot) - SLOT_ORDER.indexOf(y.slot))
        .map((ab) => ({ icon: ab.displayIcon!, name: ab.displayName })),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return (
    <>
      <PageHero
        en="Agents"
        title={t.agents.title}
        description={t.agents.desc}
        facts={[{ label: t.agents.unit, value: agents.length }, ...groups.map((g) => ({ label: g.role.displayName, value: g.agents.length }))]}
      />
      <Container className="py-10 md:py-14">
        {slim.length ? (
          <Suspense>
            <AgentsClient agents={slim} roles={groups.map((g) => ({ uuid: g.uuid, name: g.role.displayName, icon: g.role.displayIcon }))} />
          </Suspense>
        ) : (
          <EmptyState text={t.common.empty} />
        )}
      </Container>
    </>
  )
}
