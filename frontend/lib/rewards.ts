// แปลง reward ของ contract (มีแค่ type + uuid) ให้เป็นชื่อ/รูป/ลิงก์ ที่แสดงผลได้
// ใช้ฝั่ง server เท่านั้น เพราะต้องโหลดข้อมูลหลายชุดมาจับคู่

import { getAgents, getBuddies, getCurrencies, getFlex, getPlayerCards, getPlayerTitles, getSprays, getWeapons } from './api'
import type { Lang } from './i18n'
import type { Contract, ContractReward } from './valorant'

export interface ResolvedReward {
  type: string
  uuid: string
  name: string
  image: string | null
  amount: number
  isHighlighted: boolean
  /** รูปใหญ่สำหรับช่องพรีวิว (เช่น การ์ดแนวตั้ง, สกินเต็ม) */
  preview: string | null
}

type Entry = Omit<ResolvedReward, 'amount' | 'isHighlighted' | 'type' | 'uuid'>

export async function buildRewardIndex(lang: Lang) {
  const [weapons, buddies, sprays, cards, titles, currencies, agents, flex] = await Promise.all([
    getWeapons(lang),
    getBuddies(lang),
    getSprays(lang),
    getPlayerCards(lang),
    getPlayerTitles(lang),
    getCurrencies(lang),
    getAgents(lang),
    getFlex(lang),
  ])

  const index = new Map<string, Entry>()
  const put = (uuid: string, e: Entry) => index.set(uuid, e)

  for (const w of weapons) {
    for (const skin of w.skins) {
      const image = skin.displayIcon ?? skin.chromas[0]?.fullRender ?? skin.chromas[0]?.displayIcon ?? null
      const preview = skin.chromas[0]?.fullRender ?? image
      // reward ของพาสชี้ไปที่ skin level (ส่วนใหญ่เลเวล 1) — เก็บทั้ง level, skin และ chroma ไว้
      for (const l of skin.levels) put(l.uuid, { name: skin.displayName, image: l.displayIcon ?? image, preview })
      for (const c of skin.chromas) put(c.uuid, { name: c.displayName, image: c.fullRender ?? c.displayIcon ?? image, preview: c.fullRender ?? preview })
      put(skin.uuid, { name: skin.displayName, image, preview })
    }
  }
  for (const b of buddies) {
    put(b.uuid, { name: b.displayName, image: b.displayIcon, preview: b.displayIcon })
    for (const l of b.levels ?? []) put(l.uuid, { name: b.displayName, image: l.displayIcon ?? b.displayIcon, preview: l.displayIcon ?? b.displayIcon })
  }
  for (const s of sprays) put(s.uuid, { name: s.displayName, image: s.fullTransparentIcon ?? s.displayIcon, preview: s.animationGif ?? s.fullTransparentIcon ?? s.displayIcon })
  for (const c of cards) put(c.uuid, { name: c.displayName, image: c.largeArt ?? c.smallArt, preview: c.largeArt ?? c.wideArt })
  for (const t of titles) put(t.uuid, { name: t.titleText ?? t.displayName ?? '', image: null, preview: null })
  for (const c of currencies) put(c.uuid, { name: c.displayName, image: c.largeIcon ?? c.displayIcon, preview: c.largeIcon ?? c.displayIcon })
  for (const a of agents) put(a.uuid, { name: a.displayName, image: a.displayIcon, preview: a.fullPortrait ?? a.displayIcon })
  for (const f of flex) put(f.uuid, { name: f.displayName, image: f.displayIcon, preview: f.displayIcon })

  return (r: ContractReward): ResolvedReward => {
    const e = index.get(r.uuid)
    return {
      type: r.type,
      uuid: r.uuid,
      amount: r.amount,
      isHighlighted: r.isHighlighted,
      name: e?.name ?? '',
      image: e?.image ?? null,
      preview: e?.preview ?? e?.image ?? null,
    }
  }
}

export interface PassChapterData {
  isEpilogue: boolean
  levels: { tier: number; xp: number; total: number; reward: ResolvedReward }[]
  free: ResolvedReward[]
}

/** แปลง contract เป็นบท ๆ — ระดับนับต่อเนื่องข้ามบท และคิด XP สะสมให้ด้วย */
export function buildPassChapters(contract: Contract | undefined | null, resolve: (r: ContractReward) => ResolvedReward): PassChapterData[] {
  let tier = 0
  let total = 0
  return (contract?.content.chapters ?? []).map((ch) => ({
    isEpilogue: ch.isEpilogue,
    levels: ch.levels.map((l) => {
      tier += 1
      total += l.xp
      return { tier, xp: l.xp, total, reward: resolve(l.reward) }
    }),
    free: (ch.freeRewards ?? []).map(resolve),
  }))
}
