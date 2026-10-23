// โลโก้ valolist แบบสติกเกอร์วาดมือ — ใช้ทั้ง favicon, ไอคอนมือถือ และโลโก้บน navbar
// มีหลายร่างไว้ทำลูกเล่นบนแท็บ: ปกติ / spike กำลังจะระเบิด (กะพริบ) / defused / ACE

export type MarkVariant = 'default' | 'planted' | 'defused' | 'ace'

const INK = '#1d1f24'
const PAPER = '#fffaf0'

// ขอบสี่เหลี่ยมโค้ง ๆ เบี้ยว ๆ เหมือนตัดสติกเกอร์ด้วยกรรไกรเอง
const BLOB =
  'M14 9C26 6 40 7 52 9C57 10 58 14 58 20C59 32 58 43 57 52C56 57 52 58 47 58C35 59 24 59 13 57C8 56 7 52 7 47C6 35 6 24 8 14C9 10 11 9 14 9Z'

// ตัว V เขียนด้วยปากกาเมจิกทีเดียวจบ (ทรงสมมาตร ไม่ให้ไปซ้ำกับเครื่องหมายถูกของร่าง defused)
const V = 'M17 17C21 27 26 37 31.5 47C36 37 41 27 46.5 16.5'
const CHECK = 'M17 33C21 37 25 41 28 45C34 34 40 25 48 17'
const STAR = 'M32 14L36 26L48 26L38 33L42 46L32 38L22 46L26 33L16 26L28 26Z'

const BODY: Record<MarkVariant, string> = { default: '#ff4654', planted: INK, defused: '#2bb5a0', ace: '#f2b84b' }

function glyph(variant: MarkVariant) {
  const pen = (d: string, color = PAPER) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
  switch (variant) {
    case 'default':
      return pen(V)
    case 'planted':
      // ไฟแดงของ spike + วงแสง
      return `<circle cx="32" cy="33" r="15" fill="#ff4654" opacity=".25"/><circle cx="32" cy="33" r="9" fill="#ff4654" stroke="${PAPER}" stroke-width="3"/>`
    case 'defused':
      return pen(CHECK)
    case 'ace':
      return `<path d="${STAR}" fill="${PAPER}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
  }
}

/** SVG ของโลโก้ (string) — `bg` ใส่สีพื้นหลังเต็มกรอบสำหรับไอคอนมือถือที่ไม่รองรับพื้นใส */
export function markSvg(variant: MarkVariant = 'default', opts: { size?: number; bg?: string } = {}) {
  const size = opts.size ?? 64
  const bg = opts.bg ? `<rect width="64" height="64" fill="${opts.bg}"/>` : ''
  // เทปกาวแปะมุมบน + ประกายดาวเล็ก ๆ ทำให้ดูเป็นสติกเกอร์ในสมุดจด
  const tape = variant === 'planted' ? '' : '<rect x="22" y="2" width="20" height="9" rx="1.5" fill="#f2b84b" opacity=".85" transform="rotate(-8 32 6)"/>'
  const sparkle = variant === 'default' ? `<path d="M54 4l1.6 4.4L60 10l-4.4 1.6L54 16l-1.6-4.4L48 10l4.4-1.6z" fill="#f2b84b" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">` +
    bg +
    `<g transform="rotate(-6 32 33)">` +
    `<path d="${BLOB}" transform="translate(2.5 3)" fill="${INK}"/>` +
    `<path d="${BLOB}" fill="${BODY[variant]}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    glyph(variant) +
    `</g>` +
    tape +
    sparkle +
    `</svg>`
  )
}

export const markDataUri = (variant: MarkVariant = 'default') => `data:image/svg+xml,${encodeURIComponent(markSvg(variant))}`
