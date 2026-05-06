import WeaponsClient from "./WeaponsClient"


async function getWeapons() {
    const res = await fetch(
      'https://valorant-api.com/v1/weapons?language=th-TH',
      { cache: 'no-store' } // 
    )
    const data = await res.json()
  
    // กรองเฉพาะ field ที่ใช้ ตัด skins ออก
    return data.data.map((w: any) => ({
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