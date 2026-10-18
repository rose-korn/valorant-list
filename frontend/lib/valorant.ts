// Type และ helper ของข้อมูลจาก https://valorant-api.com (ใช้ได้ทั้ง server และ client)
// ส่วนดึงข้อมูลอยู่ที่ lib/api.ts

export interface Ability {
  slot: string
  displayName: string
  description: string
  displayIcon: string | null
}

export interface Agent {
  uuid: string
  displayName: string
  description: string
  developerName: string
  characterTags: string[] | null
  displayIcon: string
  displayIconSmall: string
  bustPortrait: string | null
  fullPortrait: string | null
  fullPortraitV2: string | null
  killfeedPortrait: string
  background: string | null
  backgroundGradientColors: string[]
  isPlayableCharacter: boolean
  role: { uuid: string; displayName: string; description: string; displayIcon: string } | null
  abilities: Ability[]
  voiceLine: { mediaList: { id: number; wwise: string; wave: string }[] } | null
}

export interface Callout {
  regionName: string
  superRegionName: string
  location: { x: number; y: number }
}

export interface GameMap {
  uuid: string
  displayName: string
  narrativeDescription: string | null
  tacticalDescription: string | null
  coordinates: string | null
  displayIcon: string | null
  listViewIcon: string | null
  listViewIconTall: string | null
  splash: string | null
  stylizedBackgroundImage: string | null
  premierBackgroundImage: string | null
  mapUrl: string
  xMultiplier: number
  yMultiplier: number
  xScalarToAdd: number
  yScalarToAdd: number
  callouts: Callout[] | null
}

export interface DamageRange {
  rangeStartMeters: number
  rangeEndMeters: number
  headDamage: number
  bodyDamage: number
  legDamage: number
}

export interface WeaponStats {
  fireRate: number
  magazineSize: number
  runSpeedMultiplier: number
  equipTimeSeconds: number
  reloadTimeSeconds: number
  firstBulletAccuracy: number
  shotgunPelletCount: number
  wallPenetration: string
  feature: string | null
  fireMode: string | null
  altFireType: string | null
  adsStats: { zoomMultiplier: number; fireRate: number; runSpeedMultiplier: number; burstCount: number; firstBulletAccuracy: number } | null
  damageRanges: DamageRange[]
}

export interface Chroma {
  uuid: string
  displayName: string
  displayIcon: string | null
  fullRender: string | null
  swatch: string | null
  streamedVideo: string | null
}

export interface SkinLevel {
  uuid: string
  displayName: string
  levelItem: string | null
  displayIcon: string | null
  streamedVideo: string | null
}

export interface Skin {
  uuid: string
  displayName: string
  themeUuid: string
  contentTierUuid: string | null
  displayIcon: string | null
  wallpaper: string | null
  chromas: Chroma[]
  levels: SkinLevel[]
}

export interface Weapon {
  uuid: string
  displayName: string
  category: string
  defaultSkinUuid: string
  displayIcon: string
  killStreamIcon: string
  weaponStats: WeaponStats | null
  shopData: { cost: number; category: string; categoryText: string; newImage: string | null } | null
  skins: Skin[]
}

export interface ContentTier {
  uuid: string
  displayName: string
  devName: string
  rank: number
  juiceValue: number
  highlightColor: string
  displayIcon: string
}

export interface Tier {
  tier: number
  tierName: string
  division: string
  divisionName: string
  color: string
  backgroundColor: string
  smallIcon: string | null
  largeIcon: string | null
  rankTriangleDownIcon: string | null
  rankTriangleUpIcon: string | null
}

export interface CompetitiveSeason {
  uuid: string
  assetObjectName: string
  tiers: Tier[]
}

export interface Bundle {
  uuid: string
  displayName: string
  displayNameSubText: string | null
  description: string
  extraDescription: string | null
  promoDescription: string | null
  displayIcon: string
  displayIcon2: string
  verticalPromoImage: string | null
}

export interface PlayerCard {
  uuid: string
  displayName: string
  isHiddenIfNotOwned: boolean
  displayIcon: string
  smallArt: string
  wideArt: string
  largeArt: string | null
}

export interface Spray {
  uuid: string
  displayName: string
  category: string | null
  displayIcon: string
  fullIcon: string | null
  fullTransparentIcon: string | null
  animationPng: string | null
  animationGif: string | null
}

export interface Buddy {
  uuid: string
  displayName: string
  isHiddenIfNotOwned: boolean
  displayIcon: string
  levels?: { uuid: string; charmLevel: number; displayName: string; displayIcon: string }[]
}

/** ของแต่งโปรไฟล์ (Flex / Totem) ที่อยู่ในพาส */
export interface Flex {
  uuid: string
  displayName: string
  displayIcon: string
}

export interface ContractReward {
  /** EquippableSkinLevel | EquippableCharmLevel | Spray | PlayerCard | Title | Currency | Character | Totem */
  type: string
  uuid: string
  amount: number
  isHighlighted: boolean
}

export interface ContractLevel {
  reward: ContractReward
  xp: number
  vpCost: number
  isPurchasableWithVP: boolean
}

export interface Contract {
  uuid: string
  displayName: string
  displayIcon: string | null
  shipIt: boolean
  content: {
    /** Season = Battle Pass, Agent = สัญญาเอเจนท์, Event = พาสอีเวนต์ */
    relationType: string | null
    relationUuid: string | null
    chapters: { isEpilogue: boolean; levels: ContractLevel[]; freeRewards: ContractReward[] | null }[]
    premiumVPCost: number
  }
}

export interface PlayerTitle {
  uuid: string
  displayName: string | null
  titleText: string | null
  isHiddenIfNotOwned: boolean
}

export interface GameMode {
  uuid: string
  displayName: string
  description: string | null
  duration: string | null
  economyType: string | null
  allowsMatchTimeouts: boolean
  isTeamVoiceAllowed: boolean
  isMinimapHidden: boolean
  orbCount: number
  roundsPerHalf: number
  teamRoles: string[] | null
  displayIcon: string | null
  listViewIconTall: string | null
}

export interface Gear {
  uuid: string
  displayName: string
  description: string
  descriptions?: string[] | null
  details?: { name: string; value: string }[] | null
  displayIcon: string
  shopData: { cost: number; categoryText: string; newImage: string | null } | null
}

export interface Season {
  uuid: string
  displayName: string
  title: string | null
  type: string | null
  startTime: string
  endTime: string
  parentUuid: string | null
}

export interface Currency {
  uuid: string
  displayName: string
  displayNameSingular: string
  displayIcon: string
  largeIcon: string | null
}

export interface VersionInfo {
  manifestId: string
  branch: string
  version: string
  buildVersion: string
  engineVersion: string
  riotClientVersion: string
  riotClientBuild: string
  buildDate: string
}


// ---------- helpers ----------

/** สี API มาเป็น RRGGBBAA → แปลงเป็น #RRGGBB */
export function agentColor(agent: Pick<Agent, 'backgroundGradientColors'> | null | undefined, index = 0, fallback = '#ff4654') {
  const raw = agent?.backgroundGradientColors?.[index]
  return raw ? `#${raw.slice(0, 6)}` : fallback
}

export function rgbaHex(raw: string | null | undefined, fallback = '#ff4654') {
  return raw ? `#${raw.slice(0, 6)}` : fallback
}

// uuid ของ role ใน valorant-api (ไม่ขึ้นกับภาษา) เรียง Duelist → Initiator → Controller → Sentinel
const ROLE_UUID_ORDER = [
  'dbe8757e-9e92-4ed4-b39f-9dfc589691d4',
  '1b47567f-8f7b-444b-aae3-b0c634622d10',
  '4ee40330-ecdd-4f2f-98a8-eb1243428373',
  '5fc02f99-4091-4486-a531-98459a3e95e9',
]

export type RoleGroup = { uuid: string; role: NonNullable<Agent['role']>; agents: Agent[] }

export function groupByRole(agents: Agent[]): RoleGroup[] {
  const groups = new Map<string, RoleGroup>()
  for (const a of agents) {
    if (!a.role) continue
    const g = groups.get(a.role.uuid) ?? { uuid: a.role.uuid, role: a.role, agents: [] }
    g.agents.push(a)
    groups.set(a.role.uuid, g)
  }
  const rank = (uuid: string) => {
    const i = ROLE_UUID_ORDER.indexOf(uuid)
    return i === -1 ? 99 : i
  }
  return [...groups.values()].sort((a, b) => rank(a.uuid) - rank(b.uuid))
}

export const KEYBIND: Record<string, string> = {
  Ability1: 'Q',
  Ability2: 'E',
  Grenade: 'C',
  Ultimate: 'X',
  Passive: 'P',
}

export const SLOT_ORDER = ['Grenade', 'Ability1', 'Ability2', 'Ultimate', 'Passive']

export const WEAPON_CATEGORIES = [
  { key: 'EEquippableCategory::Sidearm', label: 'Sidearms', th: 'ปืนพก' },
  { key: 'EEquippableCategory::SMG', label: 'SMGs', th: 'ปืนกลมือ' },
  { key: 'EEquippableCategory::Shotgun', label: 'Shotguns', th: 'ลูกซอง' },
  { key: 'EEquippableCategory::Rifle', label: 'Rifles', th: 'ไรเฟิล' },
  { key: 'EEquippableCategory::Sniper', label: 'Snipers', th: 'สไนเปอร์' },
  { key: 'EEquippableCategory::Heavy', label: 'Machine Guns', th: 'ปืนกลหนัก' },
  { key: 'EEquippableCategory::Melee', label: 'Melee', th: 'มีด' },
]

export function categoryLabel(category: string) {
  return WEAPON_CATEGORIES.find((c) => c.key === category)?.label ?? category.split('::')[1] ?? category
}

export const WALL_PEN: Record<string, string> = {
  'EWallPenetrationDisplayType::Low': 'Low',
  'EWallPenetrationDisplayType::Medium': 'Medium',
  'EWallPenetrationDisplayType::High': 'High',
}

/** ตัดสกินที่ไม่ใช่สกินจริง (Standard / Random Favorite) */
export function isRealSkin(skin: Skin) {
  const name = skin.displayName.toLowerCase()
  return !!skin.contentTierUuid && !name.includes('random favorite') && !name.startsWith('standard')
}

export function skinImage(skin: Skin) {
  return skin.displayIcon ?? skin.chromas?.[0]?.fullRender ?? skin.chromas?.[0]?.displayIcon ?? skin.levels?.[0]?.displayIcon ?? null
}

/** ตำแหน่ง callout บน minimap (0..1) ตามสูตรของ valorant-api */
export function calloutToUV(map: GameMap, c: Callout) {
  return {
    u: c.location.y * map.xMultiplier + map.xScalarToAdd,
    v: c.location.x * map.yMultiplier + map.yScalarToAdd,
  }
}

/** แผนที่ที่เล่นได้จริงใน competitive (มี callouts + tacticalDescription) */
export function isCompetitiveMap(map: GameMap) {
  return !!map.tacticalDescription && !!map.callouts?.length
}

/** แรงค์ปัจจุบัน (ตัด Unranked และ tier ที่ไม่ได้ใช้) */
export function latestTiers(seasons: CompetitiveSeason[]) {
  const latest = seasons[seasons.length - 1]
  return (latest?.tiers ?? []).filter(
    (t) => t.tier > 0 && t.largeIcon && !`${t.tierName} ${t.divisionName}`.toUpperCase().includes('UNUSED'),
  )
}

/** เวลาปัจจุบันตอน render ฝั่ง server (หน้า ISR จะอัปเดตทุก revalidate) */
export function nowMs() {
  return Date.now()
}

/** index ของวัน ใช้หมุนเวียนเนื้อหาเด่นรายวัน */
export function dayIndex() {
  return Math.floor(nowMs() / 86_400_000)
}

/** ชื่อสั้นของสิ่งที่ปลดในแต่ละเลเวลสกิน (EEquippableSkinLevelItem::X → X) */
export function levelItemKey(levelItem: string | null) {
  return levelItem ? (levelItem.split('::')[1] ?? levelItem) : 'Base'
}

/** ชื่อ "Episode X · Act Y" จาก season ที่ contract ผูกอยู่ */
export function actLabel(contract: Contract, seasons: Season[]) {
  const act = seasons.find((s) => s.uuid === contract.content.relationUuid)
  const ep = act?.parentUuid ? seasons.find((s) => s.uuid === act.parentUuid) : null
  return {
    act,
    label: [ep?.title ?? ep?.displayName, act?.title ?? act?.displayName].filter(Boolean).join(' · '),
  }
}

export function formatDuration(seconds: number) {
  return `${seconds.toFixed(seconds < 1 ? 2 : 1)}s`
}
