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

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/media') return proxyMedia(request)
    // ที่เหลือคือ path ที่ไม่มีไฟล์ → ให้ asset ตอบหน้า 404.html (ซึ่งพาลิงก์เก่าไป /th หรือ /en ให้เอง)
    return env.ASSETS.fetch(request)
  },
}

export default worker
