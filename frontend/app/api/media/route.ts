import type { NextRequest } from 'next/server'

// Proxy รูปจาก media.valorant-api.com ให้เป็น same-origin
// ใช้เป็น fallback ตอนโหลด texture ให้ three.js เผื่อ CDN ไม่ส่ง CORS header

const ALLOWED_HOST = 'media.valorant-api.com'

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('u')
  if (!target) return new Response('missing u', { status: 400 })

  let url: URL
  try {
    url = new URL(target)
  } catch {
    return new Response('bad url', { status: 400 })
  }
  if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST) {
    return new Response('forbidden host', { status: 403 })
  }

  const upstream = await fetch(url, { next: { revalidate: 86400 } }).catch(() => null)
  if (!upstream?.ok || !upstream.body) return new Response('upstream error', { status: 502 })

  return new Response(upstream.body, {
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'image/png',
      'cache-control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  })
}
