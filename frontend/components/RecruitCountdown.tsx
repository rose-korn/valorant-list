'use client'

// แถบนับถอยหลังอีเวนต์ปลดล็อกเอเจนท์ใหม่ (recruitmentData ของ API)
// เว็บเป็น static: ตอน render HTML ใช้เวลาตอน build แล้วค่อยเดินตามเวลาจริงหลัง hydrate
// อีเวนต์จบแล้วแถบจะหายเอง ไม่ต้อง build ใหม่

import { useSyncExternalStore } from 'react'
import Link from '@/components/Link'
import { useI18n } from '@/components/LangProvider'
import { dateLocale } from '@/lib/i18n'

export interface RecruitItem {
  uuid: string
  name: string
  icon: string
  color: string
  /** XP ที่ต้องเก็บให้ครบ */
  xp: number
  start: number
  end: number
}

const tick = (cb: () => void) => {
  const id = setInterval(cb, 1000)
  return () => clearInterval(id)
}
const second = () => Math.floor(Date.now() / 1000) * 1000

function useTicking(serverNow: number) {
  return useSyncExternalStore(tick, second, () => serverNow)
}

const DAY = 86_400_000

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]
}

export default function RecruitCountdown({ items, builtAt, link = true }: { items: RecruitItem[]; builtAt: number; link?: boolean }) {
  const { lang, t } = useI18n()
  const r = t.recruit
  const now = useTicking(builtAt)
  const live = items.filter((i) => now < i.end)
  if (!live.length) return null
  const fmt = (ms: number) => new Date(ms).toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section className="border-b-[1.5px] border-ink bg-night py-8 text-paper md:py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6">
        {live.map((a) => {
          const started = now >= a.start
          const parts = split((started ? a.end : a.start) - now)
          const daysLeft = Math.max(1, (a.end - Math.max(now, a.start)) / DAY)
          const done = started ? Math.min(1, (now - a.start) / (a.end - a.start)) : 0
          return (
            <div key={a.uuid} className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
              <img src={a.icon} alt="" className="h-20 w-20 border-[1.5px] border-paper object-cover md:h-24 md:w-24" style={{ background: a.color }} />
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{r.title(a.name)}</h2>
                <p className="mt-1 text-paper/80">{r.desc(a.xp.toLocaleString())}</p>
                <p className="mt-1 font-mono text-xs text-paper/60">
                  {r.range(fmt(a.start), fmt(a.end))} · {r.perDay(Math.ceil(a.xp / daysLeft).toLocaleString())}
                </p>
                <div className="mt-3 h-2 max-w-md border border-paper/60" aria-hidden>
                  <div className="h-full bg-red" style={{ width: `${done * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="font-mono text-xs tracking-widest text-paper/70 uppercase">{started ? r.endsIn : r.startsIn}</p>
                <div className="flex gap-2" role="timer">
                  {parts.map((n, i) => (
                    <span key={i} className="flex min-w-14 flex-col items-center border-[1.5px] border-paper bg-ink px-2 py-1.5">
                      <b className="font-display text-2xl tabular-nums">{String(n).padStart(2, '0')}</b>
                      <span className="text-xs leading-normal text-paper/70">{r.units[i]}</span>
                    </span>
                  ))}
                </div>
                {link && (
                  <Link href={`/agents/${a.uuid}`} className="btn btn-paper !py-1.5 text-sm">
                    {r.cta}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


/** แถบบรรทัดเดียวสำหรับหน้าแรก (อยู่ในกล่อง "มีอะไรใหม่") กดแล้วไปหน้าเอเจนท์ */
export function RecruitStrip({ items, builtAt, className = '' }: { items: RecruitItem[]; builtAt: number; className?: string }) {
  const { lang, t } = useI18n()
  const r = t.recruit
  const now = useTicking(builtAt)
  const live = items.filter((i) => now < i.end)
  if (!live.length) return null

  return (
    <ul className={`grid gap-2 ${className}`}>
      {live.map((a) => {
        const started = now >= a.start
        const [d, h, m, s] = split((started ? a.end : a.start) - now)
        const clock = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
        return (
          <li key={a.uuid}>
            <Link
              href={`/agents/${a.uuid}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] border-ink bg-night py-1.5 pr-4 pl-1.5 text-paper transition-transform hover:-translate-y-0.5"
            >
              <img src={a.icon} alt="" className="h-9 w-9 shrink-0 border border-paper/60 object-cover" style={{ background: a.color }} />
              <b className="font-display">{r.title(a.name)}</b>
              <span className="text-sm text-paper/75">{a.xp.toLocaleString()} XP</span>
              <span className="text-sm leading-normal sm:ml-auto">
                {started ? r.endsIn : r.startsIn}{' '}
                <b className="font-mono tabular-nums">
                  {d}
                  {lang === 'en' ? '' : ' '}
                  {r.units[0]} {clock}
                </b>{' '}
                →
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** การ์ดนับถอยหลังขนาดเท่าการ์ดในกล่อง "มีอะไรใหม่" วางต่อจากการ์ดเอเจนท์ตัวนั้น */
export function RecruitTile({ item: a, builtAt }: { item: RecruitItem; builtAt: number }) {
  const { t } = useI18n()
  const r = t.recruit
  const now = useTicking(builtAt)
  if (now >= a.end) return null
  const started = now >= a.start
  const parts = split((started ? a.end : a.start) - now)
  const done = started ? Math.min(1, (now - a.start) / (a.end - a.start)) : 0

  return (
    <Link href={`/agents/${a.uuid}`} className="card card-hover flex w-48 shrink-0 snap-start flex-col !bg-night p-3 text-paper sm:w-64 md:w-72">
      <p className="font-display text-lg leading-snug font-bold">{r.title(a.name)}</p>
      <p className="text-sm text-paper/75">{a.xp.toLocaleString()} XP</p>
      <p className="mt-auto pt-3 text-xs text-paper/70">{started ? r.endsIn : r.startsIn}</p>
      <div className="mt-1 grid grid-cols-4 gap-1 sm:gap-1.5" role="timer">
        {parts.map((n, i) => (
          <span key={i} className="flex flex-col items-center border-[1.5px] border-paper bg-ink py-1">
            <b className="font-display text-xl tabular-nums">{String(n).padStart(2, '0')}</b>
            <span className="text-[11px] leading-normal text-paper/70">{r.units[i]}</span>
          </span>
        ))}
      </div>
      <div className="mt-3 h-1.5 border border-paper/60" aria-hidden>
        <div className="h-full bg-red" style={{ width: `${done * 100}%` }} />
      </div>
    </Link>
  )
}
