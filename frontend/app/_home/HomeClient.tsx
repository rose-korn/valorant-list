'use client'

import type { Agent } from '../agents/AgentsClient'
import type { GameMap } from '../maps/MapsClient'
import type { WeaponPreview } from './types'
import { useHomeAnimations } from './useHomeAnimations'
import Hero from './Hero'
import AgentsSection from './AgentsSection'
import MapsSection from './MapsSection'
import WeaponsSection from './WeaponsSection'
import Footer from './Footer'

export default function HomeClient({
  featuredAgent,
  agentPreviews,
  mapPreviews,
  weaponPreviews,
}: {
  featuredAgent?: Agent
  agentPreviews?: Agent[]
  mapPreviews?: GameMap[]
  weaponPreviews?: WeaponPreview[]
}) {
  const { rootRef, heroLeftRef, heroRightRef, heroBadgeRef } = useHomeAnimations([
    agentPreviews,
    mapPreviews,
    weaponPreviews,
  ])

  return (
    <div ref={rootRef} className="perspective">
      <Hero
        featuredAgent={featuredAgent}
        agentPreviews={agentPreviews}
        heroLeftRef={heroLeftRef}
        heroRightRef={heroRightRef}
        heroBadgeRef={heroBadgeRef}
      />
      <AgentsSection agentPreviews={agentPreviews} />
      <MapsSection mapPreviews={mapPreviews} />
      <WeaponsSection weaponPreviews={weaponPreviews} />
      <Footer />
    </div>
  )
}
