import type { Lang } from '@/lib/i18n'
import { getBuddies, getPlayerCards, getPlayerTitles, getSprays } from '@/lib/api'

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

// ชื่อ/คำอธิบายแต่ละหมวดอยู่ใน dict.collection.kinds
export const KINDS: CollectionKind[] = ['cards', 'sprays', 'buddies', 'titles']
export const isKind = (v: string): v is CollectionKind => (KINDS as string[]).includes(v)

export async function getCollection(lang: Lang, kind: CollectionKind): Promise<CollectionItem[]> {
  switch (kind) {
    case 'cards':
      return (await getPlayerCards(lang)).map((c) => ({
        uuid: c.uuid,
        name: c.displayName,
        thumb: c.largeArt ?? c.smallArt,
        full: c.largeArt ?? c.wideArt,
        extra: c.wideArt,
      }))
    case 'sprays':
      return (await getSprays(lang)).map((s) => ({
        uuid: s.uuid,
        name: s.displayName,
        thumb: s.fullTransparentIcon ?? s.displayIcon,
        full: s.fullTransparentIcon ?? s.fullIcon ?? s.displayIcon,
        extra: s.animationGif,
      }))
    case 'buddies':
      return (await getBuddies(lang)).map((b) => ({ uuid: b.uuid, name: b.displayName, thumb: b.displayIcon, full: b.displayIcon, extra: null }))
    case 'titles':
      return (await getPlayerTitles(lang))
        .filter((t) => t.titleText)
        .map((t) => ({ uuid: t.uuid, name: t.titleText!, thumb: null, full: null, extra: null }))
  }
}
