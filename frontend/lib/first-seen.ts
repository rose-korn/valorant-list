// อ่าน public/first-seen.json (เขียนโดย scripts/first-seen.mjs ตอน prebuild) — ใช้ฝั่ง server ตอน build เท่านั้น
// บอกว่าของแต่ละชิ้นโผล่ใน valorant-api ครั้งแรกวันไหน (เลขวัน, 0 = มีมาตั้งแต่ก่อนเริ่มจด)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type SeenKind = 'agents' | 'maps' | 'skins' | 'bundles' | 'cards' | 'sprays' | 'buddies'

interface FirstSeenFile {
  builtAt: string
  version: string
  patches: { version: string; day: number }[]
  kinds: Partial<Record<SeenKind, Record<string, number>>>
}

function load(): FirstSeenFile | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'public', 'first-seen.json'), 'utf8'))
  } catch {
    // ตอน `next dev` หรือยังไม่เคยรัน prebuild — ไม่มีของใหม่
    return null
  }
}

const data = load()

/** เวลาตอน build (ms) ใช้เป็นค่าเริ่มต้นตอน render HTML ก่อนฝั่ง client จะใช้เวลาจริง */
export const BUILT_AT = data ? Date.parse(data.builtAt) : Date.now()

/** วันที่เห็นของชิ้นนี้ครั้งแรก (เลขวัน) — 0 ถ้าเป็นของเก่าหรือไม่รู้ */
export function firstSeen(kind: SeenKind, uuid: string): number {
  return data?.kinds[kind]?.[uuid] ?? 0
}

/** patch ปัจจุบันและวันที่เว็บเห็นครั้งแรก */
export function currentPatch() {
  if (!data) return null
  return data.patches.find((p) => p.version === data.version) ?? { version: data.version, day: 0 }
}
