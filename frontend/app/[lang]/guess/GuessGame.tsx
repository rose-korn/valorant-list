'use client'

// เกมทายรายวัน 3 โหมด (เอเจนต์ / สกิน / callout) — โจทย์คำนวณไว้ล่วงหน้าตอน build (data.ts)
// ผลที่ทายกับสตรีคเก็บใน localStorage ('valolist:guess') เฉพาะเครื่องนี้

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from '@/components/Link'
import { useI18n } from '@/components/LangProvider'
import { useNow } from '@/components/useNow'
import { thaiDay } from '@/lib/valorant'
import type { GuessPlan } from './data'

type Mode = 'agent' | 'skin' | 'callout'
const MODES: Mode[] = ['agent', 'skin', 'callout']
type DayRecord = Partial<Record<Mode, string[]>>
interface Saved {
  days: Record<string, DayRecord>
  /** วันที่ทายถูกอย่างน้อย 1 ข้อ (ใช้นับสตรีค) */
  won: number[]
  best: number
}

// ---------- เก็บผลในเครื่อง ----------
const KEY = 'valolist:guess'
/** เก็บประวัติย้อนหลังไม่เกินกี่วัน (พอสำหรับนับสตรีคยาว ๆ แต่ไม่บวมเรื่อย ๆ) */
const KEEP_DAYS = 400
const listeners = new Set<() => void>()
let cacheRaw: string | null = null

function readRaw() {
  if (cacheRaw === null) {
    try {
      cacheRaw = localStorage.getItem(KEY) ?? ''
    } catch {
      cacheRaw = ''
    }
  }
  return cacheRaw
}
function parse(raw: string): Saved {
  try {
    const v = JSON.parse(raw)
    if (v && typeof v.days === 'object') return { days: v.days, won: Array.isArray(v.won) ? v.won : [], best: Number(v.best) || 0 }
  } catch {
    // ไฟล์เสีย / ยังไม่เคยเล่น
  }
  return { days: {}, won: [], best: 0 }
}
function write(next: Saved) {
  cacheRaw = JSON.stringify(next)
  try {
    localStorage.setItem(KEY, cacheRaw)
  } catch {
    // private mode — เล่นได้แต่จำไม่ได้
  }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const noop = () => () => {}

// ---------- กติกา ----------
const MAX: Record<Mode, (plan: GuessPlan, slot: number) => number> = {
  // เปิดไอคอนทีละอัน + ตาสุดท้ายบอกตำแหน่ง
  agent: (plan, slot) => (plan.agentDays[slot]?.icons.length ?? 4) + 1,
  skin: () => 5,
  callout: () => 3,
}
const ZOOM = [6, 4, 2.6, 1.7, 1.25]

function answerOf(plan: GuessPlan, slot: number, mode: Mode) {
  if (mode === 'agent') return plan.agentDays[slot]?.uuid ?? null
  if (mode === 'skin') return plan.skinDays[slot]?.name ?? null
  return plan.calloutDays[slot]?.answer ?? null
}

function statusOf(guesses: string[] | undefined, answer: string | null, max: number) {
  if (!guesses?.length || !answer) return 'open' as const
  if (guesses.includes(answer)) return 'win' as const
  return guesses.length >= max ? ('lose' as const) : ('open' as const)
}

/** สตรีค = จำนวนวันติดกันที่ทายถูกอย่างน้อย 1 ข้อ (วันนี้ยังไม่ถูกก็นับต่อจากเมื่อวาน) */
function streakOf(won: number[], today: number) {
  const set = new Set(won)
  let day = set.has(today) ? today : today - 1
  let n = 0
  while (set.has(day)) {
    n++
    day--
  }
  return n
}

export default function GuessGame({ plan }: { plan: GuessPlan }) {
  const { lang, t } = useI18n()
  const g = t.guess
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const raw = useSyncExternalStore(subscribe, readRaw, () => '')
  const saved = useMemo(() => parse(raw), [raw])
  const now = useNow(plan.builtAt)
  const today = thaiDay(now)
  const len = plan.agentDays.length
  const slot = len ? (((today - plan.start) % len) + len) % len : 0
  const [mode, setMode] = useState<Mode>('agent')

  const rec: DayRecord = saved.days[today] ?? {}
  const max = (m: Mode) => MAX[m](plan, slot)
  const status = (m: Mode) => statusOf(rec[m], answerOf(plan, slot, m), max(m))

  const guess = (m: Mode, value: string) => {
    if (status(m) !== 'open' || rec[m]?.includes(value)) return
    const nextRec = { ...rec, [m]: [...(rec[m] ?? []), value] }
    const days: Record<string, DayRecord> = { ...saved.days, [today]: nextRec }
    for (const k of Object.keys(days)) if (Number(k) < today - KEEP_DAYS) delete days[k]
    const won = value === answerOf(plan, slot, m) && !saved.won.includes(today) ? [...saved.won, today] : saved.won
    const keepWon = won.filter((d) => d >= today - KEEP_DAYS)
    write({ days, won: keepWon, best: Math.max(saved.best, streakOf(keepWon, today)) })
  }

  const streak = streakOf(saved.won, today)
  const solved = MODES.filter((m) => status(m) === 'win').length
  const allDone = MODES.every((m) => status(m) !== 'open')
  const puzzleNo = today - plan.epoch + 1

  if (!mounted) return <p className="hand py-16 text-center text-2xl">{g.loading}</p>

  const shareText = () => {
    const rows = MODES.map((m) => {
      const list = rec[m] ?? []
      const ans = answerOf(plan, slot, m)
      const marks = list.map((x) => (x === ans ? '🟩' : '🟥')).join('')
      return `${g.modes[m]} ${marks || '—'}`
    })
    return [g.shareHead(puzzleNo), ...rows, g.shareStreak(streak)].join('\n')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* แถบสถานะ: ข้อที่ / สตรีค */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm font-bold tracking-widest text-blue uppercase">{g.no(puzzleNo)}</p>
        <dl className="flex gap-5 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-ink-soft">{g.streak}</dt>
            <dd className="font-poster text-2xl">{g.days(streak)}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-ink-soft">{g.best}</dt>
            <dd className="font-poster text-2xl">{g.days(Math.max(saved.best, streak))}</dd>
          </div>
        </dl>
      </div>

      {/* แท็บโหมด */}
      <nav className="flex flex-wrap gap-2" aria-label={g.title}>
        {MODES.map((m, i) => {
          const s = status(m)
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-current={mode === m ? 'true' : undefined}
              className={`ticket flex items-center gap-2 px-5 py-1.5 font-display font-bold transition-transform ${mode === m ? '!bg-red text-white' : 'hover:-translate-y-0.5'}`}
            >
              <span className="font-mono text-xs tracking-widest opacity-75">0{i + 1}</span>
              {g.modes[m]}
              {s !== 'open' && <span aria-label={s}>{s === 'win' ? '✓' : '✕'}</span>}
            </button>
          )
        })}
      </nav>

      <div className="card p-4 sm:p-6">
        {mode === 'agent' && <AgentRound plan={plan} slot={slot} guesses={rec.agent ?? []} status={status('agent')} max={max('agent')} onGuess={(v) => guess('agent', v)} />}
        {mode === 'skin' && <SkinRound plan={plan} slot={slot} guesses={rec.skin ?? []} status={status('skin')} max={max('skin')} onGuess={(v) => guess('skin', v)} />}
        {mode === 'callout' && (
          <CalloutRound plan={plan} slot={slot} guesses={rec.callout ?? []} status={status('callout')} max={max('callout')} onGuess={(v) => guess('callout', v)} />
        )}
        {status(mode) !== 'open' && !allDone && (
          <div className="mt-5 flex justify-end">
            <button onClick={() => setMode(MODES.find((m) => status(m) === 'open') ?? mode)} className="btn">
              {g.modes[MODES.find((m) => status(m) === 'open') ?? mode]} →
            </button>
          </div>
        )}
      </div>

      {/* สรุปผลของวันนี้ */}
      {MODES.some((m) => status(m) !== 'open') && (
        <div className="card flex flex-wrap items-center justify-between gap-4 !bg-mustard p-4 sm:p-5">
          <div>
            <p className="font-display text-xl font-bold">{g.solved(solved)}</p>
            {allDone && <NextIn label={g.next} />}
          </div>
          <ShareResult text={shareText()} lang={lang} />
        </div>
      )}
    </div>
  )
}

// ---------- ส่วนประกอบ ----------

function Tries({ used, max }: { used: number; max: number }) {
  const { t } = useI18n()
  return (
    <p className="flex items-center gap-2 text-sm text-ink-soft">
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full border-[1.5px] border-ink ${i < used ? 'bg-red' : ''}`} />
        ))}
      </span>
      {t.guess.tries(used, max)}
    </p>
  )
}

function Result({ status, name, href, children }: { status: 'win' | 'lose'; name: string; href: string; children?: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <div className={`mt-5 flex flex-wrap items-center gap-4 rounded-xl border-2 border-ink p-3 ${status === 'win' ? 'bg-sky' : 'bg-pink'}`} aria-live="polite">
      {children}
      <div className="min-w-0">
        <p className="hand text-lg">{status === 'win' ? t.guess.win : t.guess.lose}</p>
        <p className="py-0.5 font-display text-2xl leading-normal font-bold">{name}</p>
        <Link href={href} className="text-sm font-semibold underline decoration-2 underline-offset-4">
          {t.guess.view}
        </Link>
      </div>
    </div>
  )
}

interface RoundProps {
  plan: GuessPlan
  slot: number
  guesses: string[]
  status: 'open' | 'win' | 'lose'
  max: number
  onGuess: (value: string) => void
}

function AgentRound({ plan, slot, guesses, status, max, onGuess }: RoundProps) {
  const { t } = useI18n()
  const g = t.guess
  const p = plan.agentDays[slot]
  if (!p) return null
  const done = status !== 'open'
  const answer = plan.agents.find((a) => a.uuid === p.uuid)
  const shown = done ? p.icons.length : Math.min(p.icons.length, guesses.length + 1)
  const showRole = done || guesses.length >= p.icons.length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold">{g.prompts.agent}</h2>
          <p className="text-sm text-ink-soft">{g.hints.agent}</p>
        </div>
        <Tries used={guesses.length} max={max} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-night p-5">
        {p.icons.map((src, i) => (
          <div key={i} className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-paper/30 sm:h-20 sm:w-20">
            {i < shown ? <img src={src} alt="" className="h-11 w-11 animate-fade-in sm:h-14 sm:w-14" /> : <span className="font-display text-3xl text-paper/30">?</span>}
          </div>
        ))}
        {showRole && answer?.role && <p className="w-full text-center font-mono text-sm text-mustard">{g.role(answer.role)}</p>}
      </div>

      {done && answer ? (
        <Result status={status} name={answer.name} href={`/agents/${answer.uuid}`}>
          <img src={answer.icon} alt="" className="h-20 w-20 rounded-lg border-2 border-ink object-cover" style={{ background: answer.color }} />
        </Result>
      ) : (
        <ul className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {plan.agents.map((a) => {
            const tried = guesses.includes(a.uuid)
            return (
              <li key={a.uuid}>
                <button
                  onClick={() => onGuess(a.uuid)}
                  disabled={tried}
                  title={a.name}
                  aria-label={a.name}
                  className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 border-ink transition ${tried ? 'cursor-not-allowed opacity-35 grayscale' : 'hover:-translate-y-0.5 hover:-rotate-3'}`}
                  style={{ background: a.color }}
                >
                  <img src={a.icon} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {tried && <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-ink">✕</span>}
                </button>
                <p className="mt-0.5 truncate text-center text-[11px] leading-normal text-ink-soft">{a.name}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SkinRound({ plan, slot, guesses, status, max, onGuess }: RoundProps) {
  const { t } = useI18n()
  const g = t.guess
  const p = plan.skinDays[slot]
  const [q, setQ] = useState('')
  const matches = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return []
    return plan.skinNames.filter((n) => words.every((w) => n.toLowerCase().includes(w))).slice(0, 8)
  }, [q, plan.skinNames])
  if (!p) return null
  const done = status !== 'open'
  const zoom = done ? 1 : ZOOM[Math.min(guesses.length, ZOOM.length - 1)]
  const submit = (name: string) => {
    onGuess(name)
    setQ('')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold">{g.prompts.skin}</h2>
          <p className="text-sm text-ink-soft">{g.hints.skin}</p>
        </div>
        <Tries used={guesses.length} max={max} />
      </div>

      <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-night">
        <img
          src={p.image}
          alt=""
          className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: `${p.fx * 100}% ${p.fy * 100}%` }}
        />
      </div>

      {done ? (
        <Result status={status} name={p.name} href={`/weapons/${p.weaponUuid}?skin=${p.uuid}`} />
      ) : (
        <div className="mt-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && matches[0] && submit(matches[0])}
            placeholder={g.searchSkin}
            aria-label={g.searchSkin}
            className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-lg outline-none focus:shadow-[3px_3px_0_var(--color-blue)]"
          />
          {q && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {matches.length === 0 && <li className="text-sm text-ink-soft">{g.noMatch}</li>}
              {matches.map((n) => (
                <li key={n}>
                  <button onClick={() => submit(n)} disabled={guesses.includes(n)} className="chip hover:!bg-mustard/50 disabled:opacity-40">
                    {n}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {guesses.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {guesses.map((n) => (
            <li key={n} className={`chip ${n === p.name ? '!bg-sky' : '!bg-pink line-through'}`}>
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CalloutRound({ plan, slot, guesses, status, max, onGuess }: RoundProps) {
  const { t } = useI18n()
  const g = t.guess
  const p = plan.calloutDays[slot]
  if (!p) return null
  const done = status !== 'open'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold">
            {g.prompts.callout} <span className="text-ink-soft">· {p.mapName}</span>
          </h2>
          <p className="text-sm text-ink-soft">{g.hints.callout}</p>
        </div>
        <Tries used={guesses.length} max={max} />
      </div>

      <div className="mt-4 grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl bg-night">
          <img src={p.minimap} alt={p.mapName} className="absolute inset-0 h-full w-full object-contain opacity-90" />
          <span className="absolute" style={{ left: `${p.u * 100}%`, top: `${p.v * 100}%` }} aria-hidden>
            <span className="absolute -top-3 -left-3 h-6 w-6 animate-ping rounded-full bg-red/60" />
            <span className="absolute -top-2 -left-2 h-4 w-4 rounded-full border-2 border-paper bg-red" />
          </span>
        </div>

        <div>
          {!done && guesses.length > 0 && <p className="mb-3 font-mono text-sm text-blue">{g.zone(p.zone)}</p>}
          {done ? (
            <Result status={status} name={p.answer} href={`/maps/${p.mapUuid}`} />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {p.options.map((o) => {
                const tried = guesses.includes(o)
                return (
                  <li key={o}>
                    <button onClick={() => onGuess(o)} disabled={tried} className={`chip ${tried ? '!bg-pink line-through opacity-60' : 'hover:!bg-mustard/50'}`}>
                      {o}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/** นับถอยหลังถึงเที่ยงคืนเวลาไทย */
function NextIn({ label }: { label: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const next = (thaiDay(now) + 1) * 86_400_000 - 7 * 3_600_000
  const left = Math.max(0, Math.floor((next - now) / 1000))
  const hh = String(Math.floor(left / 3600)).padStart(2, '0')
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <p className="text-sm">
      {label} <span className="font-mono font-bold">{`${hh}:${mm}:${ss}`}</span>
    </p>
  )
}

function ShareResult({ text, lang }: { text: string; lang: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = `${window.location.origin}/${lang}/guess`
    try {
      if (navigator.share) await navigator.share({ text, url })
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // ยกเลิกการแชร์ / clipboard ใช้ไม่ได้
    }
  }
  return (
    <button onClick={share} className="btn">
      {copied ? t.guess.copied : t.guess.share}
    </button>
  )
}
