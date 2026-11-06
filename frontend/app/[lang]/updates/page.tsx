import type { Metadata } from 'next'
import Link from '@/components/Link'
import { Container, EmptyState, PageHero } from '@/components/ui'
import type { NewItem, NewKind } from '@/components/home/WhatsNew'
import { getAgents, getBundles, getBuddies, getMaps, getPlayerCards, getSprays, getWeapons } from '@/lib/api'
import { seenPatches, shortPatch } from '@/lib/first-seen'
import { newItems } from '@/lib/home-data'
import { dateLocale } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'

// ของใหม่แยกตามแพตช์: API ไม่มี patch notes เลยใช้ first-seen.json (scripts/first-seen.mjs จดทุกครั้งที่ build)
// ของแต่ละชิ้นอยู่ในแพตช์ล่าสุดที่เว็บเห็นก่อนหรือวันเดียวกับที่ของชิ้นนั้นโผล่มา

const ORDER: NewKind[] = ['agents', 'maps', 'bundles', 'skins', 'cards', 'sprays', 'buddies']
const KIND_HREF: Record<NewKind, string> = {
  agents: '/agents',
  maps: '/maps',
  skins: '/weapons',
  bundles: '/bundles',
  cards: '/collection/cards',
  sprays: '/collection/sprays',
  buddies: '/collection/buddies',
}
/** โชว์ต่อหมวดต่อแพตช์ไม่เกินเท่านี้ ที่เหลือลิงก์ไปหน้าหมวด */
const PER_KIND = 24
/** ของที่โผล่ก่อนแพตช์แรกที่จดได้ไม่เกินกี่วัน ยังนับรวมในแพตช์แรก (เช่นเอเจนต์ที่ออกก่อนเริ่มจดไม่กี่วัน) */
const GRACE_DAYS = 30

export async function generateMetadata({ params }: PageProps<'/[lang]/updates'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/updates', { title: seoTitles[lang].updates, description: seoDescriptions[lang].updates })
}

export default async function UpdatesPage({ params }: PageProps<'/[lang]/updates'>) {
  const { lang, t } = await getI18n(params)
  const u = t.updates
  const [agents, weapons, maps, bundles, cards, sprays, buddies] = await Promise.all([
    getAgents(lang),
    getWeapons(lang),
    getMaps(lang),
    getBundles(lang),
    getPlayerCards(lang),
    getSprays(lang),
    getBuddies(lang),
  ])
  const items = newItems({ agents, weapons, maps, bundles, cards, sprays, buddies }, Infinity)
  const patches = seenPatches()
  const fmt = (day: number) => new Date(day * 86_400_000).toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' })

  // จับของเข้าแพตช์: แพตช์ล่าสุดที่ day <= วันที่ของโผล่
  const groups = patches.map((p) => ({ ...p, items: [] as NewItem[] }))
  for (const item of items) {
    let g = null
    for (const x of groups) if (x.day <= item.day) g = x
    if (!g && groups[0] && groups[0].day - item.day <= GRACE_DAYS) g = groups[0]
    g?.items.push(item)
  }
  const shown = groups.filter((g) => g.items.length).reverse()
  const tracked = patches.find((p) => p.day > 0)

  return (
    <>
      <PageHero
        en="Patch log"
        title={u.title}
        description={u.desc}
        note={u.note}
      />
      <Container className="py-10 md:py-14">
        {tracked && <p className="mb-8 max-w-3xl text-sm text-ink-soft">{u.since(fmt(tracked.day))}</p>}
        {shown.length === 0 && <EmptyState text={u.empty} />}

        <div className="space-y-14">
          {shown.map((g) => (
            <section key={g.version} aria-labelledby={`p-${g.version}`}>
              <div className="rule-double" aria-hidden />
              <div className="flex flex-wrap items-baseline justify-between gap-3 py-2">
                <h2 id={`p-${g.version}`} className="font-display text-3xl font-bold sm:text-4xl">
                  {u.patch(shortPatch(g.version))}
                </h2>
                <p className="font-mono text-sm text-blue">
                  {g.day > 0 && `${u.seenOn(fmt(g.day))} · `}
                  {u.total(g.items.length)}
                </p>
              </div>
              <div className="rule-double mb-6" aria-hidden />

              <div className="space-y-8">
                {ORDER.map((kind) => {
                  const list = g.items.filter((i) => i.kind === kind).sort((a, b) => b.day - a.day || a.name.localeCompare(b.name))
                  if (!list.length) return null
                  const contain = kind === 'skins' || kind === 'buddies' || kind === 'sprays'
                  return (
                    <div key={kind}>
                      <h3 className="mb-3 flex items-baseline gap-2 font-display text-xl font-bold">
                        {u.kinds[kind]}
                        <span className="font-mono text-sm font-normal text-ink-soft">{list.length}</span>
                      </h3>
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {list.slice(0, PER_KIND).map((item) => (
                          <li key={item.uuid}>
                            <Link href={item.href} className="card card-hover block h-full p-2">
                              <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-md ${contain ? 'skeleton-dark p-2' : 'skeleton'}`}>
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className={contain ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover object-top'}
                                  />
                                )}
                              </div>
                              <p className="mt-1.5 line-clamp-2 px-0.5 text-sm leading-snug font-semibold">{item.name}</p>
                              {item.sub && <p className="truncate px-0.5 text-xs text-ink-soft">{item.sub}</p>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {list.length > PER_KIND && (
                        <Link href={KIND_HREF[kind]} className="mt-3 inline-block font-mono text-sm text-blue underline underline-offset-4">
                          {u.more(list.length - PER_KIND)}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  )
}
