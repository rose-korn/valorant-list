// เตรียมโจทย์ทายรายวันฝั่ง server ตอน build — คำนวณล่วงหน้า GUESS_DAYS วัน ฝั่ง client เลือกโจทย์ของวันนี้ตามเวลาไทย
// (แบบเดียวกับของประจำวันบนหน้าแรก) ทุกคนได้โจทย์เดียวกันเพราะใช้ seed จากเลขวัน

import { BUILT_AT } from '@/lib/first-seen'
import {
  type Agent,
  type GameMap,
  type Weapon,
  SLOT_ORDER,
  agentColor,
  calloutToUV,
  isCompetitiveMap,
  isRealSkin,
  pickOfDay,
  seeded,
  skinImage,
  thaiDay,
} from '@/lib/valorant'

/** เว็บ build ใหม่อย่างน้อยสัปดาห์ละครั้ง เผื่อไว้ 3 สัปดาห์ */
export const GUESS_DAYS = 21
/** วันแรกของเกม (ข้อ #1) เวลาไทย */
export const GUESS_EPOCH = thaiDay(Date.UTC(2026, 10, 6, 0, 0))

export interface GuessAgentOption {
  uuid: string
  name: string
  icon: string
  color: string
  role: string
}

export interface AgentPuzzle {
  uuid: string
  /** ไอคอนสกิล (ไม่รวม passive) สลับลำดับตาม seed ของวัน */
  icons: string[]
}

export interface SkinPuzzle {
  name: string
  weaponUuid: string
  uuid: string
  image: string
  /** จุดที่ซูมเข้าไป (0..1) */
  fx: number
  fy: number
}

export interface CalloutPuzzle {
  mapUuid: string
  mapName: string
  minimap: string
  u: number
  v: number
  answer: string
  zone: string
  options: string[]
}

export interface GuessPlan {
  start: number
  builtAt: number
  epoch: number
  agents: GuessAgentOption[]
  skinNames: string[]
  agentDays: (AgentPuzzle | null)[]
  skinDays: (SkinPuzzle | null)[]
  calloutDays: (CalloutPuzzle | null)[]
}

const byUuid = <T extends { uuid: string }>(list: T[]) => [...list].sort((a, b) => a.uuid.localeCompare(b.uuid))

function shuffled<T>(list: T[], seed: number) {
  const rand = seeded(seed)
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const calloutLabel = (c: { superRegionName: string; regionName: string }) =>
  // "Mid Courtyard", "A Main" — ถ้าชื่อซ้ำกับโซนอยู่แล้วไม่ต้องเติม
  c.regionName.toLowerCase().startsWith(c.superRegionName.toLowerCase()) ? c.regionName : `${c.superRegionName} ${c.regionName}`

export function guessPlan({ agents, weapons, maps }: { agents: Agent[]; weapons: Weapon[]; maps: GameMap[] }): GuessPlan {
  const start = thaiDay(BUILT_AT)
  const days = Array.from({ length: GUESS_DAYS }, (_, i) => start + i)

  const agentPool = byUuid(agents.filter((a) => a.abilities.some((x) => x.displayIcon && x.slot !== 'Passive')))
  const skinPool = byUuid(
    weapons.flatMap((w) =>
      w.skins
        .filter(isRealSkin)
        .map((s) => ({ uuid: s.uuid, name: s.displayName, weaponUuid: w.uuid, image: skinImage(s) }))
        .filter((s): s is typeof s & { image: string } => !!s.image),
    ),
  )
  const mapPool = byUuid(maps.filter((m) => isCompetitiveMap(m) && m.displayIcon))

  return {
    start,
    builtAt: BUILT_AT,
    epoch: GUESS_EPOCH,
    agents: agentPool
      .map((a) => ({ uuid: a.uuid, name: a.displayName, icon: a.displayIcon, color: agentColor(a), role: a.role?.displayName ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    skinNames: Array.from(new Set(skinPool.map((s) => s.name))).sort((a, b) => a.localeCompare(b)),
    agentDays: days.map((d) => {
      const a = pickOfDay(agentPool, d, 11)
      if (!a) return null
      const icons = a.abilities
        .filter((x) => x.displayIcon && x.slot !== 'Passive')
        .sort((x, y) => SLOT_ORDER.indexOf(x.slot) - SLOT_ORDER.indexOf(y.slot))
        .map((x) => x.displayIcon!)
      return { uuid: a.uuid, icons: shuffled(icons, d * 31 + 7) }
    }),
    skinDays: days.map((d) => {
      const s = pickOfDay(skinPool, d, 12)
      if (!s) return null
      const rand = seeded(d * 17 + 3)
      // รูปสกินเป็นปืนวางแนวนอนกลางภาพ: ซูมแถว ๆ กลางตัวปืน ไม่ให้ไปโดนพื้นที่ว่าง
      return { ...s, fx: 0.3 + rand() * 0.4, fy: 0.42 + rand() * 0.16 }
    }),
    calloutDays: days.map((d) => {
      const m = pickOfDay(mapPool, d, 13)
      if (!m?.callouts?.length || !m.displayIcon) return null
      const valid = m.callouts.filter((c) => {
        const { u, v } = calloutToUV(m, c)
        return u > 0.04 && u < 0.96 && v > 0.04 && v < 0.96
      })
      if (!valid.length) return null
      const c = valid[Math.floor(seeded(d * 23 + 5)() * valid.length)]
      const { u, v } = calloutToUV(m, c)
      const options = Array.from(new Set(m.callouts.map(calloutLabel))).sort((a, b) => a.localeCompare(b))
      return { mapUuid: m.uuid, mapName: m.displayName, minimap: m.displayIcon, u, v, answer: calloutLabel(c), zone: c.superRegionName, options }
    }),
  }
}
