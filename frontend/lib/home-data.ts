// เตรียมข้อมูลของประจำวันและ "มีอะไรใหม่" ให้หน้าแรก (ฝั่ง server ตอน build)
import type { DailyPlan } from '@/components/home/Daily'
import type { NewItem } from '@/components/home/WhatsNew'
import { BUILT_AT, firstSeen } from './first-seen'
import {
  type Agent,
  type Bundle,
  type Buddy,
  type ContentTier,
  type GameMap,
  type PlayerCard,
  type Spray,
  type Weapon,
  NEW_ITEM_DAYS,
  agentColor,
  isRealSkin,
  pickOfDay,
  rgbaHex,
  skinImage,
  thaiDay,
} from './valorant'

/** คำนวณของประจำวันล่วงหน้ากี่วัน — เว็บ build ใหม่อย่างน้อยสัปดาห์ละครั้ง (rebuild.yml) เผื่อไว้ 2 สัปดาห์ */
export const DAILY_DAYS = 14

export function dailyPlan({
  agents,
  weapons,
  maps,
  cards,
  tiers,
}: {
  agents: Agent[]
  weapons: Weapon[]
  maps: GameMap[]
  cards: PlayerCard[]
  tiers: ContentTier[]
}): DailyPlan {
  const start = thaiDay(BUILT_AT)
  const days = Array.from({ length: DAILY_DAYS }, (_, i) => start + i)
  const tierOf = new Map(tiers.map((t) => [t.uuid, t]))

  // เรียง pool ให้คงที่ (ตาม uuid) ลำดับใน API จะเปลี่ยนก็ไม่กระทบตารางของประจำวัน
  const byUuid = <T extends { uuid: string }>(list: T[]) => [...list].sort((a, b) => a.uuid.localeCompare(b.uuid))
  const agentPool = byUuid(agents)
  const skinPool = byUuid(
    weapons.flatMap((w) =>
      w.skins
        .filter(isRealSkin)
        .map((s) => ({ uuid: s.uuid, skin: s, weapon: w, image: skinImage(s) }))
        .filter((s) => s.image),
    ),
  )
  const mapPool = byUuid(maps.filter((m) => m.splash && m.displayIcon))
  const cardPool = byUuid(cards.filter((c) => c.largeArt && !c.isHiddenIfNotOwned))

  return {
    start,
    builtAt: BUILT_AT,
    agents: days.map((d) => {
      const a = pickOfDay(agentPool, d, 1)
      return a
        ? { uuid: a.uuid, name: a.displayName, role: a.role?.displayName ?? '', color: agentColor(a), background: a.background, portrait: a.fullPortrait }
        : null
    }),
    skins: days.map((d) => {
      const s = pickOfDay(skinPool, d, 2)
      if (!s) return null
      const tier = s.skin.contentTierUuid ? tierOf.get(s.skin.contentTierUuid) : undefined
      return {
        uuid: s.uuid,
        weaponUuid: s.weapon.uuid,
        weaponName: s.weapon.displayName,
        name: s.skin.displayName,
        image: s.image!,
        tierIcon: tier?.displayIcon ?? null,
        tierColor: rgbaHex(tier?.highlightColor),
      }
    }),
    maps: days.map((d) => {
      const m = pickOfDay(mapPool, d, 3)
      return m ? { uuid: m.uuid, name: m.displayName, image: m.splash!, coords: m.coordinates } : null
    }),
    cards: days.map((d) => {
      const c = pickOfDay(cardPool, d, 4)
      return c ? { uuid: c.uuid, name: c.displayName, image: c.largeArt!, wide: c.wideArt ?? null } : null
    }),
  }
}

/** ของที่ใหม่ ณ ตอน build (ฝั่ง client จะกรองตามเวลาจริงอีกรอบ) */
export function newItems({
  agents,
  weapons,
  maps,
  bundles,
  cards,
  sprays,
  buddies,
}: {
  agents: Agent[]
  weapons: Weapon[]
  maps: GameMap[]
  bundles: Bundle[]
  cards: PlayerCard[]
  sprays: Spray[]
  buddies: Buddy[]
}): NewItem[] {
  const today = Math.floor(BUILT_AT / 86_400_000)
  const fresh = (day: number) => day > 0 && day <= today && today - day < NEW_ITEM_DAYS
  const items: NewItem[] = []

  for (const a of agents) {
    // เอเจนท์มีวันเปิดตัวใน API ใช้วันที่ไหนก็ได้ที่ใหม่กว่า
    const released = Date.parse(a.releaseDate)
    const day = Math.max(Number.isFinite(released) ? Math.floor(released / 86_400_000) : 0, firstSeen('agents', a.uuid))
    if (fresh(day)) items.push({ kind: 'agents', uuid: a.uuid, name: a.displayName, sub: a.role?.displayName, image: a.displayIcon, href: `/agents/${a.uuid}`, day })
  }
  for (const m of maps) {
    const day = firstSeen('maps', m.uuid)
    if (fresh(day)) items.push({ kind: 'maps', uuid: m.uuid, name: m.displayName, image: m.listViewIcon ?? m.splash, href: `/maps/${m.uuid}`, day })
  }
  for (const w of weapons) {
    for (const s of w.skins) {
      const day = firstSeen('skins', s.uuid)
      if (!fresh(day) || !isRealSkin(s)) continue
      items.push({ kind: 'skins', uuid: s.uuid, name: s.displayName, sub: w.displayName, image: skinImage(s), href: `/weapons/${w.uuid}?skin=${s.uuid}`, day })
    }
  }
  for (const b of bundles) {
    const day = firstSeen('bundles', b.uuid)
    if (fresh(day)) items.push({ kind: 'bundles', uuid: b.uuid, name: b.displayName, image: b.displayIcon, href: `/bundles?b=${b.uuid}`, day })
  }
  for (const c of cards) {
    const day = firstSeen('cards', c.uuid)
    if (fresh(day)) items.push({ kind: 'cards', uuid: c.uuid, name: c.displayName, image: c.largeArt ?? c.smallArt, href: '/collection/cards', day })
  }
  for (const s of sprays) {
    const day = firstSeen('sprays', s.uuid)
    if (fresh(day)) items.push({ kind: 'sprays', uuid: s.uuid, name: s.displayName, image: s.fullTransparentIcon ?? s.displayIcon, href: '/collection/sprays', day })
  }
  for (const b of buddies) {
    const day = firstSeen('buddies', b.uuid)
    if (fresh(day)) items.push({ kind: 'buddies', uuid: b.uuid, name: b.displayName, image: b.displayIcon, href: '/collection/buddies', day })
  }
  return items
}
