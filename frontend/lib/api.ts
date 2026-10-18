// ดึงข้อมูลจาก https://valorant-api.com ตามภาษาที่ผู้ใช้เลือก
// ทุก fetch จะไม่ throw: ถ้า API ล่มจะคืนค่า fallback เพื่อให้หน้าเว็บยัง render ได้

import { apiLang } from './i18n'
import { getLang } from './i18n-server'
import type {
  Agent,
  Bundle,
  Buddy,
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
const REVALIDATE = 3600

async function request<T>(path: string, fallback: T, query: Record<string, string> = {}): Promise<T> {
  const params = new URLSearchParams({ language: apiLang(await getLang()), ...query })
  try {
    const res = await fetch(`${API_BASE}${path}?${params}`, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return fallback
    const json = await res.json()
    return (json?.data ?? fallback) as T
  } catch {
    return fallback
  }
}

export const getAgents = () => request<Agent[]>('/agents', [], { isPlayableCharacter: 'true' })
export const getAgent = (uuid: string) => request<Agent | null>(`/agents/${uuid}`, null)
export const getMaps = () => request<GameMap[]>('/maps', [])
export const getMap = (uuid: string) => request<GameMap | null>(`/maps/${uuid}`, null)
export const getWeapons = () => request<Weapon[]>('/weapons', [])
export const getWeapon = (uuid: string) => request<Weapon | null>(`/weapons/${uuid}`, null)
export const getContentTiers = () => request<ContentTier[]>('/contenttiers', [])
export const getCompetitiveTiers = () => request<CompetitiveSeason[]>('/competitivetiers', [])
export const getBundles = () => request<Bundle[]>('/bundles', [])
export const getPlayerCards = () => request<PlayerCard[]>('/playercards', [])
export const getSprays = () => request<Spray[]>('/sprays', [])
export const getBuddies = () => request<Buddy[]>('/buddies', [])
export const getPlayerTitles = () => request<PlayerTitle[]>('/playertitles', [])
export const getGameModes = () => request<GameMode[]>('/gamemodes', [])
export const getGear = () => request<Gear[]>('/gear', [])
export const getSeasons = () => request<Season[]>('/seasons', [])
export const getCurrencies = () => request<Currency[]>('/currencies', [])
export const getVersion = () => request<VersionInfo | null>('/version', null)
