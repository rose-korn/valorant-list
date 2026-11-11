'use client'

// ของประจำวันบนหน้าแรก (เอเจนท์ สกิน แผนที่ การ์ด)
// เว็บเป็น static: ตอน build คำนวณของประจำวันล่วงหน้าไว้หลายวัน (DAILY_DAYS) แล้วฝั่ง client เลือกอันของวันนี้ตามเวลาไทย
// เลยเปลี่ยนทุกเที่ยงคืนจริง ไม่ต้องรอ build ใหม่

import Link from '@/components/Link'
import { Arrow } from '@/components/brand'
import { useI18n } from '@/components/LangProvider'
import { useNow } from '@/components/useNow'
import { thaiDay } from '@/lib/valorant'

export interface DailyAgent {
  uuid: string
  name: string
  role: string
  color: string
  background: string | null
  portrait: string | null
}

export interface DailySkin {
  uuid: string
  weaponUuid: string
  weaponName: string
  name: string
  image: string
  tierIcon: string | null
  tierColor: string
}

export interface DailyMap {
  uuid: string
  name: string
  image: string
  coords: string | null
}

export interface DailyCard {
  uuid: string
  name: string
  /** การ์ดแนวตั้ง */
  image: string
  /** การ์ดแนวนอน (ใช้ตอนจอแคบ) */
  wide: string | null
}

export interface DailyPlan {
  /** เลขวัน (เวลาไทย) ของช่องแรกใน array */
  start: number
  builtAt: number
  agents: (DailyAgent | null)[]
  skins: (DailySkin | null)[]
  maps: (DailyMap | null)[]
  cards: (DailyCard | null)[]
}

/** index ของวันนี้ใน plan — ถ้าเว็บไม่ได้ build นานเกินช่วงที่คำนวณไว้ ก็วนใช้ของเดิมไปก่อน */
function useSlot(plan: Pick<DailyPlan, 'start' | 'builtAt'>, length: number) {
  const now = useNow(plan.builtAt)
  if (!length) return 0
  const offset = thaiDay(now) - plan.start
  return ((offset % length) + length) % length
}

export function DailyAgentCard({ plan }: { plan: DailyPlan }) {
  const { t } = useI18n()
  const a = plan.agents[useSlot(plan, plan.agents.length)]
  if (!a) return null
  return (
    <Link href={`/agents/${a.uuid}`} className="group relative mx-auto block w-full max-w-xs animate-fade-up [animation-delay:200ms] sm:max-w-sm">
      <div className="card tape relative rotate-2 p-3 transition-transform group-hover:rotate-0">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg" style={{ background: a.color }}>
          {a.background && <img src={a.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply" />}
          {a.portrait && (
            <img
              key={a.uuid}
              src={a.portrait}
              alt={a.name}
              className="absolute inset-0 h-full w-full scale-125 animate-fade-in object-cover object-top transition-transform duration-500 group-hover:scale-[1.3]"
            />
          )}
        </div>
        <div className="flex items-baseline justify-between px-1 pt-3">
          <p className="font-display text-2xl font-bold">{a.name}</p>
          <p className="text-sm text-ink-soft">{a.role}</p>
        </div>
      </div>
      <p className="hand absolute -top-11 left-0 flex -rotate-6 items-end gap-1 text-xl sm:-left-10">
        {t.home.agentOfDay}
        <Arrow className="h-8 w-10 rotate-[25deg]" />
      </p>
    </Link>
  )
}

/** การ์ด "ทำการ์ดเมนหลัก" ในมุมเล่นสนุก — ใช้เอเจนท์ประจำวันตัวเดียวกับ hero */
export function DailyShareCard({ plan }: { plan: DailyPlan }) {
  const { t } = useI18n()
  const h = t.home
  const a = plan.agents[useSlot(plan, plan.agents.length)]
  return (
    <Link href={a ? `/share?a=${a.uuid}` : '/share'} className="card card-hover relative flex min-h-56 flex-col overflow-hidden !bg-sky p-6">
      <span className="kicker relative z-10">Make your own · DIY</span>
      <h3 className="relative z-10 mt-2 max-w-[55%] text-3xl font-bold">{h.shareTitle}</h3>
      <p className="relative z-10 mt-2 max-w-[55%] text-ink/75">{h.shareDesc}</p>
      <span className="btn relative z-10 mt-auto self-start">{h.shareCta}</span>
      {/* รูปเต็มตัวเป็นสี่เหลี่ยมจัตุรัส ตัวละครอยู่กลางภาพ: กำหนดขนาดตามความกว้างการ์ด
          แล้ววางให้ตัวละครอยู่ฝั่งขวา ไม่ไปบังหัวเรื่อง/คำอธิบาย (เดิมสูง 115% ของการ์ด ตัวละครเลยล้นมาทับข้อความ) */}
      {a?.portrait && (
        <img
          key={a.uuid}
          src={a.portrait}
          alt=""
          className="pointer-events-none absolute -bottom-6 left-[38%] aspect-square w-[80%] max-w-none rotate-6 object-contain sticker"
        />
      )}
    </Link>
  )
}

/** แถวสกิน / แผนที่ / การ์ด ประจำวัน */
export function DailyPicks({ plan }: { plan: DailyPlan }) {
  const { t } = useI18n()
  const h = t.home
  const len = Math.max(plan.skins.length, plan.maps.length, plan.cards.length)
  const slot = useSlot(plan, len)
  const skin = plan.skins[slot % plan.skins.length]
  const map = plan.maps[slot % plan.maps.length]
  const card = plan.cards[slot % plan.cards.length]
  if (!skin && !map && !card) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.7fr]">
      {skin && (
        <Link
          key={skin.uuid}
          href={`/weapons/${skin.weaponUuid}?skin=${skin.uuid}`}
          className="card card-hover relative block animate-fade-in p-3 sm:col-span-2 lg:col-span-1"
        >
          <p className="kicker">{h.skinOfDay}</p>
          <div
            className="mt-2 flex aspect-[16/9] items-center justify-center rounded-lg p-4"
            style={{ background: `radial-gradient(ellipse at 50% 45%, ${skin.tierColor}55, #1f2a5c 75%)` }}
          >
            <img src={skin.image} alt={skin.name} loading="lazy" className="max-h-full max-w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,.45)]" />
          </div>
          <div className="mt-2.5 flex items-center gap-2 px-1">
            {skin.tierIcon && <img src={skin.tierIcon} alt="" className="h-6 w-6 shrink-0" />}
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight font-bold">{skin.name}</p>
              <p className="text-sm text-ink-soft">{skin.weaponName}</p>
            </div>
          </div>
        </Link>
      )}
      {map && (
        <Link key={map.uuid} href={`/maps/${map.uuid}`} className="card card-hover relative block animate-fade-in p-3">
          <p className="kicker">{h.mapOfDay}</p>
          <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded-lg skeleton-dark">
            <img src={map.image} alt={map.name} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="mt-2.5 px-1">
            <p className="font-display text-lg leading-tight font-bold">{map.name}</p>
            {map.coords && <p className="truncate text-sm text-ink-soft">{map.coords}</p>}
          </div>
        </Link>
      )}
      {card && (
        <Link key={card.uuid} href="/collection/cards" className="card card-hover relative block animate-fade-in p-3">
          <p className="kicker">{h.cardOfDay}</p>
          <div className="mt-2 aspect-[16/10] overflow-hidden rounded-lg border-2 border-ink skeleton lg:aspect-[3/4]">
            {card.wide && <img src={card.wide} alt={card.name} loading="lazy" className="h-full w-full object-cover lg:hidden" />}
            <img src={card.image} alt={card.name} loading="lazy" className={`h-full w-full object-cover object-[50%_20%] ${card.wide ? 'max-lg:hidden' : ''}`} />
          </div>
          <p className="mt-2.5 line-clamp-2 px-1 font-display leading-tight font-bold">{card.name}</p>
        </Link>
      )}
    </div>
  )
}
