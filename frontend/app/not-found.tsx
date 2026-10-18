import Link from 'next/link'
import { getI18n } from '@/lib/i18n-server'

export default async function NotFound() {
  const { t } = await getI18n()
  return (
    <section className="dotted-bg flex min-h-[75svh] items-center justify-center px-4 text-center">
      <div className="card max-w-md -rotate-1 p-8">
        <p className="text-6xl">🧭</p>
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
