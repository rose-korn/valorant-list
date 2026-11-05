import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from '@/components/Link'
import { Container, PageHero } from '@/components/ui'
import { getI18n } from '@/lib/i18n-server'
import { LANGS, dateLocale } from '@/lib/i18n'
import { CONTACT_URL, LEGAL_DOCS, LEGAL_UPDATED, type LegalBlock, type LegalDoc, legal, legalUi } from '@/lib/legal'
import { clip, pageMeta } from '@/lib/seo'

// หน้ากฎหมาย 3 แท็บ: /legal/terms, /legal/privacy, /legal/cookies — เนื้อหาอยู่ใน lib/legal.ts
export const dynamicParams = false
export function generateStaticParams() {
  return LANGS.flatMap((lang) => LEGAL_DOCS.map((doc) => ({ lang, doc })))
}

const isDoc = (d: string): d is LegalDoc => (LEGAL_DOCS as readonly string[]).includes(d)

export async function generateMetadata({ params }: PageProps<'/[lang]/legal/[doc]'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  const { doc } = await params
  if (!isDoc(doc)) return {}
  const c = legal[lang][doc]
  return pageMeta(lang, `/legal/${doc}`, { title: c.title, description: clip(c.intro) })
}

/** [ข้อความ](url) → ลิงก์ ที่เหลือเป็นข้อความธรรมดา */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (!m) return p
        const cls = 'text-blue underline underline-offset-4 hover:text-red'
        return m[2].startsWith('/') ? (
          <Link key={i} href={m[2]} className={cls}>
            {m[1]}
          </Link>
        ) : (
          <a key={i} href={m[2]} target="_blank" rel="noreferrer" className={cls}>
            {m[1]}
          </a>
        )
      })}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string')
    return (
      <p>
        <Rich text={block} />
      </p>
    )
  if (Array.isArray(block))
    return (
      <ul className="list-disc space-y-1.5 pl-5 marker:text-red">
        {block.map((li) => (
          <li key={li}>
            <Rich text={li} />
          </li>
        ))}
      </ul>
    )
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-[1.5px] border-ink font-display">
            {block.head.map((h) => (
              <th key={h} className="py-2 pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line align-top">
              <td className="py-2 pr-4 font-mono text-xs break-all sm:text-sm">{k}</td>
              <td className="py-2">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function LegalPage({ params }: PageProps<'/[lang]/legal/[doc]'>) {
  const { lang } = await getI18n(params)
  const { doc } = await params
  if (!isDoc(doc)) notFound()
  const c = legal[lang][doc]
  const ui = legalUi[lang]
  const updated = new Date(LEGAL_UPDATED).toLocaleDateString(dateLocale(lang), { dateStyle: 'long' })

  return (
    <div>
      <PageHero en={c.en} title={c.title} description={c.intro} />
      <Container className="py-8 md:py-12">
        {/* 3 แท็บ สลับระหว่างหน้ากฎหมาย */}
        <nav aria-label={ui.heading} className="mb-6 flex flex-wrap gap-2">
          {LEGAL_DOCS.map((d) => (
            <Link
              key={d}
              href={`/legal/${d}`}
              aria-current={d === doc ? 'page' : undefined}
              className={`rounded-full border-2 px-4 py-1.5 font-display text-sm font-semibold leading-normal transition-colors ${
                d === doc ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink-soft hover:border-ink hover:text-ink'
              }`}
            >
              {legal[lang][d].tab}
            </Link>
          ))}
        </nav>

        <article className="card max-w-3xl space-y-8 px-5 py-6 leading-relaxed sm:px-8 sm:py-8">
          <p className="font-mono text-sm text-ink-soft">
            {ui.updated} {updated}
          </p>
          {c.sections.map((s) => (
            <section key={s.h} className="space-y-3">
              <h2 className="font-display text-xl font-bold sm:text-2xl">{s.h}</h2>
              {s.body.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </section>
          ))}
          <p className="border-t border-line pt-5 text-ink-soft">
            {ui.contact}{' '}
            <a href={CONTACT_URL} target="_blank" rel="noreferrer" className="text-blue underline underline-offset-4 hover:text-red">
              {ui.contactLink}
            </a>
          </p>
        </article>
      </Container>
    </div>
  )
}
