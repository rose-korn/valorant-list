'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/components/LangProvider'
import { withProxyFallback } from '@/lib/media'

export interface ShareAgent {
  uuid: string
  name: string
  role: string
  icon: string
  portrait: string
  colors: string[]
}

const W = 1080
const H = 1350

const STYLES = [
  { key: 'red', bg: '#ff4654', fg: '#1d1f24' },
  { key: 'ink', bg: '#1d1f24', fg: '#f4efe6' },
  { key: 'mustard', bg: '#f2b84b', fg: '#1d1f24' },
  { key: 'teal', bg: '#2bb5a0', fg: '#1d1f24' },
  { key: 'pink', bg: '#ffd3d6', fg: '#1d1f24' },
] as const

// clean = รูปโหลดแบบ CORS ผ่าน → วาดลง canvas แล้วยัง export เป็น PNG ได้
type Loaded = { img: HTMLImageElement; clean: boolean }
const imageCache = new Map<string, Promise<Loaded | null>>()

function loadOne(src: string, cors = true) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * โหลดรูปเอเจนท์: ตรงแบบ CORS → ผ่าน proxy /api/media → สุดท้ายโหลดแบบธรรมดา
 * (ทางสุดท้ายรูปขึ้นในพรีวิวแน่ ๆ แต่ทำให้ canvas export ไม่ได้ ตอนกดเซฟจะวาดใหม่แบบไม่มีรูปแทน)
 */
function loadImage(src: string) {
  let p = imageCache.get(src)
  if (!p) {
    p = withProxyFallback(src, (u) => loadOne(u))
      .then((img): Loaded => ({ img, clean: true }))
      .catch(() => loadOne(src, false).then((img): Loaded => ({ img, clean: false })))
      .catch(() => null)
    imageCache.set(src, p)
  }
  return p
}

function cssFont(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** ตัดบรรทัดตามความกว้าง รองรับภาษาไทย (ไม่มีช่องว่าง) ด้วย Intl.Segmenter */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lang: string) {
  const seg = new Intl.Segmenter(lang, { granularity: 'word' })
  const words = [...seg.segment(text)].map((s) => s.segment)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line + word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim())
      line = word.trimStart()
    } else line = test
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function tape(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.fillRect(-80, -22, 160, 44)
  ctx.restore()
}

async function drawCard(
  canvas: HTMLCanvasElement,
  opts: { agent: ShareAgent; quote: string; player: string; style: (typeof STYLES)[number]; label: string; footer: string; lang: string },
  isStale: () => boolean,
  cleanOnly = false,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // โหลดของให้ครบก่อนแล้วค่อยวาดรวดเดียว กันการวาดเก่าทับของใหม่
  const [, loaded] = await Promise.all([document.fonts?.ready, loadImage(opts.agent.portrait)])
  if (isStale()) return
  const img = loaded && (loaded.clean || !cleanOnly) ? loaded.img : null
  const display = cssFont('--font-chakra', 'sans-serif')
  const hand = cssFont('--font-itim', 'cursive')
  const ink = '#1d1f24'
  const { agent, style } = opts

  // พื้นหลัง + จุดลายกระดาษ
  ctx.fillStyle = style.bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = style.key === 'ink' ? 'rgba(255,255,255,.07)' : 'rgba(29,31,36,.08)'
  for (let y = 20; y < H; y += 36) for (let x = 20; x < W; x += 36) ctx.fillRect(x, y, 4, 4)

  // การ์ดกระดาษ + เงาปั๊ม
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.rotate(-0.015)
  ctx.translate(-W / 2, -H / 2)
  roundRect(ctx, 74, 84, 952, 1210, 36)
  ctx.fillStyle = ink
  ctx.fill()
  roundRect(ctx, 60, 64, 952, 1210, 36)
  ctx.fillStyle = '#fffdf8'
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = ink
  ctx.stroke()

  // ช่องรูปเอเจนท์
  const px = 96
  const py = 100
  const pw = 880
  const ph = 760
  ctx.save()
  roundRect(ctx, px, py, pw, ph, 24)
  ctx.clip()
  const grad = ctx.createLinearGradient(px, py, px + pw, py + ph)
  grad.addColorStop(0, agent.colors[0] ?? '#ff4654')
  grad.addColorStop(1, agent.colors[2] ?? agent.colors[1] ?? '#1d1f24')
  ctx.fillStyle = grad
  ctx.fillRect(px, py, pw, ph)
  if (img) {
    // cover โดยเน้นส่วนบน (หน้า)
    const scale = Math.max(pw / img.width, ph / img.height) * 1.25
    const iw = img.width * scale
    const ih = img.height * scale
    ctx.drawImage(img, px + (pw - iw) / 2, py - ih * 0.04, iw, ih)
  }
  const shade = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph)
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,.55)')
  ctx.fillStyle = shade
  ctx.fillRect(px, py, pw, ph)
  ctx.restore()
  roundRect(ctx, px, py, pw, ph, 24)
  ctx.lineWidth = 6
  ctx.strokeStyle = ink
  ctx.stroke()

  // ชื่อเอเจนท์ตัวใหญ่
  ctx.font = `700 150px ${display}`
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  let size = 150
  while (ctx.measureText(agent.name).width > pw - 80 && size > 70) {
    size -= 8
    ctx.font = `700 ${size}px ${display}`
  }
  ctx.lineWidth = 16
  ctx.strokeStyle = ink
  ctx.strokeText(agent.name, px + 36, py + ph - 70)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(agent.name, px + 36, py + ph - 70)
  ctx.font = `600 38px ${display}`
  ctx.fillStyle = 'rgba(255,255,255,.9)'
  ctx.fillText(agent.role, px + 40, py + ph - 26)

  // ป้าย "เมนหลักของฉัน"
  ctx.save()
  ctx.translate(px + 40, py + 40)
  ctx.rotate(-0.06)
  ctx.font = `700 40px ${display}`
  const lw = ctx.measureText(opts.label).width + 48
  roundRect(ctx, 0, 0, lw, 70, 35)
  ctx.fillStyle = '#f2b84b'
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = ink
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.fillText(opts.label, 24, 50)
  ctx.restore()

  // แคปชั่น (ลายมือ)
  ctx.font = `400 58px ${hand}`
  const lines = wrap(ctx, opts.quote, 820, opts.lang).slice(0, 3)
  ctx.fillStyle = ink
  const qy = 960 - (lines.length - 1) * 30
  lines.forEach((l, i) => ctx.fillText(l, 110, qy + i * 70))
  ctx.font = `400 120px ${hand}`
  ctx.fillStyle = '#ff4654'
  ctx.fillText('“', 60, 960)

  // ชื่อผู้เล่น
  if (opts.player.trim()) {
    ctx.font = `600 46px ${display}`
    ctx.fillStyle = '#d6323f'
    ctx.fillText(`— ${opts.player.trim()}`, 110, 1180)
  }

  // ท้ายการ์ด
  ctx.font = `600 28px ${display}`
  ctx.fillStyle = '#555a63'
  ctx.textAlign = 'right'
  ctx.fillText(opts.footer, 980, 1240)
  ctx.textAlign = 'left'
  ctx.restore()

  tape(ctx, 230, 70, -0.08, 'rgba(242,184,75,.75)')
  tape(ctx, 860, 78, 0.07, 'rgba(43,181,160,.6)')
}

export default function ShareCardMaker({ agents }: { agents: ShareAgent[] }) {
  const { lang, t } = useI18n()
  const s = t.share
  const params = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [agentId, setAgentId] = useState(() => {
    const a = params.get('a')
    return agents.some((x) => x.uuid === a) ? a! : agents[0].uuid
  })
  const [quoteIdx, setQuoteIdx] = useState(() => {
    const q = Number(params.get('q'))
    return Number.isInteger(q) && q >= 0 && q < s.quotes.length ? q : 0
  })
  const [custom, setCustom] = useState(() => (params.get('c') ?? '').slice(0, 80))
  const [player, setPlayer] = useState(() => (params.get('n') ?? '').slice(0, 24))
  const [styleKey, setStyleKey] = useState(() => {
    const k = params.get('s')
    return STYLES.some((x) => x.key === k) ? k! : 'red'
  })
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const agent = agents.find((a) => a.uuid === agentId) ?? agents[0]
  const style = STYLES.find((x) => x.key === styleKey) ?? STYLES[0]
  const quoteFor = (i: number) => s.quotes[i].replace('{agent}', agent.name)
  const quote = custom.trim() || quoteFor(quoteIdx)
  const fileName = `valolist-${agent.name.toLowerCase()}.png`

  const shareUrl = useMemo(() => {
    const q = new URLSearchParams({ a: agent.uuid, q: String(quoteIdx), s: styleKey })
    if (player.trim()) q.set('n', player.trim())
    if (custom.trim()) q.set('c', custom.trim())
    return `/${lang}/share?${q}`
  }, [lang, agent.uuid, quoteIdx, styleKey, player, custom])

  // วาดการ์ดใหม่ทุกครั้งที่ตัวเลือกเปลี่ยน
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let stale = false
    drawCard(canvas, { agent, quote, player, style, label: s.myMain, footer: `valolist · ${s.fanmade}`, lang }, () => stale)
    return () => {
      stale = true
    }
  }, [agent, quote, player, style, s.myMain, s.fanmade, lang])

  const cardOpts = { agent, quote, player, style, label: s.myMain, footer: `valolist · ${s.fanmade}`, lang }
  const toBlob = async () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const grab = (c: HTMLCanvasElement) => new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png'))
    try {
      return await grab(canvas)
    } catch {
      // รูปเอเจนท์มาแบบไม่มี CORS ทำให้ canvas นี้ export ไม่ได้ถาวร → วาดใบใหม่บน canvas ใหม่แบบไม่ใส่รูปนั้นแล้วเซฟแทน
      const fresh = document.createElement('canvas')
      fresh.width = W
      fresh.height = H
      await drawCard(fresh, cardOpts, () => false, true)
      return grab(fresh).catch(() => null)
    }
  }

  const download = async () => {
    setBusy(true)
    const blob = await toBlob()
    setBusy(false)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const share = async () => {
    setBusy(true)
    const blob = await toBlob()
    setBusy(false)
    const link = `${window.location.origin}${shareUrl}`
    const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${quote} #valolist`, url: link })
      } else if (navigator.share) {
        await navigator.share({ text: `${quote} #valolist`, url: link })
      } else {
        await download()
      }
    } catch {
      // ผู้ใช้กดยกเลิกการแชร์ — ไม่ต้องทำอะไร
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard ใช้ไม่ได้ (เช่น http) — เงียบไว้
    }
  }

  const randomize = () => {
    setAgentId(agents[Math.floor(Math.random() * agents.length)].uuid)
    setQuoteIdx(Math.floor(Math.random() * s.quotes.length))
    setCustom('')
    setStyleKey(STYLES[Math.floor(Math.random() * STYLES.length)].key)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* ตัวเลือก */}
      <div className="order-2 space-y-8 lg:order-1">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{s.step1}</h2>
            <button onClick={randomize} className="btn btn-paper !py-1.5 text-sm">
              {s.random}
            </button>
          </div>
          <div className="soft-scroll grid max-h-80 grid-cols-4 gap-2.5 overflow-y-auto p-2 sm:grid-cols-6 lg:grid-cols-7">
            {agents.map((a) => {
              const on = a.uuid === agent.uuid
              return (
                <button
                  key={a.uuid}
                  onClick={() => setAgentId(a.uuid)}
                  aria-pressed={on}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition-all ${
                    on ? '-translate-y-0.5 border-ink bg-mustard shadow-[2px_3px_0_var(--color-ink)]' : 'border-line bg-card hover:border-ink'
                  }`}
                >
                  <span className="aspect-square w-full overflow-hidden rounded-lg" style={{ background: a.colors[0] }}>
                    <img src={a.icon} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span className="w-full truncate text-center text-xs font-semibold text-ink">{a.name}</span>
                  {on && (
                    <span aria-hidden className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-red text-xs font-bold text-white">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">{s.step2}</h2>
          <input
            value={player}
            onChange={(e) => setPlayer(e.target.value.slice(0, 24))}
            placeholder={s.namePlaceholder}
            className="w-full rounded-xl border-2 border-ink bg-card px-4 py-2.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-mustard/60"
          />
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">{s.step3}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {s.quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuoteIdx(i)
                  setCustom('')
                }}
                aria-pressed={!custom.trim() && quoteIdx === i}
                className={`rounded-xl border-2 px-3 py-2 text-left transition-colors ${
                  !custom.trim() && quoteIdx === i ? 'border-ink bg-mustard' : 'border-line bg-card hover:border-ink'
                }`}
              >
                {quoteFor(i)}
              </button>
            ))}
          </div>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.slice(0, 80))}
            placeholder={s.custom}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-ink bg-card px-4 py-2.5 font-hand text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-mustard/60"
          />
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">{s.step4}</h2>
          <div className="flex gap-3">
            {STYLES.map((x) => (
              <button
                key={x.key}
                onClick={() => setStyleKey(x.key)}
                aria-label={x.key}
                aria-pressed={styleKey === x.key}
                className={`h-11 w-11 rounded-full border-2 border-ink transition-transform ${styleKey === x.key ? 'scale-110 ring-4 ring-ink/20' : 'hover:scale-105'}`}
                style={{ background: x.bg }}
              />
            ))}
          </div>
        </section>
      </div>

      {/* พรีวิว + ปุ่ม */}
      <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <canvas ref={canvasRef} width={W} height={H} className="mx-auto block w-full max-w-[420px] rounded-2xl" aria-label={`${agent.name} — ${quote}`} />
        <div className="mx-auto mt-4 flex max-w-[420px] flex-wrap gap-2">
          <button onClick={share} disabled={busy} className="btn flex-1">
            📤 {s.shareBtn}
          </button>
          <button onClick={download} disabled={busy} className="btn btn-paper flex-1">
            ⬇️ {s.download}
          </button>
          <button onClick={copyLink} className="btn btn-paper w-full">
            🔗 {copied ? s.copied : s.copyLink}
          </button>
        </div>
      </div>
    </div>
  )
}
