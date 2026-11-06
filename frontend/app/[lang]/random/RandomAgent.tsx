'use client'

// วงล้อสุ่มเอเจนท์: เลือกตำแหน่ง กดเอาตัวที่ไม่อยากได้ออก (จำไว้ใน localStorage) แล้วหมุน
// หรือสุ่มทั้งทีม 5 ตัว (เลือกให้มีครบทุกตำแหน่งได้)

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from '@/components/Link'
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

// ผลสุ่มล่าสุด เก็บไว้ในหน่วยความจำของหน้าเว็บ (ไม่ใช่ localStorage)
// เปลี่ยนไปหน้าอื่นในเว็บแล้วกลับมาผลยังอยู่ รีเฟรชหน้าเมื่อไหร่ก็หายเอง
const memory: {
  mode: 'single' | 'team'
  roleOn: string[] | null
  single: Agent | null
  angle: number
  team: Agent[]
  /** จำนวนตัวที่อยากได้ในแต่ละตำแหน่ง (uuid ของ role → จำนวน) null = ทีมมาตรฐาน */
  counts: Record<string, number> | null
} = { mode: 'single', roleOn: null, single: null, angle: 0, team: [], counts: null }
const remember = (patch: Partial<typeof memory>) => Object.assign(memory, patch)

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const randInt = (n: number) => Math.floor(Math.random() * n)

export default function RandomAgent({ agents, roles }: { agents: Agent[]; roles: Role[] }) {
  const { t } = useI18n()
  const r = t.random
  const [mode, setModeState] = useState<'single' | 'team'>(() => memory.mode)
  const setMode = (m: 'single' | 'team') => {
    remember({ mode: m })
    setModeState(m)
  }
  // ผลของวงล้อ (โชว์ในช่องรูปใหญ่บนแผงขวา)
  const [spin, setSpin] = useState<{ result: Agent | null; spinning: boolean }>(() => ({ result: memory.single, spinning: false }))
  const [roleOn, setRoleOnState] = useState<string[]>(() => memory.roleOn ?? roles.map((x) => x.uuid))
  const setRoleOn = (f: (on: string[]) => string[]) =>
    setRoleOnState((on) => {
      const next = f(on)
      remember({ roleOn: next })
      return next
    })

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
    <div className="space-y-6">
      {/* โหมด */}
      <div role="group" className="mx-auto flex w-fit overflow-hidden rounded-xl border-2 border-ink bg-card">
        {(['single', 'team'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-4 py-2 font-display font-semibold transition-colors sm:px-6 ${mode === m ? 'bg-ink text-paper' : 'hover:bg-mustard/40'}`}
          >
            {m === 'single' ? r.single : r.team}
          </button>
        ))}
      </div>

      {/* จอใหญ่: วงล้ออยู่ซ้าย แผงเลือกตัวอยู่ขวาติดกัน ปรับแล้วเห็นผลบนวงล้อทันทีไม่ต้องเลื่อนหา */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div>{mode === 'single' ? <Wheel pool={pool} onChange={setSpin} /> : <TeamRoll pool={pool} roles={roles} roleOn={roleOn} />}</div>

        <aside className="space-y-4">
          {/* ช่องผลลัพธ์: เตรียมกรอบรูปไว้ก่อน หมุนเสร็จแล้วเอเจนท์ที่ได้มาโผล่ในกรอบนี้ */}
          {mode === 'single' && <ResultSlot result={spin.result} spinning={spin.spinning} />}

          {/* ตั้งค่าการสุ่ม */}
          <div className="card p-4 sm:p-5">
            <p className="mb-2 font-display text-lg font-bold">{r.roles}</p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => {
                const on = roleOn.includes(role.uuid)
                return (
                  <button
                    key={role.uuid}
                    onClick={() => toggleRole(role.uuid)}
                    aria-pressed={on}
                    className={`flex items-center gap-2 rounded-xl border-2 border-ink px-3 py-2.5 font-display text-base font-bold transition-all ${
                      on ? 'bg-ink text-paper' : 'bg-card text-ink-soft hover:-translate-y-0.5 hover:bg-mustard/40'
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${on ? '' : 'bg-ink'}`}>
                      <img src={role.icon} alt="" className="h-4 w-4" />
                    </span>
                    <span className="truncate py-0.5 leading-normal">{role.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink-soft">{r.pool(pool.length, inRoles.length)}</p>
              {excluded.size > 0 && (
                <button onClick={() => writeExcluded([])} className="btn btn-paper !px-3 !py-1 text-sm">
                  {r.selectAll}
                </button>
              )}
            </div>
            <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-6">
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
        </aside>
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

/** มุมหมุนจริงของ element ตอนนี้ (อ่านจาก transform ระหว่าง transition) */
function currentAngle(el: Element) {
  const m = getComputedStyle(el).transform
  if (!m || m === 'none') return 0
  const [a, b] = m.slice(m.indexOf('(') + 1, -1).split(',').map(Number)
  return (Math.atan2(b, a) * 180) / Math.PI
}

function Wheel({ pool, onChange }: { pool: Agent[]; onChange: (s: { result: Agent | null; spinning: boolean }) => void }) {
  const { t } = useI18n()
  const r = t.random
  // กลับมาหน้านี้อีกรอบ: วงล้อหยุดค้างที่ผลเดิม (ไม่ต้องหมุนให้ดู)
  const [angle, setAngle] = useState(() => memory.angle)
  const [duration, setDuration] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Agent | null>(() => memory.single)
  // ช่องที่อยู่ใต้เข็มตอนนี้ (อัปเดตทุกเฟรมระหว่างหมุน) ไว้โชว์ชื่อตัวที่กำลังผ่าน
  const [under, setUnder] = useState<number | null>(null)
  // วงล้อที่โชว์อยู่: ล็อกไว้ระหว่างหมุน (กันวงล้อเปลี่ยนกลางทาง)
  const [frozen, setFrozen] = useState<Agent[] | null>(null)
  const wheel = frozen ?? pool
  const svgRef = useRef<SVGSVGElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const frame = useRef(0)
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      cancelAnimationFrame(frame.current)
    },
    [],
  )

  const n = wheel.length
  const seg = n ? 360 / n : 360
  const iconR = n > 12 ? 74 : 64
  const iconSize = Math.min(44, n > 1 ? 2 * iconR * Math.sin((seg * Math.PI) / 360) * 0.92 : 64)
  const winIndex = result && !spinning ? wheel.findIndex((a) => a.uuid === result.uuid) : -1
  const pointed = spinning && under !== null ? wheel[under] : result

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
    onChange({ result: null, spinning: true })
    remember({ single: list[idx] })
    remember({ angle: base + (360 - center) })
    clearTimeout(timer.current)
    cancelAnimationFrame(frame.current)

    // ติดตามว่าเข็มชี้ช่องไหนอยู่ทุกเฟรม
    const track = () => {
      const el = svgRef.current
      if (el) {
        const deg = (((-currentAngle(el)) % 360) + 360) % 360
        setUnder(Math.min(list.length - 1, Math.floor(deg / s)))
      }
      frame.current = requestAnimationFrame(track)
    }
    if (!fast) frame.current = requestAnimationFrame(track)

    timer.current = setTimeout(
      () => {
        cancelAnimationFrame(frame.current)
        setSpinning(false)
        setResult(list[idx])
        onChange({ result: list[idx], spinning: false })
        setUnder(null)
        setFrozen(null)
      },
      fast ? 50 : SPIN_MS + 100,
    )
  }

  return (
    <div className="space-y-5">
      {/* ป้ายชื่อตัวที่เข็มชี้อยู่ — โผล่ตอนหมุน/หมุนเสร็จเท่านั้น ก่อนหมุนเว้นที่ไว้เฉย ๆ (ไม่ให้คนนึกว่าเป็นปุ่ม) */}
      <div className="flex h-14 items-center justify-center">
        {pointed ? (
          <div className="flex max-w-xs items-center gap-2 rounded-xl border-2 border-ink bg-night px-4 py-1.5 text-paper shadow-[3px_4px_0_var(--color-ink)]">
            <img src={pointed.icon} alt="" className="h-9 w-9 rounded-md" style={{ background: pointed.color }} />
            <span className={`truncate py-0.5 font-display text-2xl leading-normal font-bold ${spinning ? '' : 'text-mustard'}`}>{pointed.name}</span>
          </div>
        ) : (
          !pool.length && <p className="hand text-xl">{r.tooFew(1)}</p>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-[520px]">
        {/* เข็มชี้ */}
        <svg viewBox="0 0 40 44" className="absolute top-[-16px] left-1/2 z-10 h-12 w-11 -translate-x-1/2 drop-shadow-[2px_3px_0_var(--color-ink)]" aria-hidden>
          <path d="M20 42L4 8Q2 2 8 2H32Q38 2 36 8Z" fill="#ff4654" stroke="#1d1f24" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div className="rounded-full border-4 border-ink bg-card p-2 shadow-[6px_8px_0_var(--color-ink)]">
          <svg
            ref={svgRef}
            viewBox="-100 -100 200 200"
            className="block w-full"
            style={{ transform: `rotate(${angle}deg)`, transition: `transform ${duration}ms cubic-bezier(0.15, 0.75, 0.1, 1)` }}
            role="img"
            aria-label={r.title}
          >
            {n === 0 && <circle r={R} fill="#ebe3d4" />}
            {wheel.map((a, i) => {
              const a0 = i * seg
              const a1 = (i + 1) * seg
              const mid = a0 + seg / 2
              const [x0, y0] = point(a0, R)
              const [x1, y1] = point(a1, R)
              const [ix, iy] = point(mid, iconR)
              const d = n === 1 ? undefined : `M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`
              const dim = winIndex >= 0 && i !== winIndex
              return (
                <g key={a.uuid} opacity={dim ? 0.35 : 1} style={{ transition: 'opacity .3s' }}>
                  {d ? <path d={d} fill={a.color} /> : <circle r={R} fill={a.color} />}
                  {/* ช่องเว้นช่องให้สว่างขึ้นนิด ช่องติดกันสีคล้ายกันจะได้แยกออก */}
                  {d && i % 2 === 1 && <path d={d} fill="#fff" opacity="0.18" />}
                  <image
                    href={a.icon}
                    x={ix - iconSize / 2}
                    y={iy - iconSize / 2}
                    width={iconSize}
                    height={iconSize}
                    transform={`rotate(${mid} ${ix} ${iy})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  {d && <path d={d} fill="none" stroke="#fffaf0" strokeWidth="1.4" />}
                </g>
              )
            })}
            <circle r={R} fill="none" stroke="#1d1f24" strokeWidth="2.5" />
          </svg>
        </div>
        <button
          onClick={spin}
          disabled={spinning || !pool.length}
          className="absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-ink bg-mustard font-display text-lg font-bold shadow-[3px_4px_0_var(--color-ink)] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 sm:h-24 sm:w-24 sm:text-xl"
        >
          {spinning ? '…' : r.spin}
        </button>
      </div>

    </div>
  )
}

/** ปุ่มแชร์ผลสุ่ม: มือถือเปิดเมนูแชร์ของเครื่อง คอมคัดลอกข้อความ + ลิงก์ */
function ShareButton({ text, className = '' }: { text: string; className?: string }) {
  const { lang, t } = useI18n()
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = `${window.location.origin}/${lang}/random`
    try {
      if (navigator.share) await navigator.share({ text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // ยกเลิกการแชร์ / clipboard ใช้ไม่ได้
    }
  }
  return (
    <button onClick={share} className={`btn btn-paper !py-1.5 text-sm ${className}`}>
      {copied ? t.random.copied : t.random.share}
    </button>
  )
}

/** กรอบผลลัพธ์บนแผงขวา: รูปอยู่ซ้าย ชื่อ + ลิงก์ดูสกิลอยู่ขวา ก่อนหมุนเป็น "?" ระหว่างหมุนกะพริบรอ */
function ResultSlot({ result, spinning }: { result: Agent | null; spinning: boolean }) {
  const { t } = useI18n()
  const r = t.random
  const done = result && !spinning
  return (
    <div aria-live="polite" className="card flex items-center gap-4 p-3">
      <div
        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-night sm:h-32 sm:w-32"
        style={done ? { background: result.color } : undefined}
      >
        {done ? (
          <img key={result.uuid} src={result.icon} alt={result.name} className="h-full w-full animate-fade-in object-cover" />
        ) : (
          <span className={`absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-paper/80 ${spinning ? 'animate-pulse' : ''}`}>?</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="hand text-lg">{r.youGot}</p>
        <p className="truncate py-0.5 font-display text-3xl leading-normal font-bold">{done ? result.name : spinning ? r.spinning : '???'}</p>
        {done && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link href={`/agents/${result.uuid}`} className="text-sm font-semibold text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink">
              {r.view}
            </Link>
            <ShareButton text={r.shareSingle(result.name)} />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- สุ่มทั้งทีม ----------

/** สูตรทีมสำเร็จรูป: จำนวนตัวต่อตำแหน่ง เรียง Duelist, Initiator, Controller, Sentinel */
const PRESETS = [
  { key: 'standard', mix: [2, 1, 1, 1] },
  { key: 'doubleSmoke', mix: [1, 1, 2, 1] },
  { key: 'doubleInit', mix: [1, 2, 1, 1] },
  { key: 'free', mix: [0, 0, 0, 0] },
] as const

const mixToCounts = (roles: Role[], mix: readonly number[]) => Object.fromEntries(roles.map((x, i) => [x.uuid, mix[i] ?? 0]))

function TeamRoll({ pool, roles, roleOn }: { pool: Agent[]; roles: Role[]; roleOn: string[] }) {
  const { t } = useI18n()
  const r = t.random
  const [counts, setCountsState] = useState<Record<string, number>>(() => memory.counts ?? mixToCounts(roles, PRESETS[0].mix))
  const setCounts = (next: Record<string, number>) => {
    remember({ counts: next })
    setCountsState(next)
  }
  const total = roles.reduce((n, x) => n + (counts[x.uuid] ?? 0), 0)
  const step = (uuid: string, d: number) => {
    const v = (counts[uuid] ?? 0) + d
    if (v < 0 || (d > 0 && total >= TEAM)) return
    setCounts({ ...counts, [uuid]: v })
  }

  const [team, setTeam] = useState<Agent[]>(() => memory.team)
  // จำนวนช่องที่หยุดหมุนแล้ว (ช่องที่ยังไม่หยุดจะสลับรูปไปเรื่อย ๆ)
  const [stopped, setStopped] = useState(TEAM)
  // ช่องที่กำลังสุ่มใหม่ทีละช่อง
  const [rerolling, setRerolling] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const rolling = stopped < TEAM || rerolling !== null

  useEffect(() => {
    if (!rolling) return
    const id = setInterval(() => setTick((x) => x + 1), 90)
    return () => clearInterval(id)
  }, [rolling])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ตำแหน่งของแต่ละช่อง ตามจำนวนที่ตั้งไว้ ช่องที่เหลือเป็น "อะไรก็ได้"
  const slotRoles: (Role | undefined)[] = roles.flatMap((x) => Array.from({ length: counts[x.uuid] ?? 0 }, () => x)).slice(0, TEAM)
  while (slotRoles.length < TEAM) slotRoles.push(undefined)

  /** สุ่มตัวให้ช่องหนึ่ง: ตรงตำแหน่งก่อน (ถ้าตำแหน่งนั้นเปิดอยู่และยังมีตัว) ไม่งั้นเอาตัวไหนก็ได้ที่ยังไม่อยู่ในทีม */
  const pickFor = (role: Role | undefined, taken: Agent[]) => {
    const free = pool.filter((a) => !taken.some((x) => x.uuid === a.uuid))
    const fit = role && roleOn.includes(role.uuid) ? free.filter((a) => a.roleUuid === role.uuid) : []
    const list = fit.length ? fit : free
    return list.length ? list[randInt(list.length)] : null
  }

  const roll = () => {
    if (rolling || pool.length < TEAM) return
    // ช่องที่ล็อกตำแหน่งไว้สุ่มก่อน ช่อง "อะไรก็ได้" ค่อยเติมทีหลัง จะได้ไม่แย่งตัวกัน
    const order = slotRoles.map((role, i) => ({ role, i })).sort((a, b) => Number(!a.role) - Number(!b.role))
    const picked: Agent[] = []
    const out: Agent[] = Array(TEAM)
    for (const { role, i } of order) {
      const a = pickFor(role, picked)
      if (!a) return
      picked.push(a)
      out[i] = a
    }
    timers.current.forEach(clearTimeout)
    setTeam(out)
    remember({ team: out })
    if (reducedMotion()) {
      setStopped(TEAM)
      return
    }
    setStopped(0)
    timers.current = Array.from({ length: TEAM }, (_, i) => setTimeout(() => setStopped(i + 1), 700 + i * 380))
  }

  /** สุ่มใหม่เฉพาะช่องเดียว (เช่นเพื่อนไม่อยากเล่นตัวนี้) ตำแหน่งเดิม ตัวไม่ซ้ำกับคนอื่นในทีม */
  const rerollSlot = (i: number) => {
    if (rolling) return
    const a = pickFor(slotRoles[i], team)
    if (!a) return
    const out = team.map((x, j) => (j === i ? a : x))
    setTeam(out)
    remember({ team: out })
    if (reducedMotion()) return
    setRerolling(i)
    timers.current.push(setTimeout(() => setRerolling(null), 650))
  }

  const roleOf = (uuid: string) => roles.find((x) => x.uuid === uuid)
  const enough = pool.length >= TEAM
  const presetOn = PRESETS.find((p) => roles.every((x, i) => (counts[x.uuid] ?? 0) === (p.mix[i] ?? 0)))?.key

  return (
    <div className="space-y-6">
      {/* สูตรทีม: เลือกสำเร็จรูป หรือกด +/- ทีละตำแหน่ง */}
      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setCounts(mixToCounts(roles, p.mix))}
              aria-pressed={presetOn === p.key}
              className={`chip ${presetOn === p.key ? '!bg-ink !text-paper' : 'hover:!bg-mustard/40'}`}
            >
              {r.presets[p.key]}
            </button>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {roles.map((role) => (
            <li key={role.uuid} className="flex items-center justify-between gap-1 rounded-xl border-2 border-ink bg-card px-2 py-1.5">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink">
                  <img src={role.icon} alt="" className="h-3.5 w-3.5" />
                </span>
                <span className="truncate py-0.5 text-sm leading-normal font-semibold">{role.name}</span>
              </span>
              <span className="flex shrink-0 items-center">
                <button onClick={() => step(role.uuid, -1)} aria-label={`${role.name} -1`} className="h-7 w-7 rounded-md font-bold hover:bg-mustard/40 disabled:opacity-30" disabled={!counts[role.uuid]}>
                  −
                </button>
                <span className="w-5 text-center font-mono font-bold">{counts[role.uuid] ?? 0}</span>
                <button onClick={() => step(role.uuid, 1)} aria-label={`${role.name} +1`} className="h-7 w-7 rounded-md font-bold hover:bg-mustard/40 disabled:opacity-30" disabled={total >= TEAM}>
                  +
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft">{r.mixNote(TEAM - total)}</p>
      </div>

      <div className="flex justify-center">
        <button onClick={roll} disabled={rolling || !enough} className="btn text-lg disabled:cursor-not-allowed disabled:opacity-60">
          {team.length ? r.again : r.roll}
        </button>
      </div>
      {!enough && <p className="hand text-center text-xl">{r.tooFew(TEAM)}</p>}

      <div>
        <p className="hand mb-3 text-center text-xl">{r.teamResult}</p>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {/* ยังไม่ได้สุ่ม: การ์ดเปล่า 5 ใบรอไว้ บอกตำแหน่งของแต่ละช่อง */}
          {team.length === 0 &&
            slotRoles.map((role, i) => (
              <li key={i} className={i === 4 ? 'col-span-2 mx-auto w-1/2 sm:col-span-1 sm:w-full' : ''}>
                <div className={`card block p-2 ${['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'][i]}`}>
                  <div className="skeleton relative flex aspect-square items-center justify-center overflow-hidden rounded-md">
                    <span className="font-display text-5xl font-bold text-ink/25">?</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-1 pt-2">
                    {role && <img src={role.icon} alt={role.name} title={role.name} className="h-4 w-4 invert" />}
                    <p className="truncate py-0.5 font-display text-lg leading-normal font-bold text-ink-soft">{role?.name ?? r.anyRole}</p>
                  </div>
                </div>
              </li>
            ))}
          {team.map((a, i) => {
            const done = i < stopped && rerolling !== i
            const shown = done ? a : (pool[(tick * 7 + i * 5) % pool.length] ?? a)
            const role = roleOf(shown.roleUuid)
            return (
              <li key={i} className={`relative ${i === 4 ? 'col-span-2 mx-auto w-1/2 sm:col-span-1 sm:w-full' : ''}`}>
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
                    <p className="truncate py-0.5 font-display text-lg leading-normal font-bold">{done ? a.name : '???'}</p>
                  </div>
                </Link>
                {!rolling && (
                  <button
                    onClick={() => rerollSlot(i)}
                    title={r.rerollOne}
                    aria-label={`${r.rerollOne}: ${a.name}`}
                    className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-mustard font-bold shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:rotate-90"
                  >
                    ↻
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {team.length > 0 && !rolling && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <p className="text-sm text-ink-soft">{r.rerollHint}</p>
            <ShareButton text={r.shareTeam(team.map((a) => a.name))} />
          </div>
        )}
      </div>
    </div>
  )
}
