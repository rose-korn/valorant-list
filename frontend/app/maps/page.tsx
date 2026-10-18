import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getMaps, isCompetitiveMap } from '@/lib/valorant'

export const metadata: Metadata = { title: 'แผนที่' }

const tilt = (i: number) => ['-rotate-1', 'rotate-1', 'rotate-[0.5deg]', '-rotate-[1.5deg]'][i % 4]
const tapes = ['', 'tape-teal', 'tape-red']

export default async function MapsPage() {
  const maps = (await getMaps()).filter((m) => m.splash)
  const competitive = maps.filter(isCompetitiveMap).sort((a, b) => a.displayName.localeCompare(b.displayName))
  const others = maps.filter((m) => !isCompetitiveMap(m)).sort((a, b) => a.displayName.localeCompare(b.displayName))
  const calloutTotal = maps.reduce((n, m) => n + (m.callouts?.length ?? 0), 0)

  return (
    <>
      <PageHero
        en="Maps"
        title="แผนที่"
        description="ทุกสนามในเกม กดเข้าไปจะมีแผนที่ 3D ให้หมุนดู พร้อมชื่อ callout ทุกจุด เอาไว้คุยกับทีมให้รู้เรื่อง"
        facts={[
          { label: 'แผนที่', value: maps.length },
          { label: 'แผนที่แรงค์', value: competitive.length },
          { label: 'callout', value: calloutTotal },
        ]}
      />

      {maps.length === 0 ? (
        <Container className="py-14">
          <EmptyState />
        </Container>
      ) : (
        <>
          <section className="py-12 md:py-16">
            <Container>
              <SectionHeading title="แผนที่วางระเบิด" note="ใช้ในโหมด Competitive / Unrated" />
              <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                {competitive.map((m, i) => (
                  <Reveal key={m.uuid} delay={(i % 3) * 70}>
                    <Link href={`/maps/${m.uuid}`} className={`card card-hover tape group block p-2.5 ${tapes[i % 3]} ${tilt(i)}`}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink">
                        <img src={m.splash ?? ''} alt={m.displayName} loading="lazy" className="h-full w-full object-cover" />
                        {m.displayIcon && (
                          <img
                            src={m.displayIcon}
                            alt=""
                            loading="lazy"
                            className="absolute right-2 bottom-2 h-20 w-20 rounded-lg bg-ink/70 object-contain p-1 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        )}
                      </div>
                      <div className="px-1 pt-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-display text-2xl font-bold">{m.displayName}</p>
                          <p className="text-sm text-ink-soft">{m.callouts?.length ?? 0} callout</p>
                        </div>
                        <p className="text-sm text-ink-soft">{m.tacticalDescription}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>

          {others.length > 0 && (
            <section className="border-t-2 border-ink bg-paper-2 py-12 md:py-16">
              <Container>
                <SectionHeading title="แผนที่โหมดอื่น ๆ" note="Deathmatch, TDM, Skirmish ฯลฯ" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {others.map((m) => (
                    <Link key={m.uuid} href={`/maps/${m.uuid}`} className="card card-hover block p-2">
                      <div className="aspect-video overflow-hidden rounded-md bg-ink">
                        <img src={m.listViewIcon ?? m.splash ?? ''} alt={m.displayName} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                      <p className="px-1 pt-1.5 font-display font-bold">{m.displayName}</p>
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
