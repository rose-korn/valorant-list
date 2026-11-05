'use client'

// ตัวทำ crosshair: วางโค้ดจากเกม → เห็นหน้าตาบนฉากแผนที่ / ปรับเองด้วยแถบเลื่อน → copy โค้ดกลับเข้าเกม
// โค้ดปัจจุบันเก็บไว้ใน URL (?code=) เลยส่งลิงก์ให้เพื่อนดู crosshair เดียวกันได้

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/LangProvider'
import {
  CROSSHAIR_COLORS,
  CROSSHAIR_PRESETS,
  type Crosshair,
  type CrosshairLines,
  DEFAULT_CROSSHAIR,
  type ParsedCode,
  RANGES,
  drawCrosshair,
  parseCrosshairCode,
  toCrosshairCode,
} from '@/lib/crosshair'

type Keep = Omit<ParsedCode, 'crosshair'>
const EMPTY_KEEP: Keep = { extraPrimary: [], general: [], rest: [] }

// canvas เป็นหน่วยพิกเซลเกม: เส้นยาว+ระยะห่าง+ระยะกาง+ขอบ สูงสุดราว 60px จากกลาง
const SIZE = 128
const ZOOMS = [1, 2, 4] as const

function fromUrl(raw: string | null) {
  const parsed = raw ? parseCrosshairCode(raw) : null
  if (!parsed) return { crosshair: DEFAULT_CROSSHAIR, keep: EMPTY_KEEP, code: toCrosshairCode(DEFAULT_CROSSHAIR) }
  const { crosshair, ...keep } = parsed
  return { crosshair, keep, code: toCrosshairCode(crosshair, keep) }
}

export default function CrosshairLab({ backgrounds }: { backgrounds: { name: string; image: string }[] }) {
  const { lang, t } = useI18n()
  const x = t.crosshair
  const params = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [initial] = useState(() => fromUrl(params.get('code')))
  const [crosshair, setCrosshair] = useState<Crosshair>(initial.crosshair)
  const [keep, setKeep] = useState<Keep>(initial.keep)
  const [codeText, setCodeText] = useState(initial.code)
  const [invalid, setInvalid] = useState(false)
  const [bg, setBg] = useState(0) // 0..n-1 = แผนที่, -1 = พื้นสว่าง, -2 = พื้นมืด
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>(2)
  const [moving, setMoving] = useState(false)
  const [firing, setFiring] = useState(false)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const code = toCrosshairCode(crosshair, keep)
  const hasExtras = keep.general.length + keep.extraPrimary.length + keep.rest.length > 0

  // วาดใหม่ทุกครั้งที่ค่าเปลี่ยน
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)
    drawCrosshair(ctx, crosshair, SIZE / 2, SIZE / 2, { moving, firing })
  }, [crosshair, moving, firing])

  // เก็บโค้ดลง URL แบบไม่เพิ่มประวัติ (ปุ่ม back ไม่ต้องย้อนทีละแถบเลื่อน)
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('code', code)
    window.history.replaceState(window.history.state, '', url)
  }, [code])

  // ปรับจากแถบเลื่อน → โค้ดในกล่องเปลี่ยนตาม
  const update = (next: Crosshair) => {
    setCrosshair(next)
    setCodeText(toCrosshairCode(next, keep))
    setInvalid(false)
  }
  const set = <K extends keyof Crosshair>(key: K, value: Crosshair[K]) => update({ ...crosshair, [key]: value })
  const setLines = (which: 'inner' | 'outer', patch: Partial<CrosshairLines>) => update({ ...crosshair, [which]: { ...crosshair[which], ...patch } })

  // พิมพ์/วางโค้ด → ถ้าอ่านออกค่อยเปลี่ยนภาพ ถ้าอ่านไม่ออกคงภาพเดิมไว้แล้วเตือน
  const onCodeInput = (text: string) => {
    setCodeText(text)
    const parsed = parseCrosshairCode(text)
    if (!parsed) {
      setInvalid(text.trim() !== '')
      return
    }
    const { crosshair: next, ...rest } = parsed
    setCrosshair(next)
    setKeep(rest)
    setInvalid(false)
  }

  const applyPreset = (presetCode: string) => {
    const parsed = parseCrosshairCode(presetCode)
    if (!parsed) return
    // ชุดสำเร็จรูปเปลี่ยนแค่ crosshair หลัก ค่าตอนเล็ง/สไนเปอร์ของผู้เล่นยังอยู่
    update(parsed.crosshair)
  }

  const copy = async (what: 'code' | 'link') => {
    const text = what === 'code' ? code : `${window.location.origin}/${lang}/crosshair?code=${encodeURIComponent(code)}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1600)
    } catch {
      // clipboard ใช้ไม่ได้ (เช่น http) — ผู้ใช้ยังเลือกข้อความในกล่องเองได้
    }
  }

  const bgImage = bg >= 0 ? backgrounds[bg]?.image : null
  const bgColor = bg === -2 ? '#1d1f24' : '#efe8da'

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      {/* ================= ซ้าย: พรีวิว + โค้ด ================= */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="relative aspect-video overflow-hidden border-[1.5px] border-ink" style={{ background: bgColor }}>
          {bgImage && <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            aria-label={x.title}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [image-rendering:pixelated]"
            style={{ width: SIZE * zoom, height: SIZE * zoom }}
          />
          <span className="absolute top-2 left-2 bg-ink/75 px-1.5 py-0.5 font-mono text-xs text-paper">
            {zoom}x · {bgImage ? backgrounds[bg].name : bg === -2 ? x.plainDark : x.plainLight}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Segment label={x.zoom} value={zoom} options={ZOOMS.map((z) => ({ value: z, label: `${z}x` }))} onChange={setZoom} />
          <Toggle label={x.moving} checked={moving} onChange={setMoving} />
          <Toggle label={x.firing} checked={firing} onChange={setFiring} />
        </div>
        <p className="text-xs text-ink-soft">
          {x.zoomHint} · {x.spreadNote}
        </p>

        <div>
          <p className="kicker mb-2">{x.background}</p>
          <div className="flex flex-wrap gap-1.5">
            {backgrounds.map((b, i) => (
              <Pill key={b.name} active={bg === i} onClick={() => setBg(i)}>
                {b.name}
              </Pill>
            ))}
            <Pill active={bg === -1} onClick={() => setBg(-1)}>
              {x.plainLight}
            </Pill>
            <Pill active={bg === -2} onClick={() => setBg(-2)}>
              {x.plainDark}
            </Pill>
          </div>
        </div>

        <div className="card p-4">
          <label htmlFor="xhair-code" className="kicker">
            {x.codeLabel}
          </label>
          <textarea
            id="xhair-code"
            value={codeText}
            onChange={(e) => onCodeInput(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder={x.codeHint}
            spellCheck={false}
            rows={2}
            className={`mt-2 block w-full resize-none border-[1.5px] bg-paper px-3 py-2 font-mono text-sm break-all focus:outline-none focus-visible:ring-4 focus-visible:ring-red/30 ${invalid ? 'border-red' : 'border-ink'}`}
          />
          {invalid && <p className="mt-1.5 text-sm text-red-ink">{x.invalid}</p>}
          {hasExtras && !invalid && <p className="mt-1.5 text-xs text-ink-soft">{x.keptNote}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => copy('code')} className="btn flex-1">
              {copied === 'code' ? x.copied : x.copy}
            </button>
            <button onClick={() => copy('link')} className="btn btn-paper flex-1">
              {copied === 'link' ? x.linkCopied : x.copyLink}
            </button>
          </div>
        </div>

        <div>
          <p className="kicker mb-2">{x.presets}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CROSSHAIR_PRESETS.map((p) => (
              <PresetButton key={p.key} code={p.code} label={x.presetNames[p.key]} active={code === toCrosshairCode(parseCrosshairCode(p.code)!.crosshair, keep)} onClick={() => applyPreset(p.code)} />
            ))}
          </div>
        </div>
      </div>

      {/* ================= ขวา: ปรับเอง ================= */}
      <div className="space-y-5">
        <Group title={x.color}>
          <div className="flex flex-wrap gap-2">
            {[...CROSSHAIR_COLORS, null].map((hex, i) => (
              <button
                key={i}
                onClick={() => set('color', i)}
                aria-label={x.colorNames[i]}
                title={x.colorNames[i]}
                aria-pressed={crosshair.color === i}
                className={`h-9 w-9 border-[1.5px] border-ink transition-transform ${crosshair.color === i ? 'scale-110 ring-2 ring-red ring-offset-2 ring-offset-card' : 'hover:scale-105'}`}
                style={{ background: hex ?? `conic-gradient(#ff4654, #ffff00, #00ff00, #00ffff, #3255a4, #ff00ff, #ff4654)` }}
              />
            ))}
          </div>
          {crosshair.color === 8 && (
            <label className="mt-3 flex items-center gap-3 text-sm">
              <input type="color" value={`#${crosshair.custom}`} onChange={(e) => set('custom', e.target.value.slice(1).toLowerCase())} className="h-9 w-14 cursor-pointer border-[1.5px] border-ink bg-card" />
              <span className="font-mono">#{crosshair.custom.toUpperCase()}</span>
            </label>
          )}
          <p className="mt-2 text-sm text-ink-soft">{x.colorNames[crosshair.color]}</p>
        </Group>

        <Group title={x.outline} toggle={<Toggle label={x.show} checked={crosshair.outline} onChange={(v) => set('outline', v)} />}>
          <Slider label={x.thickness} value={crosshair.outlineThickness} range={RANGES.outlineThickness} disabled={!crosshair.outline} onChange={(v) => set('outlineThickness', v)} />
          <Slider label={x.opacity} value={crosshair.outlineOpacity} range={RANGES.opacity} disabled={!crosshair.outline} onChange={(v) => set('outlineOpacity', v)} />
        </Group>

        <Group title={x.dot} toggle={<Toggle label={x.show} checked={crosshair.dot} onChange={(v) => set('dot', v)} />}>
          <Slider label={x.thickness} value={crosshair.dotThickness} range={RANGES.dotThickness} disabled={!crosshair.dot} onChange={(v) => set('dotThickness', v)} />
          <Slider label={x.opacity} value={crosshair.dotOpacity} range={RANGES.opacity} disabled={!crosshair.dot} onChange={(v) => set('dotOpacity', v)} />
        </Group>

        {(['inner', 'outer'] as const).map((which) => {
          const l = crosshair[which]
          return (
            <Group key={which} title={x[which]} toggle={<Toggle label={x.show} checked={l.show} onChange={(v) => setLines(which, { show: v })} />}>
              <Slider label={x.opacity} value={l.opacity} range={RANGES.opacity} disabled={!l.show} onChange={(v) => setLines(which, { opacity: v })} />
              <Slider label={x.length} value={l.length} range={RANGES.length} disabled={!l.show} onChange={(v) => setLines(which, { length: v })} />
              <Slider label={x.thickness} value={l.thickness} range={RANGES.thickness} disabled={!l.show} onChange={(v) => setLines(which, { thickness: v })} />
              <Slider label={x.offset} value={l.offset} range={RANGES.offset} disabled={!l.show} onChange={(v) => setLines(which, { offset: v })} />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Toggle label={x.moveError} checked={l.moveError} disabled={!l.show} onChange={(v) => setLines(which, { moveError: v })} />
                <Toggle label={x.fireError} checked={l.fireError} disabled={!l.show} onChange={(v) => setLines(which, { fireError: v })} />
              </div>
            </Group>
          )
        })}

        <button onClick={() => applyPreset('0;P')} className="btn btn-paper w-full">
          {x.reset}
        </button>
      </div>
    </div>
  )
}

// ---------- ชิ้นส่วนเล็ก ๆ ----------

function Group({ title, toggle, children }: { title: string; toggle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between gap-3 border-b-[1.5px] border-line pb-1.5">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {toggle}
      </div>
      {children}
    </section>
  )
}

function Slider({
  label,
  value,
  range,
  disabled,
  onChange,
}: {
  label: string
  value: number
  range: readonly [number, number, number]
  disabled?: boolean
  onChange: (v: number) => void
}) {
  const [min, max, step] = range
  const decimals = step < 1 ? 2 : 0
  return (
    <label className={`grid grid-cols-[minmax(0,7.5rem)_1fr_3rem] items-center gap-3 py-1 text-sm ${disabled ? 'opacity-40' : ''}`}>
      <span className="truncate">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red"
      />
      <span className="text-right font-mono">{value.toFixed(decimals)}</span>
    </label>
  )
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-red" />
      <span>{label}</span>
    </label>
  )
}

function Segment<T extends number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <div className="flex border-[1.5px] border-ink">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`px-2.5 py-0.5 font-mono ${value === o.value ? 'bg-ink text-paper' : 'bg-card hover:bg-pink'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={`chip ${active ? '!bg-ink !text-paper' : 'hover:!bg-pink'}`}>
      {children}
    </button>
  )
}

/** ปุ่มชุดสำเร็จรูป: มีภาพ crosshair จิ๋วบนพื้นมืดให้เห็นก่อนกด */
function PresetButton({ code, label, active, onClick }: { code: string; label: string; active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    const parsed = parseCrosshairCode(code)
    if (!ctx || !parsed) return
    ctx.clearRect(0, 0, 48, 48)
    drawCrosshair(ctx, parsed.crosshair, 24, 24)
  }, [code])
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-1.5 border-[1.5px] p-2 text-center text-xs transition-colors ${active ? 'border-red bg-pink' : 'border-ink bg-card hover:bg-pink/60'}`}
    >
      <canvas ref={ref} width={48} height={48} className="h-12 w-12 bg-night [image-rendering:pixelated]" aria-hidden />
      <span className="leading-tight">{label}</span>
    </button>
  )
}
