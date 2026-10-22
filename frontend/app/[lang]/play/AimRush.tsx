'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useI18n } from '@/components/LangProvider'

type Difficulty = 'easy' | 'normal' | 'hard'
type Phase = 'idle' | 'countdown' | 'playing' | 'over'

interface Rank {
  name: string
  icon: string | null
  color: string
}

interface Result {
  score: number
  hits: number
  misses: number
  headshots: number
  expired: number
  reaction: number
  bestCombo: number
}

// spawn = ทุกกี่วินาที, life = เป้าอยู่กี่วินาที, radius = ขนาดฐาน, mult = ตัวคูณคะแนน
const LEVELS: Record<Difficulty, { spawn: number; life: number; radius: number; mult: number; maxAlive: number }> = {
  easy: { spawn: 0.85, life: 1.8, radius: 46, mult: 0.6, maxAlive: 3 },
  normal: { spawn: 0.62, life: 1.3, radius: 38, mult: 1, maxAlive: 4 },
  hard: { spawn: 0.42, life: 0.95, radius: 30, mult: 1.4, maxAlive: 5 },
}
const ROUND = 30
const RANK_SCORE = 7000 // คะแนนที่เทียบเท่า Radiant
const FALLBACK_RANKS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

// ---------- best score (localStorage) ----------
const BEST_EVENT = 'aimrush-best'
const bestKey = (d: Difficulty) => `aimrush:best:${d}`
function readBest(d: Difficulty) {
  try {
    return Number(localStorage.getItem(bestKey(d)) ?? 0) || 0
  } catch {
    return 0
  }
}
function writeBest(d: Difficulty, score: number) {
  try {
    localStorage.setItem(bestKey(d), String(score))
    window.dispatchEvent(new Event(BEST_EVENT))
  } catch {
    // private mode — ไม่เป็นไร
  }
}
function subscribeBest(cb: () => void) {
  window.addEventListener(BEST_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(BEST_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

// ---------- เสียงสั้น ๆ ด้วย WebAudio ----------
function makeSound() {
  let ctx: AudioContext | null = null
  let muted = false
  const beep = (freq: number, dur: number, type: OscillatorType, gain = 0.08) => {
    if (muted) return
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + dur)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  }
  return {
    unlock: () => {
      ctx ??= new AudioContext()
      void ctx.resume()
    },
    setMuted: (m: boolean) => (muted = m),
    hit: () => beep(880, 0.08, 'square', 0.05),
    head: () => {
      beep(1320, 0.12, 'square', 0.06)
      setTimeout(() => beep(1760, 0.1, 'triangle', 0.05), 50)
    },
    miss: () => beep(140, 0.12, 'sawtooth', 0.05),
    tick: () => beep(600, 0.06, 'triangle', 0.06),
    go: () => beep(990, 0.25, 'triangle', 0.07),
  }
}

interface Target {
  x: number
  y: number
  r: number
  born: number
  life: number
}
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}
interface Floater {
  x: number
  y: number
  text: string
  born: number
  color: string
}

export default function AimRush({ ranks }: { ranks: Rank[] }) {
  const { lang, t } = useI18n()
  const p = t.play
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sound = useRef<ReturnType<typeof makeSound> | null>(null)
  const engine = useRef<{ start: (d: Difficulty) => void } | null>(null)

  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [phase, setPhase] = useState<Phase>('idle')
  const [hud, setHud] = useState({ score: 0, time: ROUND, combo: 0 })
  const [result, setResult] = useState<Result | null>(null)
  const [newBest, setNewBest] = useState(false)
  const [muted, setMuted] = useState(false)
  const [copied, setCopied] = useState(false)

  const best = useSyncExternalStore(subscribeBest, () => readBest(difficulty), () => 0)

  const rankList: Rank[] = ranks.length ? ranks : FALLBACK_RANKS.map((name) => ({ name, icon: null, color: '#1d1f24' }))
  const rankFor = (score: number) => rankList[Math.max(0, Math.min(rankList.length - 1, Math.floor((score / RANK_SCORE) * (rankList.length - 1))))]

  // ref เก็บค่าที่ engine ต้องใช้แต่ไม่ต้องสร้าง engine ใหม่
  const labels = useRef({ head: p.headshot })
  useEffect(() => {
    labels.current = { head: p.headshot }
  }, [p.headshot])

  const finish = useCallback((r: Result, d: Difficulty) => {
    setResult(r)
    setPhase('over')
    const prev = readBest(d)
    if (r.score > prev) {
      writeBest(d, r.score)
      setNewBest(true)
    } else setNewBest(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!
    sound.current ??= makeSound()
    const sfx = sound.current

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2)
      w = wrap.clientWidth
      h = wrap.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // ---------- สถานะเกม ----------
    let mode: Phase = 'idle'
    let level = LEVELS.normal
    let diff: Difficulty = 'normal'
    let t0 = 0
    let lastSpawn = 0
    let lastTick = 0
    let targets: Target[] = []
    let particles: Particle[] = []
    let floaters: Floater[] = []
    let shake = 0
    let stats: Result = { score: 0, hits: 0, misses: 0, headshots: 0, expired: 0, reaction: 0, bestCombo: 0 }
    let combo = 0
    let reactionSum = 0
    let lastHud = 0
    const mouse = { x: -100, y: -100 }

    const now = () => performance.now() / 1000

    // เป้าเด้งขึ้นตอนเกิด แล้วค่อย ๆ หดลงจนหมดเวลา
    const currentRadius = (tg: Target, age: number) => {
      const pop = Math.min(1, age / 0.12)
      const shrink = 1 - Math.max(0, age / tg.life) * 0.55
      return tg.r * pop * shrink
    }

    const spawn = (time: number) => {
      const scale = Math.max(0.65, Math.min(1.2, Math.min(w, h) / 560))
      const r = level.radius * scale
      const pad = r + 12
      for (let tries = 0; tries < 12; tries++) {
        const x = pad + Math.random() * (w - pad * 2)
        const y = pad + 40 + Math.random() * (h - pad * 2 - 40)
        if (targets.every((tg) => Math.hypot(tg.x - x, tg.y - y) > tg.r + r + 10)) {
          targets.push({ x, y, r, born: time, life: level.life })
          return
        }
      }
    }

    const burst = (x: number, y: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 120 + Math.random() * 260
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.3, color })
      }
    }

    const start = (d: Difficulty) => {
      diff = d
      level = LEVELS[d]
      targets = []
      particles = []
      floaters = []
      stats = { score: 0, hits: 0, misses: 0, headshots: 0, expired: 0, reaction: 0, bestCombo: 0 }
      combo = 0
      reactionSum = 0
      t0 = now()
      lastTick = 0
      mode = 'countdown'
      setPhase('countdown')
      setHud({ score: 0, time: ROUND, combo: 0 })
      sfx.unlock()
    }
    engine.current = { start }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouse.x = x
      mouse.y = y
      if (mode !== 'playing') return
      const time = now()
      // ยิงโดนเป้าที่อยู่บนสุดก่อน
      for (let i = targets.length - 1; i >= 0; i--) {
        const tg = targets[i]
        const age = time - tg.born
        const r = currentRadius(tg, age)
        const dist = Math.hypot(tg.x - x, tg.y - y)
        if (dist <= r) {
          const head = dist <= r * 0.32
          const base = head ? 150 : 100
          const pts = Math.round(base * level.mult * (1 + Math.min(combo, 20) * 0.05))
          combo++
          stats.bestCombo = Math.max(stats.bestCombo, combo)
          stats.score += pts
          stats.hits++
          if (head) stats.headshots++
          reactionSum += age
          targets.splice(i, 1)
          burst(tg.x, tg.y, head ? '#ff4654' : '#f2b84b', head ? 22 : 12)
          floaters.push({ x: tg.x, y: tg.y - r, text: head ? `${labels.current.head} +${pts}` : `+${pts}`, born: time, color: head ? '#ff4654' : '#f4efe6' })
          if (head) {
            shake = 8
            sfx.head()
          } else sfx.hit()
          return
        }
      }
      stats.misses++
      combo = 0
      sfx.miss()
      floaters.push({ x, y, text: '✕', born: time, color: '#8a8f99' })
    }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)

    // ---------- วาด ----------
    const drawBackground = () => {
      ctx.fillStyle = '#1c1e24'
      ctx.fillRect(0, 0, w, h)
      // สนามซ้อมแบบ perspective
      ctx.strokeStyle = 'rgba(244,239,230,.06)'
      ctx.lineWidth = 1
      const horizon = h * 0.35
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(w / 2 + i * 30, horizon)
        ctx.lineTo(w / 2 + i * w * 0.18, h)
        ctx.stroke()
      }
      for (let i = 1; i < 10; i++) {
        const y = horizon + (h - horizon) * Math.pow(i / 10, 1.8)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
    }

    const drawTarget = (tg: Target, time: number) => {
      const age = time - tg.born
      const r = currentRadius(tg, age)
      if (r <= 0) return
      ctx.save()
      ctx.translate(tg.x, tg.y)
      ctx.fillStyle = 'rgba(0,0,0,.35)'
      ctx.beginPath()
      ctx.ellipse(3, 5, r, r, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#1d1f24'
      ;[
        [1, '#f4efe6'],
        [0.72, '#ff4654'],
        [0.5, '#f4efe6'],
        [0.32, '#ff4654'],
      ].forEach(([k, c]) => {
        ctx.beginPath()
        ctx.arc(0, 0, r * (k as number), 0, Math.PI * 2)
        ctx.fillStyle = c as string
        ctx.fill()
        ctx.stroke()
      })
      // วงเวลาที่เหลือ
      const left = 1 - age / tg.life
      ctx.beginPath()
      ctx.arc(0, 0, r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left)
      ctx.strokeStyle = left < 0.3 ? '#ff4654' : '#f2b84b'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()
    }

    const drawCrosshair = () => {
      if (mouse.x < 0) return
      ctx.save()
      ctx.strokeStyle = '#2bf0c8'
      ctx.fillStyle = '#2bf0c8'
      ctx.lineWidth = 2
      const g = 5
      const l = 9
      ;[
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(([dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(mouse.x + dx * g, mouse.y + dy * g)
        ctx.lineTo(mouse.x + dx * (g + l), mouse.y + dy * (g + l))
        ctx.stroke()
      })
      ctx.fillRect(mouse.x - 1, mouse.y - 1, 2, 2)
      ctx.restore()
    }

    const bigText = (text: string, size: number, color: string, y = h / 2) => {
      ctx.save()
      ctx.font = `700 ${size}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-chakra') || 'sans-serif'}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = 10
      ctx.strokeStyle = '#1d1f24'
      ctx.strokeText(text, w / 2, y)
      ctx.fillStyle = color
      ctx.fillText(text, w / 2, y)
      ctx.restore()
    }

    let raf = 0
    let prev = now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const time = now()
      const dt = Math.min(0.05, time - prev)
      prev = time

      ctx.save()
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
        shake *= 0.85
        if (shake < 0.3) shake = 0
      }
      drawBackground()

      if (mode === 'countdown') {
        const n = 3 - Math.floor(time - t0)
        if (n !== lastTick) {
          lastTick = n
          if (n > 0) sfx.tick()
        }
        if (n <= 0) {
          mode = 'playing'
          setPhase('playing')
          t0 = time
          lastSpawn = time - level.spawn
          sfx.go()
        } else {
          const k = 1 - ((time - t0) % 1)
          bigText(String(n), 90 + k * 60, '#f2b84b')
        }
      }

      if (mode === 'playing') {
        const elapsed = time - t0
        const remaining = Math.max(0, ROUND - elapsed)
        if (time - lastSpawn >= level.spawn && targets.length < level.maxAlive) {
          spawn(time)
          lastSpawn = time
        }
        // เป้าที่หมดเวลา
        targets = targets.filter((tg) => {
          if (time - tg.born < tg.life) return true
          stats.expired++
          combo = 0
          return false
        })
        targets.forEach((tg) => drawTarget(tg, time))
        if (time - lastHud > 0.1) {
          lastHud = time
          setHud({ score: stats.score, time: remaining, combo })
        }
        if (remaining <= 0) {
          mode = 'over'
          targets = []
          finish({ ...stats, reaction: stats.hits ? Math.round((reactionSum / stats.hits) * 1000) : 0 }, diff)
          setHud({ score: stats.score, time: 0, combo: 0 })
        }
      }

      // particles + ข้อความลอย
      particles = particles.filter((pt) => (pt.life -= dt) > 0)
      particles.forEach((pt) => {
        pt.x += pt.vx * dt
        pt.y += pt.vy * dt
        pt.vy += 600 * dt
        ctx.globalAlpha = Math.max(0, pt.life * 2)
        ctx.fillStyle = pt.color
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6)
      })
      ctx.globalAlpha = 1
      floaters = floaters.filter((f) => time - f.born < 0.8)
      floaters.forEach((f) => {
        const age = time - f.born
        ctx.save()
        ctx.globalAlpha = 1 - age / 0.8
        ctx.font = `700 ${f.text.length > 6 ? 22 : 26}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-chakra') || 'sans-serif'}`
        ctx.textAlign = 'center'
        ctx.lineWidth = 5
        ctx.strokeStyle = '#1d1f24'
        ctx.strokeText(f.text, f.x, f.y - age * 50)
        ctx.fillStyle = f.color
        ctx.fillText(f.text, f.x, f.y - age * 50)
        ctx.restore()
      })

      drawCrosshair()
      ctx.restore()
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      engine.current = null
    }
  }, [finish])

  const start = () => {
    setResult(null)
    engine.current?.start(difficulty)
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    sound.current?.setMuted(next)
  }

  const rank = result ? rankFor(result.score) : null
  const accuracy = result && result.hits + result.misses ? Math.round((result.hits / (result.hits + result.misses)) * 100) : 0

  const shareScore = async () => {
    if (!result || !rank) return
    const text = p.shareText(result.score, rank.name)
    const url = `${window.location.origin}/${lang}/play`
    try {
      if (navigator.share) await navigator.share({ text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // ยกเลิกการแชร์
    }
  }

  const playing = phase === 'countdown' || phase === 'playing'

  return (
    <div className="mx-auto max-w-5xl">
      {/* HUD */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="chip text-base">
          {p.score}: <b className="font-display">{hud.score.toLocaleString()}</b>
        </span>
        <span className={`chip text-base ${hud.combo >= 5 ? '!bg-mustard' : ''}`}>
          {p.combo}: <b className="font-display">x{hud.combo}</b>
        </span>
        <span className="chip text-base">
          {p.best}: <b className="font-display">{best.toLocaleString()}</b>
        </span>
        <button onClick={toggleMute} className="chip ml-auto text-base hover:!bg-mustard/50">
          {muted ? `🔇 ${p.unmute}` : `🔊 ${p.mute}`}
        </button>
      </div>
      <div className="mb-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-card">
        <div
          className={`h-full transition-[width] duration-100 ${hud.time < 5 ? 'bg-red' : 'bg-teal'}`}
          style={{ width: `${(hud.time / ROUND) * 100}%` }}
        />
      </div>

      <div ref={wrapRef} className="screen relative h-[64svh] min-h-[380px] touch-none select-none md:h-auto md:aspect-[16/9]">
        <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${playing ? 'cursor-none' : ''}`} />

        {phase === 'idle' && (
          <div className="absolute inset-0 flex overflow-y-auto p-3">
            <div className="card m-auto w-full max-w-md -rotate-1 p-5 text-center">
              <p className="text-5xl">🎯</p>
              <h2 className="mt-2 text-3xl font-bold">{p.title}</h2>
              <ul className="mt-3 space-y-1 text-left text-ink-soft">
                {p.howTo.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
              <p className="mt-4 mb-2 font-display font-semibold">{p.difficulty}</p>
              <DifficultyPicker value={difficulty} onChange={setDifficulty} labels={p} />
              <button onClick={start} className="btn mt-5 w-full text-lg">
                {p.start}
              </button>
            </div>
          </div>
        )}

        {phase === 'over' && result && rank && (
          <div className="absolute inset-0 flex animate-fade-in overflow-y-auto bg-ink/50 p-3">
            <div className="card m-auto w-full max-w-md rotate-1 p-4 text-center sm:p-5">
              {newBest && <p className="hand -rotate-2 text-2xl">{p.newBest}</p>}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-2 p-3">
                <div className="text-left">
                  <p className="text-sm text-ink-soft">{p.score}</p>
                  <p className="font-display text-4xl leading-none font-bold">{result.score.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                {rank.icon && <img src={rank.icon} alt="" className="h-12 w-12 object-contain" />}
                  <div className="text-left">
                    <p className="text-xs text-ink-soft">{p.rankResult}</p>
                    <p className="font-display text-xl font-bold">{rank.name}</p>
                  </div>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-4">
                {[
                  [p.accuracy, `${accuracy}%`],
                  [p.headshots, result.headshots],
                  [p.combo, `x${result.bestCombo}`],
                  [p.reaction, `${result.reaction} ms`],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-lg border-2 border-line px-2.5 py-1.5">
                    <dt className="truncate text-xs text-ink-soft">{k}</dt>
                    <dd className="font-display text-lg font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                <DifficultyPicker value={difficulty} onChange={setDifficulty} labels={p} />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={start} className="btn flex-1">
                  {p.again}
                </button>
                <button onClick={shareScore} className="btn btn-paper flex-1">
                  {copied ? t.share.copied : p.shareScore}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DifficultyPicker({
  value,
  onChange,
  labels,
}: {
  value: Difficulty
  onChange: (d: Difficulty) => void
  labels: { easy: string; normal: string; hard: string }
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border-2 border-ink">
      {(['easy', 'normal', 'hard'] as const).map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          aria-pressed={value === d}
          className={`flex-1 py-2 font-display font-semibold ${value === d ? 'bg-ink text-paper' : 'bg-card hover:bg-mustard/40'}`}
        >
          {labels[d]}
        </button>
      ))}
    </div>
  )
}
