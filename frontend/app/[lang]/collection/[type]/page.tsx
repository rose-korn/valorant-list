import type { Metadata } from 'next'
import Link from '@/components/Link'
import { notFound } from 'next/navigation'
import { BackLink, Container, EmptyState, PageHero } from '@/components/ui'
import { pageMeta, seoTitles } from '@/lib/seo'
import { getI18n } from '@/lib/i18n-server'
import { KINDS, getCollection, isKind } from '../data'
import { BUILT_AT } from '@/lib/first-seen'
import CollectionGrid from './CollectionGrid'

// build ทุกหน้าไว้ล่วงหน้า (static export) อันที่ไม่อยู่ในลิสต์ = 404
export const generateStaticParams = () => KINDS.map((type) => ({ type }))
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[lang]/collection/[type]'>): Promise<Metadata> {
  const { lang, t } = await getI18n(params)
  const { type } = await params
  if (!isKind(type)) return { title: t.collection.title }
  const [name, desc] = t.collection.kinds[type]
  return pageMeta(lang, `/collection/${type}`, { title: seoTitles[lang].collectionKind(name), description: `${name}: ${desc}` })
}

export default async function CollectionTypePage({ params }: PageProps<'/[lang]/collection/[type]'>) {
  const { lang, t } = await getI18n(params)
  const { type } = await params
  if (!isKind(type)) notFound()
  const items = await getCollection(lang, type)
  const c = t.collection

  return (
    <>
      <PageHero en={c.title} title={c.kinds[type][0]} description={c.kinds[type][1]} facts={[{ label: c.unit, value: items.length.toLocaleString() }]}>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <BackLink href="/collection" label={c.title} />
          <span className="mx-1 text-ink-soft">/</span>
          {KINDS.map((k) => (
            <Link key={k} href={`/collection/${k}`} className={`chip ${k === type ? '!bg-ink !text-paper' : 'hover:!bg-mustard/50'}`}>
              {c.kinds[k][0]}
            </Link>
          ))}
        </div>
      </PageHero>
      <Container className="py-10 md:py-14">{items.length ? <CollectionGrid kind={type} items={items} builtAt={BUILT_AT} /> : <EmptyState text={t.common.empty} />}</Container>
    </>
  )
}
