'use client'

// วงล้อสุ่มเอเจนท์: เลือกตำแหน่ง กดเอาตัวที่ไม่อยากได้ออก (จำไว้ใน localStorage) แล้วหมุน
// หรือสุ่มทั้งทีม 5 ตัว (เลือกให้มีครบทุกตำแหน่งได้)

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from '@/components/Link'
import { FilterButton } from '@/components/Filters'
import { useI18n } from '@/components/LangProvider'

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

// ---------- ตัวที่เอาออกจากวงล้อ (จำไว้ในเครื่อง) ----------
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
            {m === 'single' ? `🎡 ${r.single}` : `👥 ${r.team}`}
          </button>
        ))}
      </div>

      {mode === 'single' ? <Wheel pool={pool} /> : <TeamRoll pool={pool} roles={roles} roleOn={roleOn} />}

      {/* ตั้งค่าวงล้อ */}
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

// ---------- วงล้อ ----------

const R = 96
const point = (deg: number, radius: number) => {
  const rad = (deg * Math.PI) / 180
  return [radius * Math.sin(rad), -radius * Math.cos(rad)] as const
}

function Wheel({ pool }: { pool: Agent[] }) {
  const { t } = useI18n()
  const r = t.random
  const [angle, setAngle] = useState(0)
  const [duration, setDuration] = useState(SPIN_MS)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Agent | null>(null)
  // วงล้อที่โชว์อยู่: ล็อกไว้ระหว่างหมุน (กันวงล้อเปลี่ยนกลางทาง)
  const [frozen, setFrozen] = useState<Agent[] | null>(null)
  const wheel = frozen ?? pool
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const n = wheel.length
  const seg = n ? 360 / n : 360
  const iconSize = Math.min(34, n > 1 ? 2 * 64 * Math.sin((seg * Math.PI) / 360) * 0.85 : 60)

  const spin = () => {
    if (spinning || !pool.length) return
    const list = pool
    const idx = randInt(list.length)
    const s = 360 / list.length
    const jitter = (Math.random() - 0.5) * s * 0.6
    const center = (idx + 0.5) * s + jitter
    // หมุนตามเข็มนาฬิกา 5 รอบขึ้นไป แล้วให้ช่องที่สุ่มได้ไปหยุดใต้เข็มด้านบน
    const fast = reducedMotion()
    const base = Math.ceil(angle / 360) * 360 + (fast ? 0 : 360 * 5)
    setFrozen(list)
    setDuration(fast ? 0 : SPIN_MS)
    setAngle(base + (360 - center))
    setSpinning(true)
    setResult(null)
    clearTimeout(timer.current)
    timer.current = setTimeout(
      () => {
        setSpinning(false)
        setResult(list[idx])
        setFrozen(null)
      },
      fast ? 50 : SPIN_MS + 100,
    )
  }

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="relative mx-auto w-full max-w-[460px]">
        {/* เข็มชี้ */}
        <svg viewBox="0 0 40 44" className="absolute top-[-14px] left-1/2 z-10 h-11 w-10 -translate-x-1/2 drop-shadow-[2px_3px_0_var(--color-ink)]" aria-hidden>
          <path d="M20 42L4 8Q2 2 8 2H32Q38 2 36 8Z" fill="#ff4654" stroke="#1d1f24" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div className="rounded-full border-4 border-ink bg-card p-2 shadow-[6px_8px_0_var(--color-ink)]">
          <svg
            viewBox="-100 -100 200 200"
            className="block w-full"
            style={{ transform: `rotate(${angle}deg)`, transition: `transform ${duration}ms cubic-bezier(0.15, 0.75, 0.1, 1)` }}
            role="img"
            aria-label={t.random.title}
          >
            {n === 0 && <circle r={R} fill="#ebe3d4" />}
            {wheel.map((a, i) => {
              const a0 = i * seg
              const a1 = (i + 1) * seg
              const mid = a0 + seg / 2
              const [x0, y0] = point(a0, R)
              const [x1, y1] = point(a1, R)
              const [ix, iy] = point(mid, 66)
              return (
                <g key={a.uuid}>
                  {n === 1 ? (
                    <circle r={R} fill={a.color} />
                  ) : (
                    <path
                      d={`M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`}
                      fill={a.color}
                      stroke="#1d1f24"
                      strokeWidth="1.2"
                    />
                  )}
                  <image
                    href={a.icon}
                    x={ix - iconSize / 2}
                    y={iy - iconSize / 2}
                    width={iconSize}
                    height={iconSize}
                    transform={`rotate(${mid} ${ix} ${iy})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              )
            })}
            <circle r={R} fill="none" stroke="#1d1f24" strokeWidth="2.5" />
          </svg>
        </div>
        <button
          onClick={spin}
          disabled={spinning || !pool.length}
          className="absolute top-1/2 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-ink bg-mustard font-display text-xl font-bold shadow-[3px_4px_0_var(--color-ink)] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {spinning ? '…' : r.spin}
        </button>
      </div>

      <div aria-live="polite" className="min-h-64">
        {result ? (
          <div key={`${result.uuid}-${angle}`} className="card mx-auto max-w-sm -rotate-1 animate-fade-up p-3">
            <p className="hand px-1 text-xl">{r.youGot}</p>
            <div className="relative mt-2 aspect-[4/5] overflow-hidden rounded-lg" style={{ background: result.color }}>
              {result.portrait && <img src={result.portrait} alt={result.name} className="absolute inset-0 h-full w-full scale-125 object-cover object-top" />}
            </div>
            <p className="px-1 pt-3 font-display text-3xl font-bold">{result.name}</p>
            <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
              <button onClick={spin} className="btn !py-2 text-sm">
                🎲 {r.again}
              </button>
              <Link href={`/agents/${result.uuid}`} className="btn btn-paper !py-2 text-sm">
                {r.view}
              </Link>
            </div>
          </div>
        ) : (
          <p className="hand py-16 text-center text-2xl">{!pool.length ? r.tooFew(1) : spinning ? r.spinning : `${r.spin} 👈`}</p>
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
      // ตำแหน่งละตัวก่อน (เฉพาะตำแหน่งที่เปิดอยู่) ที่เหลือสุ่มจากทุกตัว
      picked = []
      for (const role of shuffle(roles.filter((x) => roleOn.includes(x.uuid)))) {
        const pick = shuffle(pool.filter((a) => a.roleUuid === role.uuid))[0]
        if (pick && picked.length < TEAM) picked.push(pick)
      }
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
