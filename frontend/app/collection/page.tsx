import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { Container, PageHero } from '@/components/ui'
import { COLLECTIONS, type CollectionKind, getCollection } from './data'

export const metadata: Metadata = { title: 'Collection' }

export default async function CollectionPage() {
  const kinds = Object.keys(COLLECTIONS) as CollectionKind[]
  const data = await Promise.all(kinds.map((k) => getCollection(k)))
  const total = data.reduce((n, d) => n + d.length, 0)

  return (
    <>
      <PageHero
        eyebrow="Cosmetics"
        title="Collection"
        th="คลังของสะสม"
        description="การ์ดผู้เล่น สเปรย์ พวงกุญแจปืน และฉายา — ทั้งหมดจากในเกม ค้นหาได้ และกดดูแบบ 3D"
        stats={kinds.map((k, i) => ({ label: COLLECTIONS[k].title, value: data[i].length.toLocaleString() }))}
      />
      <Container className="py-10 md:py-14">
        <p className="mb-6 text-xs tracking-[0.25em] text-val-cream/40 uppercase">{total.toLocaleString()} items</p>
        <div className="grid gap-4 md:grid-cols-2">
          {kinds.map((k, i) => {
            const items = data[i]
            // ดึงตัวอย่างจากหลาย ๆ ช่วงของ list ให้ดูหลากหลาย
            const samples = items.length ? [0, 1, 2, 3, 4].map((n) => items[Math.floor((items.length / 5) * n)]).filter((x) => x?.thumb) : []
            return (
              <Reveal key={k} delay={i * 80}>
                <Link href={`/collection/${k}`} className="group val-panel val-corners relative flex h-full min-h-64 flex-col overflow-hidden p-6 md:p-8">
                  <div className="pointer-events-none absolute -right-6 bottom-0 flex h-40 items-end gap-2 opacity-50 transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-90 md:h-48">
                    {k === 'titles'
                      ? items.slice(0, 4).map((t, j) => (
                          <span key={t.uuid} className="block font-display text-2xl whitespace-nowrap text-val-cream/30 uppercase" style={{ transform: `translateY(${-j * 36}px)` }}>
                            {t.name}
                          </span>
                        ))
                      : samples.map((s, j) => (
                          <img
                            key={s.uuid}
                            src={s.thumb!}
                            alt=""
                            loading="lazy"
                            className={`object-contain ${k === 'cards' ? 'h-full w-auto' : 'h-20 w-20 md:h-24 md:w-24'}`}
                            style={{ transform: `rotate(${(j - 2) * 4}deg)` }}
                          />
                        ))}
                  </div>
                  <p className="relative font-display text-6xl text-val-red/80">{items.length.toLocaleString()}</p>
                  <h2 className="relative mt-auto font-display text-4xl text-val-cream uppercase md:text-5xl">{COLLECTIONS[k].title}</h2>
                  <p className="relative mt-1 max-w-xs font-thai text-sm font-light text-val-cream/50">{COLLECTIONS[k].description}</p>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </>
  )
}
