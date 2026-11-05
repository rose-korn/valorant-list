// ดึงข้อมูลจาก https://valorant-api.com ตามภาษาของหน้า (/th หรือ /en)
// เว็บ build เป็นไฟล์ static: ทุก fetch เกิดตอน `next build` ครั้งเดียว แล้วเสิร์ฟเป็นไฟล์ธรรมดา

import { type Lang, apiLang } from './i18n'
import { applyThAbilityOverrides } from './th-abilities'
import type {
  Agent,
  Bundle,
  Buddy,
  Contract,
  Flex,
  CompetitiveSeason,
  ContentTier,
  Currency,
  GameMap,
  GameMode,
  Gear,
  PlayerCard,
  PlayerTitle,
  Season,
  Spray,
  VersionInfo,
  Weapon,
} from './valorant'

const API_BASE = process.env.VALORANT_API_BASE ?? 'https://valorant-api.com/v1'
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build'

// JSON บางตัว (weapons, playercards, sprays) ใหญ่เกินเพดาน cache 2MB ของ Next
// เลยจำ promise ไว้เองในหน่วยความจำ ทุกหน้าที่ build ใน process เดียวกันจะใช้ผลเดียวกัน ไม่ยิง API ซ้ำ
// ส่วน force-cache ของ Next จะเก็บผลลง .next/cache/fetch-cache แบบไม่มีวันหมดอายุ และ Cloudflare Workers Builds เก็บ .next/cache ข้าม build
// ถ้าไม่ลบ build ใหม่จะได้ข้อมูลเก่า (เช่น agent ใหม่ไม่ขึ้น) เลยให้ `prebuild` ใน package.json ลบโฟลเดอร์นี้ทิ้งทุกครั้ง
const memo = new Map<string, Promise<unknown>>()

/**
 * แปลง JSON จาก API — บางครั้ง valorant-api ส่งข้อความที่มีอักขระควบคุมดิบ (เช่น tab / ขึ้นบรรทัด) อยู่ในชื่อของ
 * ทำให้ JSON.parse พังทั้งก้อน ถ้าเจอแบบนั้นให้แทนอักขระควบคุมด้วยช่องว่างแล้วลองใหม่
 * (นอก string ช่องว่างไม่มีผล ใน string ก็แค่ได้ช่องว่างแทน tab/ขึ้นบรรทัด)
 */
function parseApiJson(text: string) {
  try {
    return JSON.parse(text)
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err
    return JSON.parse(text.replace(/[\u0000-\u001f]/g, ' '))
  }
}

async function fetchJson(url: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      // รอบลองใหม่ต้องได้ของสด ไม่งั้น Next จะคืนก้อนเสียเดิมจาก cache ทุกรอบ
      // ห้ามใช้ cache: 'no-store' — static export จะ error ว่าหน้าเป็น dynamic เลยเติม query ให้ URL ต่างไปแทน
      const res = await fetch(attempt === 0 ? url : `${url}&_retry=${attempt}`, { cache: 'force-cache' })
      if (res.ok) return parseApiJson(await res.text())?.data
      if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`)
      throw new Error(`HTTP ${res.status} (retry)`)
    } catch (err) {
      if (attempt >= 3) throw err
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
    }
  }
}

function request<T>(lang: Lang, path: string, fallback: T, query: Record<string, string> = {}): Promise<T> {
  const url = `${API_BASE}${path}?${new URLSearchParams({ language: apiLang(lang), ...query })}`
  let hit = memo.get(url) as Promise<T> | undefined
  if (!hit) {
    hit = fetchJson(url).then(
      (data) => (data ?? fallback) as T,
      (err) => {
        memo.delete(url)
        // ตอน build ถ้า API ล่มให้ build พังไปเลย เว็บเวอร์ชันเก่าที่ deploy ไว้จะยังอยู่ ดีกว่าได้หน้าว่าง ๆ ขึ้นไปแทน
        if (IS_BUILD) throw new Error(`valorant-api ${path} failed: ${err}`)
        return fallback
      },
    )
    memo.set(url, hit)
  }
  return hit
}

const byUuid = <T extends { uuid: string }>(list: T[], uuid: string) => list.find((x) => x.uuid === uuid) ?? null

const fetchAgents = (lang: Lang) => request<Agent[]>(lang, '/agents', [], { isPlayableCharacter: 'true' })
// ภาษาไทยใช้คำอธิบายสกิลที่เขียนใหม่ใน lib/th-abilities.ts แทนคำแปลจาก API (ถ้าสกิลยังเป็นเวอร์ชันเดิม)
// ทั้งสองภาษาถูก memo ไว้ใน request แล้ว ตรงนี้แค่ map ทับ ไม่ยิง API เพิ่ม
export const getAgents = async (lang: Lang): Promise<Agent[]> => {
  if (lang === 'en') return fetchAgents(lang)
  const [th, en] = await Promise.all([fetchAgents(lang), fetchAgents('en')])
  return applyThAbilityOverrides(th, en)
}
export const getAgent = async (lang: Lang, uuid: string) => byUuid(await getAgents(lang), uuid)
export const getMaps = (lang: Lang) => request<GameMap[]>(lang, '/maps', [])
export const getMap = async (lang: Lang, uuid: string) => byUuid(await getMaps(lang), uuid)
export const getWeapons = (lang: Lang) => request<Weapon[]>(lang, '/weapons', [])
export const getWeapon = async (lang: Lang, uuid: string) => byUuid(await getWeapons(lang), uuid)
export const getContentTiers = (lang: Lang) => request<ContentTier[]>(lang, '/contenttiers', [])
export const getCompetitiveTiers = (lang: Lang) => request<CompetitiveSeason[]>(lang, '/competitivetiers', [])
export const getBundles = (lang: Lang) => request<Bundle[]>(lang, '/bundles', [])
export const getPlayerCards = (lang: Lang) => request<PlayerCard[]>(lang, '/playercards', [])
export const getSprays = (lang: Lang) => request<Spray[]>(lang, '/sprays', [])
export const getBuddies = (lang: Lang) => request<Buddy[]>(lang, '/buddies', [])
export const getPlayerTitles = (lang: Lang) => request<PlayerTitle[]>(lang, '/playertitles', [])
export const getGameModes = (lang: Lang) => request<GameMode[]>(lang, '/gamemodes', [])
export const getGear = (lang: Lang) => request<Gear[]>(lang, '/gear', [])
export const getSeasons = (lang: Lang) => request<Season[]>(lang, '/seasons', [])
export const getCurrencies = (lang: Lang) => request<Currency[]>(lang, '/currencies', [])
export const getContracts = (lang: Lang) => request<Contract[]>(lang, '/contracts', [])
export const getContract = async (lang: Lang, uuid: string) => byUuid(await getContracts(lang), uuid)
export const getFlex = (lang: Lang) => request<Flex[]>(lang, '/flex', [])
export const getVersion = (lang: Lang) => request<VersionInfo | null>(lang, '/version', null)
