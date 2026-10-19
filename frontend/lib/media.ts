// proxy รูปสำรอง (Cloudflare Worker ใน workers/media-proxy) ใช้ตอน media.valorant-api.com ไม่ส่ง CORS header
// ตั้ง NEXT_PUBLIC_MEDIA_PROXY ตอน build เช่น https://valolist-media.<account>.workers.dev — ไม่ตั้งก็ได้ จะโหลดตรงอย่างเดียว
const MEDIA_PROXY = process.env.NEXT_PUBLIC_MEDIA_PROXY?.replace(/\/$/, '')

/** URL ผ่าน proxy หรือ null ถ้าไม่ได้ตั้ง proxy ไว้ */
export function proxiedMedia(src: string) {
  return MEDIA_PROXY ? `${MEDIA_PROXY}/?u=${encodeURIComponent(src)}` : null
}

/** ลองโหลดตรงก่อน ถ้าพังและมี proxy ค่อยลองผ่าน proxy */
export function withProxyFallback<T>(src: string, load: (url: string) => Promise<T>): Promise<T> {
  return load(src).catch((err) => {
    const alt = proxiedMedia(src)
    if (!alt) throw err
    return load(alt)
  })
}
