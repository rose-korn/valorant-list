// ข้อความจาก valorant-api บางช่องมีแท็กของเกมติดมา เช่น
//   "ติดตั้ง <whitebold>Healing Orb</> ... มอบ<teal>การฮีล</>"
// ตัวนี้แปลงแท็กเป็นตัวหนา/สีแทนการโชว์แท็กดิบ ๆ (ใช้ได้ทั้ง server และ client)

const TAG = /<([a-zA-Z]+)>([\s\S]*?)<\/[a-zA-Z]*>/g

/** สีของแต่ละแท็ก — แท็กที่ไม่รู้จักแสดงเป็นตัวหนาเฉย ๆ */
const STYLE: Record<string, string> = {
  whitebold: 'font-semibold text-ink',
  bold: 'font-semibold text-ink',
  teal: 'font-semibold text-blue',
  debuffred: 'font-semibold text-red-ink',
  blue: 'font-semibold text-blue',
  red: 'font-semibold text-red-ink',
  yellow: 'font-semibold text-red-ink',
}

/** ตัดแท็กทิ้ง เหลือแต่ข้อความ (สำหรับ meta description / alt) */
export function stripTags(text: string | null | undefined) {
  return (text ?? '').replace(TAG, '$2').replace(/<\/?[a-zA-Z]*>/g, '')
}

export default function RichText({ text }: { text: string | null | undefined }) {
  if (!text) return null
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TAG)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <span key={m.index} className={STYLE[m[1].toLowerCase()] ?? 'font-semibold'}>
        {m[2]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  // แท็กเดี่ยวที่ไม่มีคู่ปิด (ถ้ามี) ก็ตัดทิ้ง
  return <>{parts.map((p) => (typeof p === 'string' ? p.replace(/<\/?[a-zA-Z]*>/g, '') : p))}</>
}
