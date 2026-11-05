// อ่าน/เขียนโค้ด crosshair ของ Valorant (ที่ copy ได้จาก Settings → Crosshair → Export)
// รูปแบบนี้ Riot ไม่ได้ประกาศเป็นทางการ อ้างอิงจากที่ชุมชนแกะกันมา: เป็นคู่ "คีย์;ค่า" คั่นด้วย ;
// มีหัวส่วน P (crosshair หลัก) A (ตอนเล็ง) S (สไนเปอร์) — ค่าที่เท่าค่าเริ่มต้นของเกมจะไม่ถูกเขียนลงโค้ด
// คีย์ที่อ่านไม่ออก/ส่วนอื่น เก็บไว้ตามเดิมแล้วเขียนกลับ จะได้ไม่ทำค่าของผู้เล่นหายตอน copy กลับเข้าเกม

export interface CrosshairLines {
  show: boolean
  thickness: number
  length: number
  offset: number
  opacity: number
  moveError: boolean
  fireError: boolean
}

export interface Crosshair {
  color: number // 0–7 สีในเกม, 8 = สีกำหนดเอง
  custom: string // RRGGBB (ใช้เมื่อ color = 8)
  outline: boolean
  outlineThickness: number
  outlineOpacity: number
  dot: boolean
  dotThickness: number
  dotOpacity: number
  inner: CrosshairLines
  outer: CrosshairLines
}

/** สีสำเร็จรูปในเกม ตามลำดับเลขในโค้ด */
export const CROSSHAIR_COLORS = ['#ffffff', '#00ff00', '#7fff00', '#dfff00', '#ffff00', '#00ffff', '#ff00ff', '#ff0000'] as const

export const DEFAULT_CROSSHAIR: Crosshair = {
  color: 0,
  custom: 'ffffff',
  outline: true,
  outlineThickness: 1,
  outlineOpacity: 0.5,
  dot: false,
  dotThickness: 2,
  dotOpacity: 1,
  inner: { show: true, thickness: 2, length: 6, offset: 3, opacity: 0.8, moveError: false, fireError: true },
  outer: { show: true, thickness: 2, length: 2, offset: 10, opacity: 0.35, moveError: true, fireError: true },
}

/** ช่วงค่าของแถบเลื่อน ตามที่เกมให้ปรับ */
export const RANGES = {
  thickness: [0, 10, 1],
  length: [0, 20, 1],
  offset: [0, 20, 1],
  opacity: [0, 1, 0.01],
  outlineThickness: [1, 6, 1],
  dotThickness: [1, 6, 1],
} as const

// ---------- parse ----------
type Pairs = [string, string][]
export interface ParsedCode {
  crosshair: Crosshair
  /** คีย์ในส่วน P ที่ไม่รู้จัก + ส่วนอื่นทั้งหมด (เก็บไว้เขียนกลับ) */
  extraPrimary: Pairs
  general: Pairs
  rest: { section: string; pairs: Pairs }[]
}

const KNOWN_PRIMARY = new Set(['c', 'u', 'h', 't', 'o', 'd', 'z', 'a', ...['0', '1'].flatMap((p) => ['b', 't', 'l', 'o', 'a', 'm', 'f'].map((k) => p + k))])
const SECTIONS = new Set(['P', 'A', 'S'])

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v)
  return v !== undefined && Number.isFinite(n) ? n : fallback
}
const bool = (v: string | undefined, fallback: boolean) => (v === undefined ? fallback : v !== '0')

/** แปลงโค้ด → ค่าตั้ง; โค้ดผิดรูปแบบคืน null */
export function parseCrosshairCode(raw: string): ParsedCode | null {
  const tokens = raw.trim().replace(/;$/, '').split(';').map((t) => t.trim())
  if (!tokens.length || tokens[0] === '') return null
  let i = tokens[0] === '0' ? 1 : 0 // ตัวแรก "0" คือเวอร์ชันของรูปแบบโค้ด
  let section = 'G'
  const bySection = new Map<string, Pairs>([['G', []]])
  while (i < tokens.length) {
    const tok = tokens[i]
    if (SECTIONS.has(tok)) {
      section = tok
      if (!bySection.has(section)) bySection.set(section, [])
      i += 1
      continue
    }
    const value = tokens[i + 1]
    if (!tok || value === undefined || SECTIONS.has(value)) return null
    bySection.get(section)!.push([tok, value])
    i += 2
  }
  if (!bySection.has('P') && bySection.get('G')!.length === 0) return null

  const p = new Map(bySection.get('P') ?? [])
  const d = DEFAULT_CROSSHAIR
  const lines = (prefix: '0' | '1', def: CrosshairLines): CrosshairLines => ({
    show: bool(p.get(`${prefix}b`), def.show),
    thickness: num(p.get(`${prefix}t`), def.thickness),
    length: num(p.get(`${prefix}l`), def.length),
    offset: num(p.get(`${prefix}o`), def.offset),
    opacity: num(p.get(`${prefix}a`), def.opacity),
    moveError: bool(p.get(`${prefix}m`), def.moveError),
    fireError: bool(p.get(`${prefix}f`), def.fireError),
  })
  const color = Math.round(num(p.get('c'), d.color))
  const crosshair: Crosshair = {
    color: color >= 0 && color <= 8 ? color : 0,
    custom: (p.get('u') ?? d.custom).replace(/^#/, '').slice(0, 6).toLowerCase(),
    outline: bool(p.get('h'), d.outline),
    outlineThickness: num(p.get('t'), d.outlineThickness),
    outlineOpacity: num(p.get('o'), d.outlineOpacity),
    dot: bool(p.get('d'), d.dot),
    dotThickness: num(p.get('z'), d.dotThickness),
    dotOpacity: num(p.get('a'), d.dotOpacity),
    inner: lines('0', d.inner),
    outer: lines('1', d.outer),
  }
  if (!/^[0-9a-f]{6}$/.test(crosshair.custom)) crosshair.custom = d.custom

  return {
    crosshair,
    extraPrimary: (bySection.get('P') ?? []).filter(([k]) => !KNOWN_PRIMARY.has(k)),
    general: bySection.get('G')!,
    rest: [...bySection].filter(([s]) => s !== 'G' && s !== 'P').map(([section, pairs]) => ({ section, pairs })),
  }
}

// ---------- serialize ----------
const fmt = (n: number) => String(Number(n.toFixed(3)))

/** ค่าตั้ง → โค้ด (ใส่เฉพาะค่าที่ต่างจากค่าเริ่มต้น เหมือนที่เกม export) */
export function toCrosshairCode(c: Crosshair, keep?: Omit<ParsedCode, 'crosshair'>): string {
  const d = DEFAULT_CROSSHAIR
  const out: Pairs = []
  const put = (key: string, value: number | boolean, def: number | boolean) => {
    if (value !== def) out.push([key, typeof value === 'boolean' ? (value ? '1' : '0') : fmt(value)])
  }
  put('c', c.color, d.color)
  if (c.color === 8) out.push(['u', `${c.custom.toUpperCase()}FF`])
  put('h', c.outline, d.outline)
  put('t', c.outlineThickness, d.outlineThickness)
  put('o', c.outlineOpacity, d.outlineOpacity)
  put('d', c.dot, d.dot)
  put('z', c.dotThickness, d.dotThickness)
  put('a', c.dotOpacity, d.dotOpacity)
  for (const [prefix, l, dl] of [['0', c.inner, d.inner] as const, ['1', c.outer, d.outer] as const]) {
    put(`${prefix}b`, l.show, dl.show)
    put(`${prefix}t`, l.thickness, dl.thickness)
    put(`${prefix}l`, l.length, dl.length)
    put(`${prefix}o`, l.offset, dl.offset)
    put(`${prefix}a`, l.opacity, dl.opacity)
    put(`${prefix}m`, l.moveError, dl.moveError)
    put(`${prefix}f`, l.fireError, dl.fireError)
  }
  out.push(...(keep?.extraPrimary ?? []))
  const join = (pairs: Pairs) => pairs.flatMap(([k, v]) => [k, v])
  return ['0', ...join(keep?.general ?? []), 'P', ...join(out), ...(keep?.rest ?? []).flatMap((s) => [s.section, ...join(s.pairs)])].join(';')
}

export const crosshairColor = (c: Crosshair) => (c.color === 8 ? `#${c.custom}` : CROSSHAIR_COLORS[c.color] ?? '#ffffff')

// ---------- วาด (หน่วยเป็นพิกเซลของเกมที่จอ 1080p) ----------
export interface Spread {
  moving: boolean
  firing: boolean
}

type Rect = [x: number, y: number, w: number, h: number]

function lineRects(cx: number, cy: number, l: CrosshairLines, extra: number): Rect[] {
  if (!l.show || l.length <= 0 || l.thickness <= 0) return []
  const t = l.thickness
  const o = l.offset + extra
  const half = Math.floor(t / 2)
  return [
    [cx + o, cy - half, l.length, t], // ขวา
    [cx - o - l.length, cy - half, l.length, t], // ซ้าย
    [cx - half, cy - o - l.length, t, l.length], // บน
    [cx - half, cy + o, t, l.length], // ล่าง
  ]
}

/** วาด crosshair ลง canvas ที่ 1 หน่วย = 1 พิกเซลเกม โดยมีจุดกลางที่ (cx, cy) */
export function drawCrosshair(ctx: CanvasRenderingContext2D, c: Crosshair, cx: number, cy: number, spread: Spread = { moving: false, firing: false }) {
  // ระยะกางออกตอนเดิน/ยิง เป็นค่าประมาณให้เห็นภาพ ไม่ได้เท่าในเกมเป๊ะ
  const errorFor = (l: CrosshairLines) => (spread.moving && l.moveError ? 6 : 0) + (spread.firing && l.fireError ? 4 : 0)
  const groups: { rects: Rect[]; opacity: number }[] = [
    { rects: lineRects(cx, cy, c.outer, errorFor(c.outer)), opacity: c.outer.opacity },
    { rects: lineRects(cx, cy, c.inner, errorFor(c.inner)), opacity: c.inner.opacity },
  ]
  if (c.dot && c.dotThickness > 0) {
    const s = c.dotThickness
    const h = Math.floor(s / 2)
    groups.push({ rects: [[cx - h, cy - h, s, s]], opacity: c.dotOpacity })
  }
  const color = crosshairColor(c)
  for (const g of groups) {
    for (const [x, y, w, h] of g.rects) {
      if (c.outline && c.outlineThickness > 0) {
        // ขอบเป็นกรอบรอบชิ้นเท่านั้น (evenodd) ไม่ซ้อนใต้สี จะได้ไม่ทำให้สีทึบเข้มกว่าในเกม
        const ot = c.outlineThickness
        ctx.globalAlpha = c.outlineOpacity
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.rect(x - ot, y - ot, w + ot * 2, h + ot * 2)
        ctx.rect(x, y, w, h)
        ctx.fill('evenodd')
      }
      ctx.globalAlpha = g.opacity
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)
    }
  }
  ctx.globalAlpha = 1
}

/** ชุดสำเร็จรูปให้กดลอง (ตั้งชื่อตามหน้าตา ไม่ได้อ้างว่าเป็นของนักแข่งคนไหน) */
export const CROSSHAIR_PRESETS = [
  { key: 'default', code: '0;P' },
  { key: 'dot', code: '0;P;c;5;h;0;d;1;z;3;a;1;0b;0;1b;0' },
  { key: 'smallPlus', code: '0;P;c;1;h;0;0l;4;0o;2;0a;1;0f;0;1b;0' },
  { key: 'outlinedCross', code: '0;P;c;5;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0' },
  { key: 'dotPlus', code: '0;P;c;7;o;1;d;1;z;1;0t;1;0l;2;0o;3;0a;1;0f;0;1b;0' },
  { key: 'gap', code: '0;P;c;4;h;0;0t;2;0l;5;0o;5;0a;1;0f;0;1b;0' },
  { key: 'dynamic', code: '0;P;c;5;h;0;0l;3;0o;2;0a;1;0f;0;1t;1;1l;2;1o;6;1a;0.6;1m;1;1f;1' },
] as const
