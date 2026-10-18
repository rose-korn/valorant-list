import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { type GameMap, getMaps, isCompetitiveMap } from '@/lib/valorant'

export const metadata: Metadata = { title: 'Maps' }

export default async function MapsPage() {
  const maps = (await getMaps()).filter((m) => m.splash)
  const competitive = maps.filter(isCompetitiveMap).sort((a, b) => a.displayName.localeCompare(b.displayName))
  const others = maps.filter((m) => !isCompetitiveMap(m)).sort((a, b) => a.displayName.localeCompare(b.displayName))
  const calloutTotal = maps.reduce((n, m) => n + (m.callouts?.length ?? 0), 0)

  return (
    <>
      <PageHero
        eyebrow="Maps"
        title="Maps"
        th="แผนที่"
        description="สำรวจทุกสนาม — เปิดดูแผนที่ยุทธวิธีแบบ 3D พร้อมจุด callout ที่หมุน ซูม และกรองตามโซนได้"
        image={competitive[0]?.splash}
        stats={[
          { label: 'Total maps', value: maps.length },
          { label: 'Competitive', value: competitive.length },
          { label: 'Callouts', value: calloutTotal },
        ]}
      />

      {maps.length === 0 ? (
        <Container className="py-16">
          <EmptyState />
        </Container>
      ) : (
        <>
          <section className="py-14 md:py-20">
            <Container>
              <SectionHeading index="Standard / Competitive" title="Tactical Maps" th="แผนที่สำหรับโหมดวางระเบิด" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {competitive.map((m, i) => (
                  <Reveal key={m.uuid} delay={(i % 3) * 80}>
                    <MapCard map={m} />
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>

          {others.length > 0 && (
            <section className="border-t border-white/5 bg-val-deep py-14 md:py-20">
              <Container>
                <SectionHeading index="Other modes" title="Arenas & More" th="แผนที่ Team Deathmatch, Skirmish และโหมดพิเศษ" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {others.map((m) => (
                    <Link key={m.uuid} href={`/maps/${m.uuid}`} className="group relative block aspect-video overflow-hidden bg-val-panel">
                      <img
                        src={m.listViewIcon ?? m.splash ?? ''}
                        alt={m.displayName}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-70 grayscale transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <p className="absolute bottom-2 left-3 font-display text-xl text-val-cream uppercase md:text-2xl">{m.displayName}</p>
                    </Link>
                  ))}
                </div>
              </Container>
            </section>
          )}
        </>
      )}
    </>
  )
}

function MapCard({ map }: { map: GameMap }) {
  return (
    <Link href={`/maps/${map.uuid}`} className="group val-corners relative block aspect-[4/3] overflow-hidden bg-val-panel">
      <img
        src={map.splash ?? ''}
        alt={map.displayName}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-val-ink via-val-ink/30 to-transparent" />
      {map.displayIcon && (
        <img
          src={map.displayIcon}
          alt=""
          loading="lazy"
          className="absolute top-4 right-4 h-20 w-20 rotate-6 object-contain opacity-0 drop-shadow-[0_0_12px_rgba(0,0,0,.8)] transition-all duration-500 group-hover:rotate-0 group-hover:opacity-90 md:h-24 md:w-24"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] tracking-[0.3em] text-val-red uppercase">{map.tacticalDescription}</p>
        <p className="font-display text-4xl leading-none text-val-cream uppercase md:text-5xl">{map.displayName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-val-cream/50">{map.coordinates}</span>
          <span className="text-[10px] tracking-[0.2em] text-val-cream/50 uppercase">{map.callouts?.length ?? 0} callouts</span>
        </div>
      </div>
    </Link>
  )
}
