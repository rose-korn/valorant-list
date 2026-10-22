import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { dict } from '@/lib/i18n'
import { LANG_REDIRECT_JS } from '@/lib/lang-redirect'

export const metadata: Metadata = {
  title: '404 · Valorant List',
}

// หน้า 404 กลาง (กลายเป็น 404.html ตอน export) — ถ้า path ไม่มีภาษานำหน้า สคริปต์จะพาไป /th/... หรือ /en/... ให้เอง
export default function GlobalNotFound() {
  const { th, en } = dict
  return (
    <html lang="th">
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_REDIRECT_JS }} />
      </head>
      <body className="font-body text-ink antialiased">
        <section className="dotted-bg flex min-h-dvh items-center justify-center px-4 text-center">
          <div className="card max-w-md -rotate-1 p-8">
            <p className="text-6xl">🧭</p>
            <h1 className="mt-3 text-4xl font-bold">
              {th.notFound.title} · {en.notFound.title}
            </h1>
            <p className="mt-3 text-ink-soft">{th.notFound.text}</p>
            <p className="text-ink-soft">{en.notFound.text}</p>
            <p className="mt-2 text-lg">(error 404)</p>
            <div className="mt-6 flex justify-center gap-2">
              <Link href="/th" className="btn">
                {th.notFound.back}
              </Link>
              <Link href="/en" className="btn btn-paper">
                {en.notFound.back}
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}
