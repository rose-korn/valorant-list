'use client'

// กล่อง "มีอะไรใหม่" บนหน้าแรก: ของที่เพิ่งโผล่ใน valorant-api ไม่เกิน NEW_ITEM_DAYS วัน
// วันที่มาจาก first-seen.json (จดตอน build) ส่วนเอเจนท์ใช้ releaseDate ของ API
// ฝั่ง client กรองด้วยเวลาจริงอีกรอบ ของจะหลุดจากกล่องเองเมื่อครบกำหนด ไม่ต้อง build ใหม่

import { useMemo } from 'react'
import Link from '@/components/Link'
import HScroller from '@/components/HScroller'
import { useI18n } from '@/components/LangProvider'
import { NewBadge } from '@/components/ui'
import { useNow } from '@/components/useNow'
import { dateLocale } from '@/lib/i18n'
import { isNewDay } from '@/lib/valorant'

export type NewKind = 'agents' | 'maps' | 'skins' | 'bundles' | 'cards' | 'sprays' | 'buddies'

export interface NewItem {
  kind: NewKind
  uuid: string
  name: string
  /** ชื่อรอง เช่น ชื่อปืนของสกิน */
  sub?: string
  image: string | null
  href: string
  /** เลขวันที่เห็นครั้งแรก */
  day: number
}

const ORDER: NewKind[] = ['agents', 'maps', 'bundles', 'skins', 'cards', 'sprays', 'buddies']
const KIND_HREF: Record<NewKind, string> = {
  agents: '/agents',
  maps: '/maps',
  skins: '/weapons',
  bundles: '/bundles',
  cards: '/collection/cards',
  sprays: '/collection/sprays',
  buddies: '/collection/buddies',
}
const SHOW = 18

export default function WhatsNew({ items, builtAt, patch }: { items: NewItem[]; builtAt: number; patch: string | null }) {
  const { lang, t } = useI18n()
  const h = t.home
  const now = useNow(builtAt)

  const fresh = useMemo(
    () => items.filter((i) => isNewDay(i.day, now)).sort((a, b) => b.day - a.day || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)),
    [items, now],
  )
  if (!fresh.length) return null

  const count = (k: NewKind) => fresh.filter((i) => i.kind === k).length
  const label: Record<NewKind, (n: number) => string> = {
    agents: h.newAgents,
    maps: h.newMaps,
    skins: h.newSkins,
    bundles: h.newBundles,
    cards: h.newCards,
    sprays: h.newSprays,
    buddies: h.newBuddies,
  }
  const updated = new Date(builtAt).toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section className="border-b-[1.5px] border-ink bg-pink/60 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex flex-wrap items-center gap-3 font-display text-3xl font-bold sm:text-4xl">
              {h.newTitle}
              <NewBadge label="NEW" className="text-base" />
            </h2>
            <p className="mt-1 font-mono text-sm text-blue">— {h.newNote}</p>
          </div>
          <p className="text-sm text-ink-soft">
            {patch && <span className="chip mr-2 !py-0.5 text-xs">patch {patch}</span>}
            {h.updatedAt(updated)}
          </p>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {ORDER.filter((k) => count(k) > 0).map((k) => (
            <li key={k}>
              <Link href={KIND_HREF[k]} className="chip !bg-card hover:!bg-pink">
                {label[k](count(k))} →
              </Link>
            </li>
          ))}
        </ul>

        <HScroller className="soft-scroll -mx-4 mt-6 flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pt-2 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {fresh.slice(0, SHOW).map((item) => (
            <Link
              key={`${item.kind}:${item.uuid}`}
              href={item.href}
              className="card card-hover w-36 shrink-0 snap-start p-2 md:w-40"
            >
              <div
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-md ${
                  item.kind === 'skins' || item.kind === 'buddies' || item.kind === 'sprays' ? 'skeleton-dark p-2' : 'skeleton'
                }`}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className={item.kind === 'skins' || item.kind === 'buddies' || item.kind === 'sprays' ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover object-top'}
                  />
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 px-0.5 text-sm leading-snug font-semibold">{item.name}</p>
              {item.sub && <p className="truncate px-0.5 text-xs text-ink-soft">{item.sub}</p>}
            </Link>
          ))}
          {fresh.length > SHOW && (
            <span className="flex w-28 shrink-0 items-center justify-center text-center font-mono text-sm text-blue">+ {h.newMore(fresh.length - SHOW)}</span>
          )}
        </HScroller>
      </div>
    </section>
  )
}
