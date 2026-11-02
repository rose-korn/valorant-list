'use client'

import Link from '@/components/Link'
import { useI18n } from '@/components/LangProvider'
import { Crosshair } from '@/components/brand'

// not-found ไม่ได้รับ params เลยอ่านภาษาจาก context ที่ layout ส่งมา
export default function NotFound() {
  const { t } = useI18n()
  return (
    <section className="dotted-bg flex min-h-[75svh] items-center justify-center px-4 text-center">
      <div className="card max-w-md p-8">
        <Crosshair className="mx-auto h-16 w-16 text-ink" />
        <h1 className="mt-3 text-5xl font-bold">{t.notFound.title}</h1>
        <p className="mt-3 text-ink-soft">{t.notFound.text}</p>
        <p className="hand mt-2 text-lg">(error 404)</p>
        <Link href="/" className="btn mt-6">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  )
}
