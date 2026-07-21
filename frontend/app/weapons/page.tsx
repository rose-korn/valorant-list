import WeaponsClient, { type Weapon } from "./WeaponsClient"


async function getWeapons(): Promise<Weapon[]> {
    const res = await fetch(
      'https://valorant-api.com/v1/weapons?language=th-TH',
      // response is ~5MB, over Next's 2MB data-cache limit, so revalidate can't cache it
      { cache: 'no-store' }
    )
    const data = await res.json()

    // กรองเฉพาะ field ที่ใช้ ตัด skins ออก
    return data.data.map((w: Weapon) => ({
      uuid: w.uuid,
      displayName: w.displayName,
      category: w.category,
      displayIcon: w.displayIcon,
      shopData: w.shopData,
      weaponStats: w.weaponStats,
    }))
  }

export default async function WeaponsPage() {
  const weapons = await getWeapons()
  return <WeaponsClient weapons={weapons} />
}