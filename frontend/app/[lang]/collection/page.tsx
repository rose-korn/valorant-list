import type { Metadata } from 'next'
import Link from '@/components/Link'
import Reveal from '@/components/Reveal'
import { Container, PageHero } from '@/components/ui'
import { getI18n } from '@/lib/i18n-server'
import { type CollectionKind, KINDS, getCollection } from './data'

export async function generateMetadata({ params }: PageProps<'/[lang]/collection'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.collection.title }
}

const EMOJI: Record<CollectionKind, string> = { cards: '🃏', sprays: '🎨', buddies: '🔑', titles: '🏷️' }
const BG: Record<CollectionKind, string> = { cards: '!bg-card', sprays: '!bg-mustard', buddies: '!bg-[#bfe8df]', titles: '!bg-[#ffd3d6]' }

export default async function CollectionPage({ params }: PageProps<'/[lang]/collection'>) {
  const { lang, t } = await getI18n(params)
  const kinds = KINDS
  const data = await Promise.all(kinds.map((k) => getCollection(lang, k)))
  const c = t.collection

  return (
    <>
      <PageHero
        en="Collection"
        title={c.title}
        description={c.desc}
        facts={kinds.map((k, i) => ({ label: c.kinds[k][0], value: data[i].length.toLocaleString() }))}
      />
      <Container className="py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {kinds.map((k, i) => {
            const items = data[i]
            // ดึงตัวอย่างจากหลาย ๆ ช่วงของ list ให้ดูหลากหลาย
            const samples = items.length ? [0, 1, 2, 3].map((n) => items[Math.floor((items.length / 4) * n)]).filter((x) => x?.thumb) : []
            return (
              <Reveal key={k} delay={i * 70}>
                <Link href={`/collection/${k}`} className={`card card-hover relative flex h-full min-h-56 flex-col overflow-hidden p-6 ${BG[k]} ${i % 2 ? 'rotate-[0.6deg]' : '-rotate-[0.6deg]'}`}>
                  <span className="text-4xl">{EMOJI[k]}</span>
                  <h2 className="mt-3 text-3xl font-bold">{c.kinds[k][0]}</h2>
                  <p className="mt-1 max-w-[16rem] text-ink-soft">{c.kinds[k][1]}</p>
                  <p className="mt-auto pt-4 font-display font-bold">{c.items(items.length)}</p>
                  <div className="pointer-events-none absolute right-4 bottom-4 flex items-end">
                    {samples.map((s, j) => (
                      <img
                        key={s.uuid}
                        src={s.thumb!}
                        alt=""
                        loading="lazy"
                        className={`sticker object-contain ${k === 'cards' ? 'h-24 w-auto rounded-sm md:h-28' : 'h-14 w-14 md:h-16 md:w-16'} ${j ? '-ml-4' : ''}`}
                        style={{ transform: `rotate(${(j - 1.5) * 8}deg)` }}
                      />
                    ))}
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </>
  )
}
