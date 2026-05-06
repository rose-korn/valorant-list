import MapsClient from "./MapsClient"


async function getMaps() {
  const res = await fetch(
    'https://valorant-api.com/v1/maps?language=th-TH',
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.data.filter((m: any) => m.splash)
}

export default async function MapsPage() {
  const maps = await getMaps()
  return <MapsClient maps={maps} />
}