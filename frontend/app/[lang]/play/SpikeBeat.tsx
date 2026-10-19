'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useI18n } from '@/components/LangProvider'

type Stage = 'easy' | 'normal' | 'hard'
type Phase = 'idle' | 'countdown' | 'playing' | 'over'
type Dir = 'W' | 'A' | 'S' | 'D'
type Judge = 'perfect' | 'great' | 'good' | 'miss'

export interface BeatRank {
  name: string
  icon: string | null
  color: string
}
export interface BeatAgent {
  name: string
  image: string | null
  color: string
}

// bpm = ความเร็วเสียงบี๊บ, min/max = ความยาวชุดปุ่มรอบแรก→รอบสุดท้าย, flip = โอกาสเจอปุ่มแดง, cap = แรงค์สูงสุดที่ไปถึงได้
const STAGES: Record<Stage, { bpm: number; min: number; max: number; flip: number; cap: number }> = {
  easy: { bpm: 84, min: 3, max: 5, flip: 0, cap: 0.6 },
  normal: { bpm: 104, min: 4, max: 6, flip: 0.12, cap: 0.8 },
  hard: { bpm: 128, min: 5, max: 7, flip: 0.25, cap: 1 },
}
const ROUNDS = 16
const BEATS = 4 // จังหวะต่อรอบ (นับถอยหลังก็ 4 จังหวะ)
const TARGET = 3 // ต้องกด Space ตอนจังหวะที่ 3 ส่วนจังหวะสุดท้ายพักไว้โชว์ผล
const TARGET_X = 80 // วงกลมอยู่ที่ 80% ของราง
const WINDOW = { perfect: 55, great: 110, good: 190 } // ms
const BASE: Record<Judge, number> = { perfect: 1000, great: 700, good: 400, miss: 0 }
const KEYS: Dir[] = ['W', 'A', 'S', 'D']
const OPPOSITE: Record<Dir, Dir> = { W: 'S', S: 'W', A: 'D', D: 'A' }
const KEY_MAP: Record<string, Dir> = { w: 'W', a: 'A', s: 'S', d: 'D', arrowup: 'W', arrowleft: 'A', arrowdown: 'S', arrowright: 'D' }
const ARROW: Record<Dir, string> = { W: '↑', A: '←', S: '↓', D: '→' }
const PITCH: Record<Dir, number> = { W: 1.12, A: 0.94, S: 0.86, D: 1.02 }
const FALLBACK_RANKS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

// ---------- best score (localStorage) ----------
const BEST_EVENT = 'spikebeat-best'
const bestKey = (s: Stage) => `spikebeat:best:${s}`
function readBest(s: Stage) {
  try {
    return Number(localStorage.getItem(bestKey(s)) ?? 0) || 0
  } catch {
    return 0
  }
}
function writeBest(s: Stage, score: number) {
  try {
    localStorage.setItem(bestKey(s), String(score))
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

// ---------- เสียงต๊อก ๆ แบบคีย์บอร์ดครีมมี่ (สร้างเองด้วย WebAudio ไม่มีไฟล์เพลง) ----------
function makeSound() {
  let ctx: AudioContext | null = null
  let noise: AudioBuffer | null = null
  let muted = false

  const ready = () => {
    if (muted) return null
    ctx ??= new AudioContext()
    if (!noise) {
      const len = Math.floor(ctx.sampleRate * 0.08)
      noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
    }
    return ctx
  }
  const env = (c: AudioContext, at: number, peak: number, dur: number) => {
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    g.connect(c.destination)
    return g
  }
  const tone = (c: AudioContext, at: number, type: OscillatorType, from: number, to: number, peak: number, dur: number) => {
    const o = c.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(from, at)
    o.frequency.exponentialRampToValueAtTime(to, at + dur)
    o.connect(env(c, at, peak, dur))
    o.start(at)
    o.stop(at + dur + 0.02)
  }
  const hiss = (c: AudioContext, at: number, cutoff: number, peak: number, dur: number) => {
    const n = c.createBufferSource()
    n.buffer = noise
    const f = c.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = cutoff
    n.connect(f).connect(env(c, at, peak, dur))
    n.start(at)
    n.stop(at + dur + 0.02)
  }

  return {
    unlock: () => {
      ctx ??= new AudioContext()
      void ctx.resume()
    },
    setMuted: (m: boolean) => (muted = m),
    /** ต๊อก — ตัวเสียงทุ้มสั้น + เสียงกระทบนุ่ม ๆ */
    thock: (pitch = 1) => {
      const c = ready()
      if (!c) return
      tone(c, c.currentTime, 'sine', 230 * pitch, 110 * pitch, 0.32, 0.09)
      hiss(c, c.currentTime, 1900 * pitch, 0.16, 0.045)
    },
    /** ปึก — กดผิด */
    thud: () => {
      const c = ready()
      if (!c) return
      tone(c, c.currentTime, 'sine', 95, 48, 0.4, 0.17)
      hiss(c, c.currentTime, 420, 0.2, 0.08)
    },
    /** ป๊อก — PERFECT */
    pop: () => {
      const c = ready()
      if (!c) return
      tone(c, c.currentTime, 'sine', 760, 1400, 0.16, 0.07)
      tone(c, c.currentTime + 0.05, 'triangle', 1400, 1900, 0.06, 0.09)
    },
    /** บี๊บของ spike — บอกจังหวะ */
    beep: (accent: boolean) => {
      const c = ready()
      if (!c) return
      tone(c, c.currentTime, 'sine', accent ? 1900 : 1450, accent ? 1880 : 1440, accent ? 0.07 : 0.04, 0.06)
    },
  }
}

// ---------- สร้างโจทย์ + คิดคะแนน ----------
interface Round {
  seq: Dir[]
  flips: boolean[]
}
function buildRounds(stage: Stage): Round[] {
  const s = STAGES[stage]
  return Array.from({ length: ROUNDS }, (_, i) => {
    const len = Math.round(s.min + ((s.max - s.min) * i) / (ROUNDS - 1))
    const seq = Array.from({ length: len }, () => KEYS[Math.floor(Math.random() * KEYS.length)])
    // ปุ่มแดงเริ่มโผล่หลังรอบที่ 3 ให้ได้ตั้งตัวก่อน
    return { seq, flips: seq.map(() => i >= 3 && Math.random() < s.flip) }
  })
}
const roundScore = (judge: Judge, len: number, combo: number) => Math.round(BASE[judge] * (0.6 + len * 0.1) * (1 + Math.min(combo, 20) * 0.05))

interface Game {
  stage: Stage
  beatMs: number
  t0: number
  rounds: Round[]
  round: number
  pos: number
  resolved: boolean
  started: boolean
  lastTick: number
  score: number
  combo: number
  maxCombo: number
  counts: Record<Judge, number>
  maxScore: number
}
interface View {
  round: number
  seq: Dir[]
  flips: boolean[]
  pos: number
  judge: { kind: Judge; id: number } | null
  score: number
  combo: number
  count: number | null
  wrong: number
}
interface Result {
  score: number
  counts: Record<Judge, number>
  maxCombo: number
  accuracy: number
  ratio: number
}
const EMPTY_VIEW: View = { round: -1, seq: [], flips: [], pos: 0, judge: null, score: 0, combo: 0, count: null, wrong: 0 }
const targetAt = (g: Game, round: number) => g.t0 + (BEATS + round * BEATS + TARGET) * g.beatMs

export default function SpikeBeat({ ranks, agents }: { ranks: BeatRank[]; agents: Partial<Record<Stage, BeatAgent>> }) {
  const { lang, t } = useI18n()
  const b = t.beat
  const game = useRef<Game | null>(null)
  const sound = useRef<ReturnType<typeof makeSound> | null>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<HTMLDivElement>(null)
  const judgeSeq = useRef(0)

  const [stage, setStage] = useState<Stage>('normal')
  const [phase, setPhase] = useState<Phase>('idle')
  const [view, setView] = useState<View>(EMPTY_VIEW)
  const [result, setResult] = useState<Result | null>(null)
  const [newBest, setNewBest] = useState(false)
  const [muted, setMuted] = useState(false)
  const [copied, setCopied] = useState(false)

  const best = useSyncExternalStore(subscribeBest, () => readBest(stage), () => 0)
  const agent = agents[stage]
  const rankList: BeatRank[] = ranks.length ? ranks : FALLBACK_RANKS.map((name) => ({ name, icon: null, color: '#1d1f24' }))

  const judge = useCallback((kind: Judge) => {
    const g = game.current
    if (!g || g.resolved || g.round < 0) return
    g.resolved = true
    if (kind === 'miss') {
      g.combo = 0
      sound.current?.thud()
    } else {
      g.combo += 1
      g.maxCombo = Math.max(g.maxCombo, g.combo)
      g.score += roundScore(kind, g.rounds[g.round].seq.length, g.combo)
      if (kind === 'perfect') sound.current?.pop()
      else sound.current?.thock(0.75)
    }
    g.counts[kind] += 1
    judgeSeq.current += 1
    const id = judgeSeq.current
    setView((v) => ({ ...v, judge: { kind, id }, score: g.score, combo: g.combo }))
  }, [])

  const finish = useCallback(() => {
    const g = game.current
    if (!g) return
    game.current = null
    const c = g.counts
    const accuracy = Math.round(((c.perfect + c.great * 0.7 + c.good * 0.4) / ROUNDS) * 100)
    setNewBest(g.score > 0 && g.score > readBest(g.stage))
    if (g.score > readBest(g.stage)) writeBest(g.stage, g.score)
    setResult({ score: g.score, counts: { ...c }, maxCombo: g.maxCombo, accuracy, ratio: (g.score / g.maxScore) * STAGES[g.stage].cap })
    setPhase('over')
  }, [])

  // รับปุ่มทั้งจากคีย์บอร์ดและปุ่มบนจอ (time = timestamp ของ event ให้ตัดสินจังหวะแม่นขึ้น)
  const press = useCallback(
    (key: Dir | 'SPACE', time: number) => {
      const g = game.current
      if (!g || g.round < 0 || g.resolved) return
      const r = g.rounds[g.round]
      if (key === 'SPACE') {
        const dt = time - targetAt(g, g.round)
        if (dt < -WINDOW.good * 2) return // กดเร็วไปมาก ไม่นับ
        if (g.pos < r.seq.length) return judge('miss')
        const a = Math.abs(dt)
        return judge(a <= WINDOW.perfect ? 'perfect' : a <= WINDOW.great ? 'great' : a <= WINDOW.good ? 'good' : 'miss')
      }
      if (g.pos >= r.seq.length) return
      const need = r.flips[g.pos] ? OPPOSITE[r.seq[g.pos]] : r.seq[g.pos]
      if (key === need) {
        g.pos += 1
        sound.current?.thock(PITCH[key])
        setView((v) => ({ ...v, pos: g.pos }))
      } else {
        // กดผิด = ชุดนี้เริ่มนับใหม่ (แบบ Audition)
        g.pos = 0
        sound.current?.thud()
        setView((v) => ({ ...v, pos: 0, wrong: v.wrong + 1 }))
      }
    },
    [judge],
  )

  // ---------- game loop ----------
  useEffect(() => {
    if (phase !== 'countdown' && phase !== 'playing') return
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const g = game.current
      if (!g) return
      const now = performance.now()
      const beats = (now - g.t0) / g.beatMs

      // บี๊บทุกจังหวะ (4 รอบสุดท้ายบี๊บถี่ขึ้นเท่าตัว เหมือน spike ใกล้ระเบิด)
      const tick = Math.floor(beats * 2)
      if (beats >= 0 && tick > g.lastTick) {
        g.lastTick = tick
        const beat = tick / 2
        const onBeat = tick % 2 === 0
        if (onBeat || (beats >= BEATS && g.round >= ROUNDS - 4)) sound.current?.beep(onBeat && beat >= BEATS && beat % BEATS === TARGET)
        if (onBeat && beat < BEATS) setView((v) => ({ ...v, count: BEATS - 1 - beat }))
      }

      if (beats >= BEATS) {
        if (!g.started) {
          g.started = true
          setPhase('playing')
          setView((v) => ({ ...v, count: null }))
        }
        const r = Math.floor((beats - BEATS) / BEATS)
        if (r !== g.round) {
          if (!g.resolved) judge('miss')
          if (r >= ROUNDS) return finish()
          g.round = r
          g.pos = 0
          g.resolved = false
          const next = g.rounds[r]
          setView((v) => ({ ...v, round: r, seq: next.seq, flips: next.flips, pos: 0, judge: null }))
        }
        if (!g.resolved && now > targetAt(g, r) + WINDOW.good + 30) judge('miss')
        const into = beats - BEATS - r * BEATS
        if (lineRef.current) lineRef.current.style.left = `${Math.min(100, (into / TARGET) * TARGET_X)}%`
      } else if (lineRef.current) lineRef.current.style.left = '0%'

      // เอเจนต์เด้งตามจังหวะ
      if (agentRef.current && beats >= 0) {
        const k = Math.abs(Math.sin(Math.PI * (beats % 1)))
        agentRef.current.style.transform = `translateY(${(-k * 12).toFixed(1)}px) scale(${(1 + (1 - k) * 0.03).toFixed(3)}, ${(1 - (1 - k) * 0.03).toFixed(3)})`
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase, judge, finish])

  // ---------- keyboard ----------
  useEffect(() => {
    if (phase !== 'countdown' && phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const dir = KEY_MAP[k]
      if (k !== ' ' && !dir) return
      e.preventDefault() // กัน space/ลูกศรเลื่อนหน้า
      if (e.repeat) return
      press(dir ?? 'SPACE', e.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, press])

  const start = () => {
    sound.current ??= makeSound()
    sound.current.setMuted(muted)
    sound.current.unlock()
    const s = STAGES[stage]
    const rounds = buildRounds(stage)
    game.current = {
      stage,
      beatMs: 60000 / s.bpm,
      t0: performance.now() + 400,
      rounds,
      round: -1,
      pos: 0,
      resolved: true,
      started: false,
      lastTick: -1,
      score: 0,
      combo: 0,
      maxCombo: 0,
      counts: { perfect: 0, great: 0, good: 0, miss: 0 },
      maxScore: rounds.reduce((sum, r, i) => sum + roundScore('perfect', r.seq.length, i + 1), 0),
    }
    setResult(null)
    setView(EMPTY_VIEW)
    setPhase('countdown')
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    sound.current?.setMuted(next)
  }

  const rank = result ? rankList[Math.max(0, Math.min(rankList.length - 1, Math.floor(result.ratio * (rankList.length - 1) + 0.0001)))] : null

  const shareScore = async () => {
    if (!result || !rank) return
    const text = b.shareText(result.score, rank.name)
    const url = `${window.location.origin}/${lang}/play/beat`
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
  const judgeColor: Record<Judge, string> = { perfect: 'text-mustard', great: 'text-teal', good: 'text-paper', miss: 'text-red' }

  return (
    <div className="mx-auto max-w-5xl">
      {/* HUD */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="chip text-base">
          {b.score}: <b className="font-display">{view.score.toLocaleString()}</b>
        </span>
        <span className={`chip text-base ${view.combo >= 5 ? '!bg-mustard' : ''}`}>
          {b.combo}: <b className="font-display">x{view.combo}</b>
        </span>
        <span className="chip text-base">
          {b.round}: <b className="font-display">{Math.max(0, view.round + 1)}/{ROUNDS}</b>
        </span>
        <span className="chip text-base">
          {b.best}: <b className="font-display">{best.toLocaleString()}</b>
        </span>
        <button onClick={toggleMute} className="chip ml-auto text-base hover:!bg-mustard/50">
          {muted ? `🔇 ${b.unmute}` : `🔊 ${b.mute}`}
        </button>
      </div>

      <div
        className="screen relative h-[58svh] min-h-[400px] touch-none select-none md:h-auto md:aspect-[16/9]"
        style={agent ? { background: `radial-gradient(ellipse at 75% 45%, ${agent.color}55, transparent 60%), radial-gradient(ellipse at 50% 35%, #30343e, var(--color-night) 70%)` } : undefined}
      >
        {/* เอเจนต์ประจำด่าน เด้งตามบี๊บ */}
        {agent?.image && (
          <div ref={agentRef} className="pointer-events-none absolute right-[-6%] bottom-0 h-[92%] origin-bottom opacity-80 max-md:opacity-35 md:right-[2%]">
            <img src={agent.image} alt="" className="h-full w-auto object-contain object-bottom" />
          </div>
        )}

        <div className="relative flex h-full flex-col items-center justify-center px-4 md:pr-[30%]">
          {/* ผลการกด */}
          <div className="flex h-16 items-center">
            {view.judge && (
              <p key={view.judge.id} className={`animate-judge font-display text-5xl font-bold drop-shadow-[3px_3px_0_var(--color-ink)] ${judgeColor[view.judge.kind]}`}>
                {b[view.judge.kind]}
                {view.judge.kind !== 'miss' && view.combo > 1 && <span className="ml-2 text-2xl text-paper">x{view.combo}</span>}
              </p>
            )}
          </div>

          {/* ชุดปุ่ม */}
          <div key={view.wrong} className={`mt-2 flex min-h-16 flex-wrap justify-center gap-2 sm:gap-2.5 ${view.wrong ? 'animate-shake' : ''}`}>
            {view.seq.map((d, i) => (
              <Keycap key={`${view.round}-${i}`} dir={d} flip={view.flips[i]} state={i < view.pos ? 'done' : i === view.pos && !view.judge ? 'next' : 'todo'} />
            ))}
          </div>
          {view.flips.some(Boolean) && <p className="mt-2 text-sm text-red">{b.flipHint}</p>}

          {/* ราง + วงกลมเป้าหมาย */}
          <div className="relative mt-7 h-12 w-full max-w-xl">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-paper/15" />
            {Array.from({ length: TARGET }, (_, i) => (
              <span key={i} className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-paper/30" style={{ left: `${(i / TARGET) * TARGET_X}%` }} />
            ))}
            <span
              className={`absolute top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${
                view.seq.length && view.pos >= view.seq.length && !view.judge ? 'border-teal bg-teal/20' : 'border-mustard'
              }`}
              style={{ left: `${TARGET_X}%` }}
            />
            <div ref={lineRef} className="absolute top-0 left-0 h-12 w-1.5 -translate-x-1/2 rounded-full bg-red shadow-[0_0_10px_var(--color-red)]" />
          </div>
        </div>

        {/* นับถอยหลัง */}
        {view.count !== null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p key={view.count} className="animate-judge font-display text-8xl font-bold text-paper drop-shadow-[4px_4px_0_var(--color-ink)]">
              {view.count > 0 ? view.count : b.go}
            </p>
          </div>
        )}

        {phase === 'idle' && (
          <div className="absolute inset-0 flex overflow-y-auto p-3">
            <div className="card m-auto w-full max-w-md -rotate-1 p-5 text-center">
              <p className="text-5xl">🎹</p>
              <h2 className="mt-2 text-3xl font-bold">{b.title}</h2>
              <ul className="mt-3 space-y-1 text-left text-ink-soft">
                {b.howTo.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
              <p className="mt-4 mb-2 font-display font-semibold">{b.stage}</p>
              <StagePicker value={stage} onChange={setStage} labels={b.stages} agents={agents} />
              <button onClick={start} className="btn mt-5 w-full text-lg">
                {b.start}
              </button>
            </div>
          </div>
        )}

        {phase === 'over' && result && rank && (
          <div className="absolute inset-0 flex animate-fade-in overflow-y-auto bg-ink/50 p-3">
            <div className="card m-auto w-full max-w-md rotate-1 p-4 text-center sm:p-5">
              {newBest && <p className="hand -rotate-2 text-2xl">{b.newBest}</p>}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-2 p-3">
                <div className="text-left">
                  <p className="text-sm text-ink-soft">{b.score}</p>
                  <p className="font-display text-4xl leading-none font-bold">{result.score.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {rank.icon && <img src={rank.icon} alt="" className="h-12 w-12 object-contain" />}
                  <div className="text-left">
                    <p className="text-xs text-ink-soft">{b.rankResult}</p>
                    <p className="font-display text-xl font-bold">{rank.name}</p>
                  </div>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-4 gap-2 text-left text-sm">
                {(['perfect', 'great', 'good', 'miss'] as const).map((k) => (
                  <div key={k} className="rounded-lg border-2 border-line px-2 py-1.5">
                    <dt className="truncate text-[11px] text-ink-soft">{b[k]}</dt>
                    <dd className="font-display text-lg font-bold">{result.counts[k]}</dd>
                  </div>
                ))}
              </dl>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-left text-sm">
                {[
                  [b.accuracy, `${result.accuracy}%`],
                  [b.maxCombo, `x${result.maxCombo}`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border-2 border-line px-2.5 py-1.5">
                    <dt className="truncate text-xs text-ink-soft">{k}</dt>
                    <dd className="font-display text-lg font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                <StagePicker value={stage} onChange={setStage} labels={b.stages} agents={agents} />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={start} className="btn flex-1">
                  {b.again}
                </button>
                <button onClick={shareScore} className="btn btn-paper flex-1">
                  {copied ? t.share.copied : b.shareScore}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ปุ่มบนจอ สำหรับจอสัมผัส */}
      <div className={`mx-auto mt-4 hidden max-w-xs touch-none grid-cols-3 gap-2 select-none max-lg:grid pointer-coarse:grid ${playing ? '' : 'opacity-50'}`}>
        <span />
        <PadKey dir="W" onPress={press} />
        <span />
        <PadKey dir="A" onPress={press} />
        <PadKey dir="S" onPress={press} />
        <PadKey dir="D" onPress={press} />
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            press('SPACE', e.timeStamp)
          }}
          className="col-span-3 h-14 rounded-xl border-2 border-ink bg-red font-display text-lg font-bold text-white shadow-[0_5px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_1px_0_var(--color-ink)]"
        >
          {b.space}
        </button>
      </div>
    </div>
  )
}

function Keycap({ dir, flip, state }: { dir: Dir; flip: boolean; state: 'done' | 'next' | 'todo' }) {
  const face = state === 'done' ? 'translate-y-1 bg-teal text-ink shadow-[0_1px_0_var(--color-ink)]' : flip ? 'bg-red text-white shadow-[0_5px_0_var(--color-ink)]' : 'bg-paper text-ink shadow-[0_5px_0_var(--color-ink)]'
  return (
    <span
      className={`flex h-14 w-12 flex-col items-center justify-center rounded-lg border-2 border-ink font-display text-2xl leading-none font-bold transition-all duration-75 sm:h-16 sm:w-14 ${face} ${
        state === 'next' ? 'outline-4 outline-offset-2 outline-mustard' : ''
      }`}
    >
      {dir}
      <span className="mt-0.5 text-xs opacity-70">{ARROW[dir]}</span>
    </span>
  )
}

function PadKey({ dir, onPress }: { dir: Dir; onPress: (d: Dir, time: number) => void }) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault()
        onPress(dir, e.timeStamp)
      }}
      aria-label={dir}
      className="flex h-16 flex-col items-center justify-center rounded-xl border-2 border-ink bg-paper font-display text-2xl leading-none font-bold shadow-[0_5px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_1px_0_var(--color-ink)]"
    >
      {dir}
      <span className="text-xs opacity-60">{ARROW[dir]}</span>
    </button>
  )
}

function StagePicker({
  value,
  onChange,
  labels,
  agents,
}: {
  value: Stage
  onChange: (s: Stage) => void
  labels: Record<Stage, string>
  agents: Partial<Record<Stage, BeatAgent>>
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border-2 border-ink">
      {(['easy', 'normal', 'hard'] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          aria-pressed={value === s}
          className={`flex-1 py-1.5 font-display leading-tight font-semibold ${value === s ? 'bg-ink text-paper' : 'bg-card hover:bg-mustard/40'}`}
        >
          {labels[s]}
          {agents[s] && <span className="block text-xs font-normal opacity-75">{agents[s].name} · {STAGES[s].bpm} bpm</span>}
        </button>
      ))}
    </div>
  )
}
