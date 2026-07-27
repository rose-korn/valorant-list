import type { Agent } from './agents/AgentsClient'
import type { GameMap } from './maps/MapsClient'
import type { Weapon } from './weapons/WeaponsClient'
import HomeClient from './_home/HomeClient'

async function getHomeData() {
  const [agentsRes, mapsRes, weaponsRes] = await Promise.all([
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=th-TH', { next: { revalidate: 3600 } }),
    fetch('https://valorant-api.com/v1/maps?language=th-TH', { next: { revalidate: 3600 } }),
    // response is ~5MB, over Next's 2MB data-cache limit, so revalidate can't cache it
    fetch('https://valorant-api.com/v1/weapons?language=th-TH', { cache: 'no-store' }),
  ])
  const [agents, maps, weapons] = await Promise.all([
    agentsRes.json(),
    mapsRes.json(),
    weaponsRes.json(),
  ])
  return {
    // สุ่มเอาตัวนึง
    featuredAgent: agents.data?.[Math.floor(Math.random() * 10)] as Agent | undefined,
    // เอามาแสดงใน grid
    agentPreviews: agents.data?.slice(0, 6) as Agent[] | undefined,
    mapPreviews: maps.data?.filter((m: GameMap) => m.splash).slice(0, 3) as GameMap[] | undefined,
    weaponPreviews: weapons.data
      ?.filter((w: Weapon) => w.displayIcon)
      .slice(0, 5)
      .map((w: Weapon) => ({
        uuid: w.uuid,
        displayName: w.displayName,
        displayIcon: w.displayIcon,
      })),
  }
}

export default async function HomePage() {
  const { featuredAgent, agentPreviews, mapPreviews, weaponPreviews } = await getHomeData()

  return (
    <HomeClient
      featuredAgent={featuredAgent}
      agentPreviews={agentPreviews}
      mapPreviews={mapPreviews}
      weaponPreviews={weaponPreviews}
    />
  )
}
