import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackLink, Container, EmptyState, PageHero } from '@/components/ui'
import { COLLECTIONS, type CollectionKind, getCollection } from '../data'
import CollectionGrid from './CollectionGrid'

const KINDS = Object.keys(COLLECTIONS) as CollectionKind[]
const isKind = (v: string): v is CollectionKind => (KINDS as string[]).includes(v)

export const dynamicParams = false

export function generateStaticParams() {
  return KINDS.map((type) => ({ type }))
}

export async function generateMetadata({ params }: PageProps<'/collection/[type]'>): Promise<Metadata> {
  const { type } = await params
  return { title: isKind(type) ? COLLECTIONS[type].th : 'ของสะสม' }
}

export default async function CollectionTypePage({ params }: PageProps<'/collection/[type]'>) {
  const { type } = await params
  if (!isKind(type)) notFound()
  const items = await getCollection(type)
  const meta = COLLECTIONS[type]

  return (
    <>
      <PageHero en={meta.title} title={meta.th} description={meta.description} facts={[{ label: 'ชิ้น', value: items.length.toLocaleString() }]}>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <BackLink href="/collection" label="ของสะสม" />
          <span className="mx-1 text-ink-soft">/</span>
          {KINDS.map((k) => (
            <Link key={k} href={`/collection/${k}`} className={`chip ${k === type ? '!bg-ink !text-paper' : 'hover:!bg-mustard/50'}`}>
              {COLLECTIONS[k].th}
            </Link>
          ))}
        </div>
      </PageHero>
      <Container className="py-10 md:py-14">{items.length ? <CollectionGrid kind={type} items={items} /> : <EmptyState />}</Container>
    </>
  )
}
