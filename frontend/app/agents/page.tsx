import type { Metadata } from 'next'
import { Suspense } from 'react'
import AgentsClient from './AgentsClient'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getAgents, groupByRole } from '@/lib/valorant'

export const metadata: Metadata = { title: 'เอเจนท์' }

export default async function AgentsPage() {
  const agents = await getAgents()
  const groups = groupByRole(agents)

  // ส่งเฉพาะ field ที่การ์ดใช้ ลดขนาด payload
  const slim = agents
    .map((a) => ({
      uuid: a.uuid,
      displayName: a.displayName,
      developerName: a.developerName,
      bustPortrait: a.bustPortrait,
      displayIcon: a.displayIcon,
      backgroundGradientColors: a.backgroundGradientColors,
      roleUuid: a.role?.uuid ?? '',
      roleName: a.role?.displayName ?? '',
      roleIcon: a.role?.displayIcon ?? '',
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return (
    <>
      <PageHero
        en="Agents"
        title="เอเจนท์ทั้งหมด"
        description="กรองตามบทบาท หรือพิมพ์ชื่อหาได้เลย กดที่ตัวไหนก็เข้าไปดูสกิล ฟังเสียงพากย์ และหมุนดูแบบ 3D"
        facts={[{ label: 'ตัว', value: agents.length }, ...groups.map((g) => ({ label: g.role.displayName, value: g.agents.length }))]}
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
