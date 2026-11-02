// รันก่อน `next build` (prebuild): จดว่าของแต่ละชิ้น (สกิน, บันเดิล, การ์ด ฯลฯ) โผล่ใน valorant-api ครั้งแรกวันไหน
// valorant-api ไม่มีวันที่ออกของพวกนี้ให้ (มีแค่เอเจนท์) เลยต้องจดเอง:
//   1. ดึง /first-seen.json ของเว็บที่ deploy อยู่ (ผลของ build รอบก่อน)
//   2. ของที่เคยเห็นแล้วใช้วันเดิม ของที่ไม่เคยเห็นจดเป็นวันนี้
//   3. เขียนผลลง public/first-seen.json → หน้าเว็บอ่านตอน build และไฟล์นี้ถูก deploy ไปด้วยให้ build รอบหน้าใช้ต่อ
// วันที่เก็บเป็นเลขวัน (จำนวนวันนับจาก 1970-01-01 UTC) ส่วน 0 = ของที่มีอยู่ตั้งแต่ก่อนเริ่มจด (ไม่นับว่าใหม่)
//
// ถ้าเว็บยังไม่มีไฟล์นี้ (404) = รอบแรก ทุกอย่างเป็น 0
// ถ้าดึงไม่ได้เพราะเหตุอื่น (เน็ตล่ม, 5xx) ให้ build พังไปเลย ดีกว่าลบประวัติทิ้งแล้วป้าย NEW หายหมด
// ตั้ง FIRST_SEEN_RESET=1 เพื่อข้ามเงื่อนไขนี้ (เริ่มจดใหม่หมด)
import { mkdir, writeFile } from 'node:fs/promises'

const API_BASE = process.env.VALORANT_API_BASE ?? 'https://valorant-api.com/v1'
const SITE_URL = (process.env.SITE_URL ?? 'https://valo-thai.rosekorn.com').replace(/\/$/, '')
const OUT = new URL('../public/first-seen.json', import.meta.url)
const today = Math.floor(Date.now() / 86_400_000)

async function api(path) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()).data
    } catch (err) {
      if (attempt >= 3) throw new Error(`valorant-api ${path} failed: ${err}`)
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
    }
  }
}

async function previous() {
  if (process.env.FIRST_SEEN_RESET === '1') return null
  let res
  try {
    res = await fetch(`${SITE_URL}/first-seen.json`, { headers: { 'cache-control': 'no-cache' } })
  } catch (err) {
    throw new Error(`fetch ${SITE_URL}/first-seen.json failed: ${err} (set FIRST_SEEN_RESET=1 to start over)`)
  }
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${SITE_URL}/first-seen.json: HTTP ${res.status} (set FIRST_SEEN_RESET=1 to start over)`)
  const json = await res.json().catch(() => null)
  return json && typeof json.kinds === 'object' ? json : null
}

const [agents, maps, weapons, bundles, cards, sprays, buddies, version, prev] = await Promise.all([
  api('/agents?isPlayableCharacter=true'),
  api('/maps'),
  api('/weapons'),
  api('/bundles'),
  api('/playercards'),
  api('/sprays'),
  api('/buddies'),
  api('/version'),
  previous(),
])

const current = {
  agents: agents.map((x) => x.uuid),
  maps: maps.map((x) => x.uuid),
  skins: weapons.flatMap((w) => w.skins.map((s) => s.uuid)),
  bundles: bundles.map((x) => x.uuid),
  cards: cards.map((x) => x.uuid),
  sprays: sprays.map((x) => x.uuid),
  buddies: buddies.map((x) => x.uuid),
}

const kinds = {}
const added = {}
for (const [kind, ids] of Object.entries(current)) {
  const before = prev?.kinds?.[kind]
  kinds[kind] = {}
  added[kind] = 0
  for (const id of ids) {
    // หมวดที่เพิ่งเริ่มจด (ไม่มีในไฟล์เก่า) นับเป็นของเดิมทั้งหมด
    const day = before ? (before[id] ?? today) : 0
    kinds[kind][id] = day
    if (day === today && before) added[kind]++
  }
}

// ประวัติ patch: จำวันที่เห็นแต่ละเวอร์ชันครั้งแรก (เก็บแค่ 20 อันล่าสุด)
const patches = Array.isArray(prev?.patches) ? prev.patches.slice() : []
if (!patches.some((p) => p.version === version.version)) patches.push({ version: version.version, day: today })

const data = { builtAt: new Date().toISOString(), version: version.version, patches: patches.slice(-20), kinds }
await mkdir(new URL('.', OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(data))
console.log(`first-seen.json: ${prev ? 'updated' : 'started fresh'}, new today: ${JSON.stringify(added)}`)
