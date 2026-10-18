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
  return { title: isKind(type) ? COLLECTIONS[type].title : 'Collection' }
}

export default async function CollectionTypePage({ params }: PageProps<'/collection/[type]'>) {
  const { type } = await params
  if (!isKind(type)) notFound()
  const items = await getCollection(type)
  const meta = COLLECTIONS[type]

  return (
    <>
      <PageHero eyebrow="Collection" title={meta.title} th={meta.th} description={meta.description} stats={[{ label: 'Items', value: items.length.toLocaleString() }]}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <BackLink href="/collection" label="Collection" />
          <span className="h-4 w-px bg-white/15" />
          {KINDS.map((k) => (
            <Link
              key={k}
              href={`/collection/${k}`}
              className={`font-display text-sm tracking-[0.15em] uppercase transition-colors ${k === type ? 'text-val-red' : 'text-val-cream/50 hover:text-white'}`}
            >
              {COLLECTIONS[k].title}
            </Link>
          ))}
        </div>
      </PageHero>
      <Container className="py-10 md:py-14">{items.length ? <CollectionGrid kind={type} items={items} /> : <EmptyState />}</Container>
    </>
  )
}
