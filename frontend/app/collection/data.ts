import { getBuddies, getPlayerCards, getPlayerTitles, getSprays } from '@/lib/valorant'

export type CollectionKind = 'cards' | 'sprays' | 'buddies' | 'titles'

export interface CollectionItem {
  uuid: string
  name: string
  /** รูปย่อใน grid */
  thumb: string | null
  /** รูปใหญ่สำหรับ 3D / modal */
  full: string | null
  /** รูปเพิ่มเติม (wide art, gif) */
  extra: string | null
}

export const COLLECTIONS: Record<CollectionKind, { title: string; th: string; description: string }> = {
  cards: { title: 'Player Cards', th: 'การ์ดผู้เล่น', description: 'การ์ดโปรไฟล์ที่แสดงตอนโหลดเกมและบนสกอร์บอร์ด' },
  sprays: { title: 'Sprays', th: 'สเปรย์', description: 'สเปรย์สำหรับพ่นบนผนังระหว่างแมตช์ — บางลายเป็นแอนิเมชัน' },
  buddies: { title: 'Gun Buddies', th: 'พวงกุญแจปืน', description: 'ของห้อยปืนสุดน่ารักที่ห้อยติดกับอาวุธของคุณ' },
  titles: { title: 'Player Titles', th: 'ฉายาผู้เล่น', description: 'ฉายาที่แสดงใต้ชื่อผู้เล่น' },
}

export async function getCollection(kind: CollectionKind): Promise<CollectionItem[]> {
  switch (kind) {
    case 'cards':
      return (await getPlayerCards()).map((c) => ({
        uuid: c.uuid,
        name: c.displayName,
        thumb: c.largeArt ?? c.smallArt,
        full: c.largeArt ?? c.wideArt,
        extra: c.wideArt,
      }))
    case 'sprays':
      return (await getSprays()).map((s) => ({
        uuid: s.uuid,
        name: s.displayName,
        thumb: s.fullTransparentIcon ?? s.displayIcon,
        full: s.fullTransparentIcon ?? s.fullIcon ?? s.displayIcon,
        extra: s.animationGif,
      }))
    case 'buddies':
      return (await getBuddies()).map((b) => ({ uuid: b.uuid, name: b.displayName, thumb: b.displayIcon, full: b.displayIcon, extra: null }))
    case 'titles':
      return (await getPlayerTitles())
        .filter((t) => t.titleText)
        .map((t) => ({ uuid: t.uuid, name: t.titleText!, thumb: null, full: null, extra: null }))
  }
}
