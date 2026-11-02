'use client'

// สุ่มเอเจนท์: เลือกตำแหน่ง กดเอาตัวที่ไม่อยากได้ออก (จำไว้ใน localStorage) แล้วกดสุ่ม (แถบการ์ดเลื่อนแล้วหยุดที่เข็ม)
// หรือสุ่มทั้งทีม 5 ตัว (เลือกให้มีครบทุกตำแหน่งได้)

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from '@/components/Link'
import { FilterButton } from '@/components/Filters'
import { useI18n } from '@/components/LangProvider'
import { DUELIST_ROLE_UUID } from '@/lib/valorant'

interface Agent {
  uuid: string
  name: string
  icon: string
  portrait: string | null
  color: string
  roleUuid: string
}

interface Role {
  uuid: string
  name: string
  icon: string
}

const SPIN_MS = 4200
const TEAM = 5

// ---------- ตัวที่เอาออกจากการสุ่ม (จำไว้ในเครื่อง) ----------
const KEY = 'valolist:random-excluded'
const listeners = new Set<() => void>()
let cache: string | null = null

function readExcluded() {
  if (cache === null) {
    try {
      cache = localStorage.getItem(KEY) ?? ''
    } catch {
      cache = ''
    }
  }
  return cache
}

function writeExcluded(ids: Iterable<string>) {
  cache = [...ids].join(',')
  try {
    localStorage.setItem(KEY, cache)
  } catch {
    // private mode — จำไม่ได้ก็ไม่เป็นไร
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const randInt = (n: number) => Math.floor(Math.random() * n)

function shuffle<T>(list: T[]) {
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function RandomAgent({ agents, roles }: { agents: Agent[]; roles: Role[] }) {
  const { t } = useI18n()
  const r = t.random
  const [mode, setMode] = useState<'single' | 'team'>('single')
  const [roleOn, setRoleOn] = useState<string[]>(() => roles.map((x) => x.uuid))

  const excludedRaw = useSyncExternalStore(subscribe, readExcluded, () => '')
  const excluded = useMemo(() => new Set(excludedRaw.split(',').filter(Boolean)), [excludedRaw])

  const inRoles = useMemo(() => agents.filter((a) => roleOn.includes(a.roleUuid)), [agents, roleOn])
  const pool = useMemo(() => inRoles.filter((a) => !excluded.has(a.uuid)), [inRoles, excluded])

  const toggleRole = (uuid: string) => setRoleOn((on) => (on.includes(uuid) ? on.filter((x) => x !== uuid) : [...on, uuid]))
  const toggleAgent = (uuid: string) => {
    const next = new Set(excluded)
    if (next.has(uuid)) next.delete(uuid)
    else next.add(uuid)
    writeExcluded(next)
  }

  return (
    <div className="space-y-8">
      {/* โหมด */}
      <div role="group" className="mx-auto flex w-fit overflow-hidden rounded-xl border-2 border-ink bg-card">
        {(['single', 'team'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-4 py-2 font-display font-semibold transition-colors sm:px-6 ${mode === m ? 'bg-ink text-paper' : 'hover:bg-mustard/40'}`}
          >
            {m === 'single' ? `🎲 ${r.single}` : `👥 ${r.team}`}
          </button>
        ))}
      </div>

      {mode === 'single' ? <Reel pool={pool} /> : <TeamRoll pool={pool} roles={roles} roleOn={roleOn} />}

      {/* ตั้งค่าการสุ่ม */}
      <div className="card p-4 sm:p-6">
        <p className="mb-3 font-display text-lg font-bold">{r.roles}</p>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <FilterButton key={role.uuid} active={roleOn.includes(role.uuid)} onClick={() => toggleRole(role.uuid)}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${roleOn.includes(role.uuid) ? '' : 'bg-ink'}`}>
                <img src={role.icon} alt="" className="h-3 w-3" />
              </span>
              {role.name}
            </FilterButton>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-soft">{r.pool(pool.length, inRoles.length)}</p>
          {excluded.size > 0 && (
            <button onClick={() => writeExcluded([])} className="btn btn-paper !px-3 !py-1 text-sm">
              {r.selectAll}
            </button>
          )}
        </div>
        <ul className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
          {inRoles.map((a) => {
            const off = excluded.has(a.uuid)
            return (
              <li key={a.uuid}>
                <button
                  onClick={() => toggleAgent(a.uuid)}
                  aria-pressed={!off}
                  title={a.name}
                  className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 border-ink transition ${
                    off ? 'opacity-35 grayscale' : 'hover:-translate-y-0.5 hover:-rotate-3'
                  }`}
                  style={{ background: a.color }}
                >
                  <img src={a.icon} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
                  {off && <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-ink">✕</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ---------- แถบสุ่ม ----------
// การ์ดเอเจนท์เรียงเป็นแถบยาว เลื่อนผ่านเข็มตรงกลางแล้วค่อย ๆ ช้าลงจนหยุด รูปใหญ่ตั้งตรง อ่านชื่อได้ตลอด

const CARD = 128 // ความกว้างการ์ด (px)
const GAP = 12
const STEP = CARD + GAP
const STRIP = 64 // จำนวนการ์ดในแถบต่อการหมุนหนึ่งรอบ
const LAND = 56 // index ที่จะหยุด
const START = 3 // index ที่อยู่ตรงเข็มตอนเริ่ม (ไว้ต่อจากผลรอบก่อน)

/** translateX ที่ทำให้การ์ด index นี้อยู่กลางเข็มพอดี (แถบเริ่มที่ left: 50%) */
const offsetFor = (index: number, nudge = 0) => -(index * STEP + CARD / 2) + nudge

function Reel({ pool }: { pool: Agent[] }) {
  const { t } = useI18n()
  const r = t.random
  const [strip, setStrip] = useState<Agent[] | null>(null)
  const [offset, setOffset] = useState(offsetFor(START))
  const [duration, setDuration] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Agent | null>(null)
  const [round, setRound] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const frame = useRef(0)
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      cancelAnimationFrame(frame.current)
    },
    [],
  )

  // ยังไม่เคยสุ่ม: โชว์ตัวที่ลุ้นได้เรียงไปเรื่อย ๆ
  const shown = strip ?? Array.from({ length: Math.min(STRIP, Math.max(pool.length, 12)) }, (_, i) => pool[i % Math.max(pool.length, 1)]).filter(Boolean)

  const spin = () => {
    if (spinning || !pool.length) return
    const pick = pool[randInt(pool.length)]
    // แถบใหม่: ช่องเริ่ม = ตัวที่อยู่ตรงเข็มตอนนี้ (ภาพจะต่อเนื่อง) ช่อง LAND = ตัวที่สุ่มได้
    const current = result ?? shown[START] ?? pick
    const next = Array.from({ length: STRIP }, () => pool[randInt(pool.length)])
    next[START] = current
    next[LAND] = pick
    // ไม่ให้ตัวข้าง ๆ ช่องที่หยุดเป็นตัวเดียวกับที่สุ่มได้ (ดูงง)
    if (pool.length > 1) {
      for (const i of [LAND - 1, LAND + 1]) while (next[i].uuid === pick.uuid) next[i] = pool[randInt(pool.length)]
    }
    const fast = reducedMotion()
    const nudge = (Math.random() - 0.5) * CARD * 0.6

    clearTimeout(timer.current)
    cancelAnimationFrame(frame.current)
    setStrip(next)
    setResult(null)
    setSpinning(true)
    setDuration(0)
    setOffset(offsetFor(START))
    // รอให้ browser วางแถบใหม่ที่ตำแหน่งเริ่มก่อน แล้วค่อยใส่ transition เลื่อนไปช่องที่หยุด
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        setDuration(fast ? 0 : SPIN_MS)
        setOffset(offsetFor(LAND, nudge))
      })
    })
    timer.current = setTimeout(
      () => {
        setSpinning(false)
        setResult(pick)
        setRound((x) => x + 1)
        // ขยับให้ตรงกลางเป๊ะ ๆ
        setDuration(250)
        setOffset(offsetFor(LAND))
      },
      fast ? 80 : SPIN_MS + 80,
    )
  }

  const landed = result ? LAND : -1

  return (
    <div className="space-y-6">
      <div className="relative -mx-4 overflow-hidden border-y-2 border-ink bg-night py-5 sm:mx-0 sm:rounded-2xl sm:border-2">
        {/* เข็มบน-ล่าง */}
        <svg viewBox="0 0 40 24" className="absolute top-0 left-1/2 z-10 h-6 w-10 -translate-x-1/2" aria-hidden>
          <path d="M4 0H36L20 22Z" fill="#ff4654" stroke="#1d1f24" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 40 24" className="absolute bottom-0 left-1/2 z-10 h-6 w-10 -translate-x-1/2 rotate-180" aria-hidden>
          <path d="M4 0H36L20 22Z" fill="#ff4654" stroke="#1d1f24" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <span aria-hidden className="absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 bg-red/80" />
        {/* ขอบมืดซ้ายขวา ให้สายตาไปอยู่ตรงกลาง */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-night to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/4 bg-gradient-to-l from-night to-transparent" />

        <div className="relative h-[176px]">
          <ul
            className="absolute top-0 left-1/2 flex"
            style={{ gap: GAP, transform: `translateX(${offset}px)`, transition: `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.15, 1)` }}
          >
            {shown.map((a, i) => {
              const win = i === landed
              return (
                <li
                  key={`${round}-${i}`}
                  className={`shrink-0 rounded-xl border-2 border-ink bg-card p-1.5 transition-transform duration-300 ${win ? 'scale-105 !bg-mustard' : ''}`}
                  style={{ width: CARD }}
                >
                  <div className="aspect-square overflow-hidden rounded-lg" style={{ background: a.color }}>
                    <img src={a.icon} alt={win ? a.name : ''} className="h-full w-full object-cover" draggable={false} />
                  </div>
                  <p className="truncate px-0.5 pt-1 text-center font-display text-sm font-bold">{a.name}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={spin} disabled={spinning || !pool.length} className="btn text-lg disabled:cursor-not-allowed disabled:opacity-60">
          🎲 {spinning ? r.spinning : result ? r.again : r.spin}
        </button>
      </div>

      <div aria-live="polite">
        {result ? (
          <div key={`${result.uuid}-${round}`} className="card mx-auto flex max-w-xl animate-fade-up items-center gap-4 p-3 -rotate-1">
            <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg sm:h-44 sm:w-36" style={{ background: result.color }}>
              {result.portrait && <img src={result.portrait} alt={result.name} className="absolute inset-0 h-full w-full scale-150 object-cover object-top" />}
            </div>
            <div className="min-w-0">
              <p className="hand text-xl">{r.youGot}</p>
              <p className="font-display text-3xl font-bold sm:text-4xl">{result.name}</p>
              <Link href={`/agents/${result.uuid}`} className="btn btn-paper mt-3 !py-1.5 text-sm">
                {r.view}
              </Link>
            </div>
          </div>
        ) : (
          !pool.length && <p className="hand text-center text-xl">{r.tooFew(1)}</p>
        )}
      </div>
    </div>
  )
}

// ---------- สุ่มทั้งทีม ----------

function TeamRoll({ pool, roles, roleOn }: { pool: Agent[]; roles: Role[]; roleOn: string[] }) {
  const { t } = useI18n()
  const r = t.random
  const [balanced, setBalanced] = useState(true)
  const [team, setTeam] = useState<Agent[]>([])
  // จำนวนช่องที่หยุดหมุนแล้ว (ช่องที่ยังไม่หยุดจะสลับรูปไปเรื่อย ๆ)
  const [stopped, setStopped] = useState(TEAM)
  const [tick, setTick] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const rolling = stopped < TEAM

  useEffect(() => {
    if (!rolling) return
    const id = setInterval(() => setTick((x) => x + 1), 90)
    return () => clearInterval(id)
  }, [rolling])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const roll = () => {
    if (rolling || pool.length < TEAM) return
    let picked: Agent[]
    if (balanced) {
      // ทีมมาตรฐาน: Duelist 2 + Initiator 1 + Controller 1 + Sentinel 1 (เฉพาะตำแหน่งที่เปิดอยู่)
      // ตำแหน่งไหนตัวไม่พอ หรือปิดไว้ ค่อยสุ่มเติมจากทุกตัวที่เหลือ
      picked = []
      for (const role of roles.filter((x) => roleOn.includes(x.uuid))) {
        const want = role.uuid === DUELIST_ROLE_UUID ? 2 : 1
        picked.push(...shuffle(pool.filter((a) => a.roleUuid === role.uuid)).slice(0, want))
      }
      picked = picked.slice(0, TEAM)
      const rest = shuffle(pool.filter((a) => !picked.includes(a)))
      picked = [...picked, ...rest].slice(0, TEAM)
      const order = roles.map((x) => x.uuid)
      picked.sort((a, b) => order.indexOf(a.roleUuid) - order.indexOf(b.roleUuid))
    } else {
      picked = shuffle(pool).slice(0, TEAM)
    }
    timers.current.forEach(clearTimeout)
    setTeam(picked)
    if (reducedMotion()) {
      setStopped(TEAM)
      return
    }
    setStopped(0)
    timers.current = Array.from({ length: TEAM }, (_, i) => setTimeout(() => setStopped(i + 1), 700 + i * 380))
  }

  const roleOf = (uuid: string) => roles.find((x) => x.uuid === uuid)
  const enough = pool.length >= TEAM

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button onClick={roll} disabled={rolling || !enough} className="btn text-lg disabled:cursor-not-allowed disabled:opacity-60">
          🎲 {team.length ? r.again : r.roll}
        </button>
        <label className="flex cursor-pointer items-center gap-2 font-display font-semibold">
          <input type="checkbox" checked={balanced} onChange={(e) => setBalanced(e.target.checked)} className="h-5 w-5 accent-[#ff4654]" />
          {r.balanced}
        </label>
      </div>
      {!enough && <p className="hand text-center text-xl">{r.tooFew(TEAM)}</p>}

      {team.length > 0 && (
        <div>
          <p className="hand mb-3 text-center text-xl">{r.teamResult}</p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {team.map((a, i) => {
              const done = i < stopped
              const shown = done ? a : pool[(tick * 7 + i * 5) % pool.length] ?? a
              const role = roleOf(shown.roleUuid)
              return (
                <li key={i} className={i === 4 ? 'col-span-2 mx-auto w-1/2 sm:col-span-1 sm:w-full' : ''}>
                  <Link
                    href={`/agents/${a.uuid}`}
                    aria-disabled={!done}
                    className={`card block p-2 ${done ? 'card-hover animate-fade-in' : 'pointer-events-none'} ${['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'][i]}`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md" style={{ background: shown.color }}>
                      <img src={shown.icon} alt={done ? a.name : ''} className={`h-full w-full object-cover ${done ? '' : 'blur-[1px]'}`} />
                    </div>
                    <div className="flex items-center gap-1.5 px-1 pt-2">
                      {role && <img src={role.icon} alt={role.name} title={role.name} className="h-4 w-4 invert" />}
                      <p className="truncate font-display text-lg font-bold">{done ? a.name : '???'}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
