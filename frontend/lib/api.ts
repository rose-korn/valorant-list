// ดึงข้อมูลจาก https://valorant-api.com ตามภาษาของหน้า (/th หรือ /en)
// เว็บ build เป็นไฟล์ static: ทุก fetch เกิดตอน `next build` ครั้งเดียว แล้วเสิร์ฟเป็นไฟล์ธรรมดา

import { type Lang, apiLang } from './i18n'
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
const memo = new Map<string, Promise<unknown>>()

async function fetchJson(url: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { cache: 'force-cache' })
      if (res.ok) return (await res.json())?.data
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

export const getAgents = (lang: Lang) => request<Agent[]>(lang, '/agents', [], { isPlayableCharacter: 'true' })
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
