'use client'

// คลังของฉัน: ค้นสกินแล้วจดว่า "มีแล้ว" หรือ "อยากได้" (เก็บใน localStorage ผ่าน lib/locker.ts)
// แล้วทำเป็นการ์ดรูป 1080×1350 เซฟ/แชร์ได้ (วาดบน canvas ฝั่ง client ไม่ส่งข้อมูลไปไหน)

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from '@/components/Link'
import LockerToggle from '@/components/LockerToggle'
import { useI18n } from '@/components/LangProvider'
import { type Shelf, useLocker } from '@/lib/locker'
import { withProxyFallback } from '@/lib/media'

export interface LockerData {
  weapons: { uuid: string; name: string }[]
  /** ไอคอนระดับสกิน เรียงต่ำ → สูง */
  tiers: string[]
  skins: [uuid: string, name: string, weapon: number, image: string | null, tier: number][]
}

interface SkinRow {
  uuid: string
  name: string
  weaponUuid: string
  weaponName: string
  image: string
  tierIcon: string | null
  tier: number
}

const noop = () => () => {}
const SEARCH_LIMIT = 12

export default function MyLocker({ data }: { data: LockerData }) {
  const { t } = useI18n()
  const m = t.my
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const { locker, toggle, clear } = useLocker()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const map = new Map<string, SkinRow>()
    for (const [uuid, name, wi, img, ti] of data.skins) {
      const w = data.weapons[wi]
      map.set(uuid, {
        uuid,
        name,
        weaponUuid: w?.uuid ?? '',
        weaponName: w?.name ?? '',
        image: img ?? `https://media.valorant-api.com/weaponskins/${uuid}/displayicon.png`,
        tierIcon: data.tiers[ti] ?? null,
        tier: ti,
      })
    }
    return map
  }, [data])

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return []
    const out: SkinRow[] = []
    for (const r of rows.values()) {
      const hay = `${r.name} ${r.weaponName}`.toLowerCase()
      if (words.every((w) => hay.includes(w))) out.push(r)
      if (out.length >= SEARCH_LIMIT) break
    }
    return out
  }, [q, rows])

  const shelf = (s: Shelf) => (mounted ? locker[s].map((id) => rows.get(id)).filter((x): x is SkinRow => !!x) : [])
  const own = shelf('own')
  const want = shelf('want')

  return (
    <div className="space-y-10">
      {/* ค้นแล้วจด */}
      <section className="card p-4 sm:p-6">
        <h2 className="mb-3 font-display text-2xl font-bold">{m.addTitle}</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={m.search}
          aria-label={m.search}
          className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-lg outline-none focus:shadow-[3px_3px_0_var(--color-blue)]"
        />
        {q && (
          <ul className="mt-3 divide-y divide-line">
            {results.length === 0 && <li className="py-2 text-sm text-ink-soft">{t.common.noResult}</li>}
            {results.map((r) => (
              <li key={r.uuid} className="flex flex-wrap items-center gap-3 py-2">
                <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-md bg-night p-1">
                  <img src={r.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate py-0.5 leading-normal font-semibold">{r.name}</p>
                  <p className="text-xs text-ink-soft">{r.weaponName}</p>
                </div>
                <LockerToggle uuid={r.uuid} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ShelfGrid title={m.want} list={want} empty={m.emptyWant} onRemove={(id) => toggle('want', id)} onClear={() => clear('want')} accent="bg-red" />
      <ShelfGrid title={m.own} list={own} empty={m.emptyOwn} onRemove={(id) => toggle('own', id)} onClear={() => clear('own')} accent="bg-blue" />

      {(own.length > 0 || want.length > 0) && <CardMaker own={own} want={want} />}
    </div>
  )
}

function ShelfGrid({
  title,
  list,
  empty,
  onRemove,
  onClear,
  accent,
}: {
  title: string
  list: SkinRow[]
  empty: string
  onRemove: (uuid: string) => void
  onClear: () => void
  accent: string
}) {
  const { t } = useI18n()
  const m = t.my
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className={`h-3 w-3 rounded-full ${accent}`} aria-hidden />
          {title}
          <span className="font-mono text-sm font-normal text-ink-soft">{m.count(list.length)}</span>
        </h2>
        {list.length > 0 && (
          <button onClick={() => window.confirm(m.clearConfirm) && onClear()} className="text-sm text-ink-soft underline underline-offset-4 hover:text-red-ink">
            {m.clear}
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="hand text-lg text-ink-soft">{empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((r) => (
            <li key={r.uuid} className="card relative p-2">
              <Link href={`/weapons/${r.weaponUuid}?skin=${r.uuid}`} className="block">
                <div className="flex aspect-video items-center justify-center rounded-md bg-night p-2">
                  <img src={r.image} alt={r.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex items-center gap-1.5 px-0.5 pt-1.5">
                  {r.tierIcon && <img src={r.tierIcon} alt="" className="h-4 w-4 shrink-0" />}
                  <p className="truncate py-0.5 text-sm leading-normal font-semibold">{r.name}</p>
                </div>
              </Link>
              <button
                onClick={() => onRemove(r.uuid)}
                aria-label={`${m.remove}: ${r.name}`}
                title={m.remove}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-card text-sm font-bold hover:bg-pink"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ---------- การ์ดรูป ----------

const W = 1080
const H = 1350
const INK = '#1d1f24'

type Loaded = { img: HTMLImageElement; clean: boolean } | null
const imageCache = new Map<string, Promise<Loaded>>()

function loadOne(src: string, cors = true) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** โหลดแบบ CORS → ผ่าน proxy → ธรรมดา (แบบหลังสุดวาดได้แต่ export ไม่ได้) */
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

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text
  let s = text
  while (s.length > 1 && ctx.measureText(`${s}…`).width > max) s = s.slice(0, -1)
  return `${s}…`
}

type CardOpts = { own: SkinRow[]; want: SkinRow[]; show: 'both' | Shelf; title: string; labels: { own: string; want: string; more: (n: number) => string } }

async function drawLocker(canvas: HTMLCanvasElement, o: CardOpts, isStale: () => boolean, cleanOnly = false) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const sections = (o.show === 'both' ? (['want', 'own'] as const) : [o.show]).map((s) => ({ key: s, list: s === 'own' ? o.own : o.want })).filter((s) => s.list.length)
  // ส่วนเดียว = 6 แถว, สองส่วน = ส่วนละ 3 แถว (แถวละ 2 ช่อง)
  const rowsPer = sections.length > 1 ? 3 : 6
  const cap = rowsPer * 2
  const all = sections.flatMap((s) => s.list.slice(0, s.list.length > cap ? cap - 1 : cap))
  const [, ...loaded] = await Promise.all([document.fonts?.ready, ...all.map((r) => loadImage(r.image))])
  if (isStale()) return
  const imgOf = new Map(all.map((r, i) => [r.uuid, loaded[i]]))
  const display = cssFont('--font-kanit', 'sans-serif')
  const hand = cssFont('--font-itim', 'cursive')

  // พื้นกระดาษ + จุด
  ctx.fillStyle = '#efe8da'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(29,31,36,.07)'
  for (let y = 18; y < H; y += 36) for (let x = 18; x < W; x += 36) ctx.fillRect(x, y, 4, 4)

  // หัว
  ctx.fillStyle = '#3255a4'
  ctx.font = `700 26px ui-monospace, monospace`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('VALOLIST · MY LOCKER', 64, 84)
  ctx.fillStyle = INK
  ctx.font = `800 76px ${display}`
  ctx.fillText(fitText(ctx, o.title, W - 128), 64, 170)
  ctx.fillRect(64, 196, W - 128, 4)
  ctx.fillRect(64, 206, W - 128, 2)

  const colW = (W - 128 - 24) / 2
  const cellH = rowsPer === 6 ? 150 : 140
  let y = 240
  for (const s of sections) {
    const label = s.key === 'own' ? o.labels.own : o.labels.want
    ctx.fillStyle = s.key === 'own' ? '#3255a4' : '#ff4654'
    ctx.beginPath()
    ctx.arc(76, y + 22, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `700 40px ${display}`
    ctx.fillText(`${label} (${s.list.length})`, 100, y + 36)
    y += 62
    const extra = s.list.length > cap ? s.list.length - (cap - 1) : 0
    const items = s.list.slice(0, extra ? cap - 1 : cap)
    const cells = items.length + (extra ? 1 : 0)
    for (let i = 0; i < cells; i++) {
      const cx = 64 + (i % 2) * (colW + 24)
      const cy = y + Math.floor(i / 2) * (cellH + 18)
      ctx.beginPath()
      ctx.roundRect(cx, cy, colW, cellH, 18)
      ctx.fillStyle = '#1f2a5c'
      ctx.fill()
      ctx.lineWidth = 4
      ctx.strokeStyle = INK
      ctx.stroke()
      if (i >= items.length) {
        ctx.fillStyle = '#f8f4ea'
        ctx.font = `400 44px ${hand}`
        ctx.textAlign = 'center'
        ctx.fillText(o.labels.more(extra), cx + colW / 2, cy + cellH / 2 + 14)
        ctx.textAlign = 'left'
        continue
      }
      const r = items[i]
      const got = imgOf.get(r.uuid)
      const img = got && (got.clean || !cleanOnly) ? got.img : null
      const boxH = cellH - 50
      if (img) {
        const scale = Math.min((colW - 40) / img.width, boxH / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, cx + (colW - w) / 2, cy + 10 + (boxH - h) / 2, w, h)
      }
      ctx.fillStyle = '#f8f4ea'
      ctx.font = `600 26px ${display}`
      ctx.fillText(fitText(ctx, r.name, colW - 36), cx + 18, cy + cellH - 16)
    }
    y += Math.ceil(cells / 2) * (cellH + 18) + 26
  }

  // ท้าย
  ctx.fillStyle = INK
  ctx.font = `400 34px ${hand}`
  ctx.fillText('valo-thai.rosekorn.com/my', 64, H - 56)
}

function CardMaker({ own, want }: { own: SkinRow[]; want: SkinRow[] }) {
  const { lang, t } = useI18n()
  const m = t.my
  const [name, setName] = useState('')
  const [show, setShow] = useState<'both' | Shelf>('both')
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLCanvasElement>(null)
  const effective: 'both' | Shelf = show === 'both' && (!own.length || !want.length) ? (own.length ? 'own' : 'want') : show
  const opts: CardOpts = useMemo(
    () => ({ own, want, show: effective, title: m.cardOf(name.trim()), labels: { own: m.cardOwn, want: m.cardWant, more: m.andMore } }),
    [own, want, effective, name, m],
  )

  useEffect(() => {
    let stale = false
    const c = ref.current
    if (c) drawLocker(c, opts, () => stale)
    return () => {
      stale = true
    }
  }, [opts])

  const fileName = `valolist-locker${name.trim() ? `-${name.trim().replace(/[^\p{L}\p{N}]+/gu, '-')}` : ''}.png`
  const toBlob = async () => {
    const grab = (c: HTMLCanvasElement) => new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png'))
    const c = ref.current
    if (!c) return null
    try {
      return await grab(c)
    } catch {
      // มีรูปที่โหลดแบบไม่มี CORS → วาดใหม่แบบไม่ใส่รูปนั้น
      const fresh = document.createElement('canvas')
      fresh.width = W
      fresh.height = H
      await drawLocker(fresh, opts, () => false, true)
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
    const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null
    const url = `${window.location.origin}/${lang}/my`
    try {
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: '#valolist', url })
      else await download()
    } catch {
      // ยกเลิกการแชร์
    }
  }

  return (
    <section className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-display text-2xl font-bold">{m.cardTitle}</h2>
        <label className="block">
          <span className="text-sm text-ink-soft">{m.name}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            className="mt-1 w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 outline-none focus:shadow-[3px_3px_0_var(--color-blue)]"
          />
        </label>
        <div>
          <p className="text-sm text-ink-soft">{m.show}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {(['both', 'want', 'own'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShow(s)}
                aria-pressed={effective === s}
                disabled={(s === 'own' && !own.length) || (s === 'want' && !want.length) || (s === 'both' && (!own.length || !want.length))}
                className={`chip disabled:opacity-40 ${effective === s ? '!bg-ink !text-paper' : ''}`}
              >
                {s === 'both' ? `${m.want} + ${m.own}` : m[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={share} disabled={busy} className="btn disabled:opacity-60">
            {busy ? m.making : m.share}
          </button>
          <button onClick={download} disabled={busy} className="btn btn-paper disabled:opacity-60">
            {m.download}
          </button>
        </div>
      </div>
      <canvas ref={ref} width={W} height={H} className="card mx-auto block h-auto w-full max-w-sm !p-0" aria-label={m.cardTitle} />
    </section>
  )
}
