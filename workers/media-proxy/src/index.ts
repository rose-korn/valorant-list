// Proxy รูปจาก media.valorant-api.com ให้มี CORS header — เว็บใช้เป็นทางสำรองตอนโหลด texture / วาดการ์ดแชร์
// deploy: cd workers/media-proxy && npx wrangler deploy  แล้วเอา URL ไปตั้ง NEXT_PUBLIC_MEDIA_PROXY ตอน build เว็บ

const ALLOWED_HOST = 'media.valorant-api.com'
const CORS = { 'access-control-allow-origin': '*' }

export default {
  async fetch(request: Request): Promise<Response> {
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

    // cf.cacheEverything: เก็บไว้ที่ edge ของ Cloudflare ไม่ต้องดึงจากต้นทางซ้ำ
    const upstream = await fetch(url.toString(), { cf: { cacheEverything: true, cacheTtl: 604800 } } as RequestInit).catch(() => null)
    if (!upstream?.ok || !upstream.body) return new Response('upstream error', { status: 502, headers: CORS })

    return new Response(upstream.body, {
      headers: {
        ...CORS,
        'content-type': upstream.headers.get('content-type') ?? 'image/png',
        'cache-control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    })
  },
}
