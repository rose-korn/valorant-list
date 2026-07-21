import MapsClient, { type GameMap } from "./MapsClient"


async function getMaps(): Promise<GameMap[]> {
  const res = await fetch(
    'https://valorant-api.com/v1/maps?language=th-TH',
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.data.filter((m: GameMap) => m.splash)
}

export default async function MapsPage() {
  const maps = await getMaps()
  return <MapsClient maps={maps} />
}