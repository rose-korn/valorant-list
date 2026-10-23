// proxy รูปสำรอง (worker/index.ts → /api/media บนโดเมนเดียวกับเว็บ) ใช้ตอน media.valorant-api.com ไม่ส่ง CORS header
// เปลี่ยนที่อยู่ได้ด้วย NEXT_PUBLIC_MEDIA_PROXY ตอน build
const MEDIA_PROXY = (process.env.NEXT_PUBLIC_MEDIA_PROXY ?? '/api/media').replace(/\/$/, '')

/** URL ของรูปเดียวกันแต่ผ่าน proxy */
export function proxiedMedia(src: string) {
  return `${MEDIA_PROXY}?u=${encodeURIComponent(src)}`
}

/** ลองโหลดตรงก่อน ถ้าพังค่อยลองผ่าน proxy */
export function withProxyFallback<T>(src: string, load: (url: string) => Promise<T>): Promise<T> {
  return load(src).catch(() => load(proxiedMedia(src)))
}
