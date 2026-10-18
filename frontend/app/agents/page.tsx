import type { Metadata } from 'next'
import { Suspense } from 'react'
import AgentsClient from './AgentsClient'
import { EmptyState, PageHero, Container } from '@/components/ui'
import { getAgents, groupByRole } from '@/lib/valorant'

export const metadata: Metadata = { title: 'Agents' }

export default async function AgentsPage() {
  const agents = await getAgents()
  const groups = groupByRole(agents)

  // ส่งเฉพาะ field ที่การ์ดใช้ ลดขนาด payload
  const slim = agents
    .map((a) => ({
      uuid: a.uuid,
      displayName: a.displayName,
      developerName: a.developerName,
      fullPortrait: a.fullPortrait,
      bustPortrait: a.bustPortrait,
      displayIcon: a.displayIcon,
      background: a.background,
      backgroundGradientColors: a.backgroundGradientColors,
      roleUuid: a.role?.uuid ?? '',
      roleName: a.role?.displayName ?? '',
      roleIcon: a.role?.displayIcon ?? '',
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return (
    <>
      <PageHero
        eyebrow="Agents"
        title="Agents"
        th="เอเจนท์"
        description="ทุกเอเจนท์มีสกิลเฉพาะตัวและบทบาทที่ต่างกัน เลือกบทบาท ค้นหา แล้วกดเข้าไปดูสกิล เสียงพากย์ และโมเดล 3D"
        stats={[
          { label: 'Agents', value: agents.length },
          ...groups.map((g) => ({ label: g.role.displayName, value: g.agents.length })),
        ]}
      />
      <Container className="py-10 md:py-14">
        {slim.length ? (
          <Suspense>
            <AgentsClient agents={slim} roles={groups.map((g) => ({ uuid: g.uuid, name: g.role.displayName, icon: g.role.displayIcon }))} />
          </Suspense>
        ) : (
          <EmptyState />
        )}
      </Container>
    </>
  )
}
