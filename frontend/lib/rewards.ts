// แปลง reward ของ contract (มีแค่ type + uuid) ให้เป็นชื่อ/รูป/ลิงก์ ที่แสดงผลได้
// ใช้ฝั่ง server เท่านั้น เพราะต้องโหลดข้อมูลหลายชุดมาจับคู่

import { getAgents, getBuddies, getCurrencies, getFlex, getPlayerCards, getPlayerTitles, getSprays, getWeapons } from './api'
import type { ContractReward } from './valorant'

export interface ResolvedReward {
  type: string
  uuid: string
  name: string
  image: string | null
  amount: number
  isHighlighted: boolean
  /** ลิงก์ไปหน้าที่เกี่ยวข้อง (เช่น หน้าปืนของสกิน) */
  href: string | null
  /** รูปแนวตั้ง (การ์ด) ให้แสดงแบบ cover */
  tall: boolean
}

type Entry = Omit<ResolvedReward, 'amount' | 'isHighlighted' | 'type' | 'uuid'>

export async function buildRewardIndex() {
  const [weapons, buddies, sprays, cards, titles, currencies, agents, flex] = await Promise.all([
    getWeapons(),
    getBuddies(),
    getSprays(),
    getPlayerCards(),
    getPlayerTitles(),
    getCurrencies(),
    getAgents(),
    getFlex(),
  ])

  const index = new Map<string, Entry>()
  const put = (uuid: string, e: Entry) => index.set(uuid, e)

  for (const w of weapons) {
    for (const skin of w.skins) {
      const image = skin.displayIcon ?? skin.chromas[0]?.fullRender ?? skin.chromas[0]?.displayIcon ?? null
      // reward ของพาสชี้ไปที่ skin level (ส่วนใหญ่เลเวล 1) — เก็บทั้ง level, skin และ chroma ไว้
      for (const l of skin.levels) put(l.uuid, { name: skin.displayName, image: l.displayIcon ?? image, href: `/weapons/${w.uuid}`, tall: false })
      for (const c of skin.chromas) put(c.uuid, { name: c.displayName, image: c.fullRender ?? c.displayIcon ?? image, href: `/weapons/${w.uuid}`, tall: false })
      put(skin.uuid, { name: skin.displayName, image, href: `/weapons/${w.uuid}`, tall: false })
    }
  }
  for (const b of buddies) {
    put(b.uuid, { name: b.displayName, image: b.displayIcon, href: '/collection/buddies', tall: false })
    for (const l of b.levels ?? []) put(l.uuid, { name: b.displayName, image: l.displayIcon ?? b.displayIcon, href: '/collection/buddies', tall: false })
  }
  for (const s of sprays) put(s.uuid, { name: s.displayName, image: s.fullTransparentIcon ?? s.displayIcon, href: '/collection/sprays', tall: false })
  // ใช้ภาพแนวนอน (wideArt) ให้การ์ดสูงเท่ารางวัลอื่น ไม่ดันแถวให้สูงเกิน
  for (const c of cards) put(c.uuid, { name: c.displayName, image: c.wideArt ?? c.smallArt, href: '/collection/cards', tall: false })
  for (const t of titles) put(t.uuid, { name: t.titleText ?? t.displayName ?? '', image: null, href: '/collection/titles', tall: false })
  for (const c of currencies) put(c.uuid, { name: c.displayName, image: c.largeIcon ?? c.displayIcon, href: null, tall: false })
  for (const a of agents) put(a.uuid, { name: a.displayName, image: a.displayIcon, href: `/agents/${a.uuid}`, tall: false })
  for (const f of flex) put(f.uuid, { name: f.displayName, image: f.displayIcon, href: null, tall: false })

  return (r: ContractReward): ResolvedReward => {
    const e = index.get(r.uuid)
    return {
      type: r.type,
      uuid: r.uuid,
      amount: r.amount,
      isHighlighted: r.isHighlighted,
      name: e?.name ?? '',
      image: e?.image ?? null,
      href: e?.href ?? null,
      tall: e?.tall ?? false,
    }
  }
}
