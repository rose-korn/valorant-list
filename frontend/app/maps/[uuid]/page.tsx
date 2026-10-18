import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MapViewer3D from '@/components/three/MapViewer3D'
import { BackLink, Container, Eyebrow, SectionHeading } from '@/components/ui'
import { getMap, getMaps, isCompetitiveMap } from '@/lib/valorant'

export async function generateStaticParams() {
  const maps = await getMaps()
  return maps.map((m) => ({ uuid: m.uuid }))
}

export async function generateMetadata({ params }: PageProps<'/maps/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const map = await getMap(uuid)
  return { title: map ? `${map.displayName} — Map` : 'Map', description: map?.narrativeDescription ?? undefined }
}

export default async function MapPage({ params }: PageProps<'/maps/[uuid]'>) {
  const { uuid } = await params
  const [map, all] = await Promise.all([getMap(uuid), getMaps()])
  if (!map) notFound()

  const grouped = Object.entries(
    (map.callouts ?? []).reduce<Record<string, string[]>>((acc, c) => {
      ;(acc[c.superRegionName] ??= []).push(c.regionName)
      return acc
    }, {}),
  )
  const others = all.filter((m) => isCompetitiveMap(m) && m.uuid !== map.uuid).slice(0, 8)
  const gallery = [map.splash, map.stylizedBackgroundImage, map.premierBackgroundImage, map.listViewIconTall].filter(Boolean) as string[]

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative -mt-16 flex min-h-[70svh] items-end overflow-hidden pt-16 md:min-h-[85svh]">
        {map.splash && <img src={map.splash} alt={map.displayName} className="absolute inset-0 h-full w-full animate-fade-in object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-val-ink via-val-ink/40 to-val-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-val-ink/80 to-transparent" />
        <Container className="relative w-full pb-10 md:pb-16">
          <BackLink href="/maps" label="All maps" />
          <p className="mt-6 mb-2 font-mono text-xs tracking-widest text-val-red">{map.coordinates}</p>
          <h1 className="animate-fade-up font-display text-[22vw] leading-[0.8] tracking-tight text-val-cream uppercase sm:text-[9rem] lg:text-[12rem]">
            {map.displayName}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {map.tacticalDescription && <span className="val-chip">{map.tacticalDescription}</span>}
            {map.callouts?.length ? <span className="val-chip">{map.callouts.length} callouts</span> : null}
          </div>
          {map.narrativeDescription && (
            <p className="mt-5 max-w-2xl font-thai leading-relaxed font-light text-val-cream/75">{map.narrativeDescription}</p>
          )}
        </Container>
      </section>

      {/* ================= 3D TACTICAL MAP ================= */}
      {map.displayIcon && (
        <section className="relative border-t border-white/5 py-14 md:py-20">
          <Container>
            <SectionHeading index="Tactical View" title="3D Map" th="แผนที่ยุทธวิธีแบบ 3D — กดเลือกโซนเพื่อไฮไลต์ callout" />
            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <MapViewer3D map={map} className="val-corners h-[70svh] min-h-[420px] border border-white/10" />

              {grouped.length > 0 && (
                <aside className="val-panel val-scroll max-h-[70svh] overflow-y-auto p-5">
                  <Eyebrow className="mb-4">Callouts</Eyebrow>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    {grouped.map(([region, names]) => (
                      <div key={region}>
                        <p className="mb-1.5 font-display text-sm tracking-[0.2em] text-val-red uppercase">{region}</p>
                        <ul className="space-y-1">
                          {names.map((n, i) => (
                            <li key={`${n}-${i}`} className="border-l border-white/10 pl-2 text-sm text-val-cream/65">
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ================= GALLERY ================= */}
      {gallery.length > 1 && (
        <section className="border-t border-white/5 bg-val-deep py-14 md:py-20">
          <Container>
            <SectionHeading index="Gallery" title="Artwork" th="ภาพประกอบของแผนที่" />
            <div className="grid gap-3 sm:grid-cols-2">
              {gallery.map((src) => (
                <a key={src} href={src} target="_blank" rel="noreferrer" className="group block overflow-hidden bg-val-panel">
                  <img src={src} alt="" loading="lazy" className="h-full max-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= OTHER MAPS ================= */}
      {others.length > 0 && (
        <section className="border-t border-white/5 py-14">
          <Container>
            <Eyebrow className="mb-5">More maps</Eyebrow>
            <div className="val-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
              {others.map((m) => (
                <Link key={m.uuid} href={`/maps/${m.uuid}`} className="group relative block aspect-video w-60 shrink-0 overflow-hidden md:w-72">
                  <img src={m.listViewIcon ?? m.splash ?? ''} alt={m.displayName} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-2 left-3 font-display text-2xl text-val-cream uppercase">{m.displayName}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
