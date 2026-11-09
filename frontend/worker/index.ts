// Cloudflare Worker ของเว็บ: ไฟล์ static (out/) เสิร์ฟโดยตรงจาก asset ของ Cloudflare
// โค้ดนี้ทำงานแค่ตอน path ไม่ตรงกับไฟล์ไหนเลย ได้แก่ /api/media (proxy รูป) กับหน้า 404
//
// /api/media?u=<url> — proxy รูปจาก media.valorant-api.com ให้มี CORS header
// ใช้เป็นทางสำรองตอนวาดการ์ดแชร์ (canvas) และโหลด texture ของ three.js ถ้าโหลดตรงแล้วติด CORS

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const ALLOWED_HOST = 'media.valorant-api.com'
const CORS = { 'access-control-allow-origin': '*' }

async function proxyMedia(request: Request): Promise<Response> {
  if (request.method !== 'GET') return new Response('method not allowed', { status: 405, headers: CORS })
  const target = new URL(request.url).searchParams.get('u')
  if (!target) return new Response('missing u', { status: 400, headers: CORS })

  let url: URL
  try {
    url = new URL(target)
  } catch {
    return new Response('bad url', { status: 400, headers: CORS })
  }
  // รับเฉพาะรูปจาก valorant-api เท่านั้น กันคนเอาไปใช้เป็น open proxy
  if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST) {
    return new Response('forbidden host', { status: 403, headers: CORS })
  }

  // cacheEverything: เก็บไว้ที่ edge ของ Cloudflare ไม่ต้องดึงจากต้นทางซ้ำ
  const upstream = await fetch(url.toString(), { cf: { cacheEverything: true, cacheTtl: 604800 } } as RequestInit).catch(() => null)
  if (!upstream?.ok || !upstream.body) return new Response('upstream error', { status: 502, headers: CORS })

  return new Response(upstream.body, {
    headers: {
      ...CORS,
      'content-type': upstream.headers.get('content-type') ?? 'image/png',
      // ให้ browser จำไว้นาน ๆ คนเดิมเปิดซ้ำจะไม่ยิงมาที่ Worker อีก
      'cache-control': 'public, max-age=604800, immutable',
    },
  })
}

/**
 * ลิงก์เก่าที่ไม่มี /th หรือ /en นำหน้า (เช่น /maps/xxx, /share?a=xxx จากสมัยเว็บยังไม่แยกภาษา)
 * เมื่อก่อนตอบหน้า 404 แล้วให้สคริปต์ในหน้าพาไปเอง → คนเปิดได้ แต่ Google เห็นเป็น 404 (ขึ้นใน Search Console เป็นร้อยหน้า)
 * ตอนนี้ตอบ 301 ไปหน้าจริงเลย Google จะย้ายคะแนนของลิงก์เก่าไปหน้าใหม่
 * เลือกภาษาแบบเดียวกับ lib/lang-redirect.ts: เบราว์เซอร์ภาษาไทย หรือเข้าจากประเทศไทย = /th นอกนั้น = /en
 */
function legacyRedirect(request: Request, url: URL): Response | null {
  const p = url.pathname
  if (request.method !== 'GET' && request.method !== 'HEAD') return null
  if (/^\/(th|en)(\/|$)/.test(p)) return null
  // ไฟล์ (มีนามสกุล) กับ path ของระบบ ไม่ต้องยุ่ง
  if (/\.[a-z0-9]+$/i.test(p) || p.startsWith('/_next/') || p.startsWith('/api/')) return null
  const acceptLang = request.headers.get('accept-language') ?? ''
  const country = (request as Request & { cf?: { country?: string } }).cf?.country
  const lang = /(^|,)\s*th\b/i.test(acceptLang) || country === 'TH' ? 'th' : 'en'
  const target = `${url.origin}/${lang}${p === '/' ? '' : p.replace(/\/+$/, '')}${url.search}`
  return new Response(null, { status: 301, headers: { location: target, vary: 'Accept-Language' } })
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/media') return proxyMedia(request)
    // path ภายในเกม (/Game/Maps/...) ที่ Google เคยเก็บไปจาก HTML รุ่นเก่า — 410 บอกว่าไม่มีแล้วถาวร Google จะเลิกมาเร็วกว่า 404
    if (url.pathname.startsWith('/Game/')) return new Response('gone', { status: 410 })
    const moved = legacyRedirect(request, url)
    if (moved) return moved
    // ที่เหลือคือ path ที่ไม่มีไฟล์จริง → asset ตอบหน้า 404.html
    return env.ASSETS.fetch(request)
  },
}

export default worker
