import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import HScroller from '@/components/HScroller'
import MapViewer3D from '@/components/three/MapViewer3D'
import { BackLink, Container, SectionHeading } from '@/components/ui'
import { getMap, getMaps } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { isCompetitiveMap, type GameMap } from '@/lib/valorant'

export async function generateMetadata({ params }: PageProps<'/maps/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const map = await getMap(uuid)
  return { title: map?.displayName ?? 'Map', description: map?.narrativeDescription ?? undefined }
}

export default async function MapPage({ params }: PageProps<'/maps/[uuid]'>) {
  const { uuid } = await params
  const [map, all, { t }] = await Promise.all([getMap(uuid), getMaps(), getI18n()])
  if (!map) notFound()

  const grouped = Object.entries(
    (map.callouts ?? []).reduce<Record<string, string[]>>((acc, c) => {
      ;(acc[c.superRegionName] ??= []).push(c.regionName)
      return acc
    }, {}),
  )
  // ลำดับเดียวกับหน้ารวมแผนที่: แผนที่แรงค์ก่อน แล้วค่อยโหมดอื่น (เรียงตามชื่อ)
  const byName = (a: GameMap, b: GameMap) => a.displayName.localeCompare(b.displayName)
  const withArt = all.filter((m) => m.splash)
  const ordered = [...withArt.filter(isCompetitiveMap).sort(byName), ...withArt.filter((m) => !isCompetitiveMap(m)).sort(byName)]
  const idx = ordered.findIndex((m) => m.uuid === map.uuid)
  const prev = idx >= 0 && ordered.length > 1 ? ordered[(idx - 1 + ordered.length) % ordered.length] : null
  const next = idx >= 0 && ordered.length > 1 ? ordered[(idx + 1) % ordered.length] : null
  const others = ordered.filter((m) => m.uuid !== map.uuid && isCompetitiveMap(m) === isCompetitiveMap(map))
  const gallery = [map.splash, map.stylizedBackgroundImage, map.premierBackgroundImage].filter(Boolean) as string[]

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="grid gap-8 py-8 md:py-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BackLink href="/maps" label={t.maps.back} />
              {prev && next && (
                <div className="flex gap-2">
                  <MapStep map={prev} dir="prev" label={t.maps.prev} />
                  <MapStep map={next} dir="next" label={t.maps.next} />
                </div>
              )}
            </div>
            <h1 className="mt-4 animate-fade-up text-6xl font-bold sm:text-7xl">{map.displayName}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {map.tacticalDescription && <span className="chip">{map.tacticalDescription}</span>}
              {map.callouts?.length ? <span className="chip">
                  {map.callouts.length} {t.maps.callouts}
                </span> : null}
              {map.coordinates && <span className="chip font-mono text-xs">{map.coordinates}</span>}
            </div>
            {map.narrativeDescription && <p className="mt-5 max-w-xl text-lg text-ink-soft">{map.narrativeDescription}</p>}
          </div>
          {map.splash && (
            <div className="card tape rotate-1 p-2.5">
              <img src={map.splash} alt={map.displayName} className="aspect-video w-full rounded-md object-cover" />
            </div>
          )}
        </Container>
      </section>

      {/* ================= 3D TACTICAL MAP ================= */}
      {map.displayIcon && (
        <section className="py-12 md:py-16">
          <Container>
            <SectionHeading title={t.maps.view3d} note={t.maps.view3dNote} />
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="screen h-[68svh] min-h-[400px]">
                <MapViewer3D map={map} className="h-full w-full" />
              </div>

              {grouped.length > 0 && (
                <aside className="card soft-scroll max-h-[68svh] overflow-y-auto p-5">
                  <p className="mb-4 font-display text-xl font-bold">{t.maps.allCallouts}</p>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-1">
                    {grouped.map(([region, names]) => (
                      <div key={region}>
                        <p className="mb-1 font-display font-bold text-red-ink">{region}</p>
                        <ul className="space-y-0.5 text-ink-soft">
                          {names.map((n, i) => (
                            <li key={`${n}-${i}`}>• {n}</li>
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
        <section className="border-y-2 border-ink bg-paper-2 py-12 md:py-16">
          <Container>
            <SectionHeading title={t.maps.gallery} />
            <div className="grid gap-6 sm:grid-cols-2">
              {gallery.slice(1).map((src, i) => (
                <a key={src} href={src} target="_blank" rel="noreferrer" className={`card card-hover block p-2.5 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                  <img src={src} alt="" loading="lazy" className="max-h-[380px] w-full rounded-md object-cover" />
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= OTHER MAPS ================= */}
      {others.length > 0 && (
        <Container className="py-12">
          <p className="mb-4 font-display text-xl font-bold">{t.maps.more}</p>
          <HScroller className="soft-scroll -mx-4 flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 pt-1 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0">
            {others.map((m) => (
              <Link key={m.uuid} href={`/maps/${m.uuid}`} className="card card-hover block w-56 shrink-0 snap-start p-2">
                <div className="aspect-video overflow-hidden rounded-md skeleton-dark">
                  <img src={m.listViewIcon ?? m.splash ?? ''} alt={m.displayName} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <p className="px-1 pt-1.5 font-display font-bold">{m.displayName}</p>
              </Link>
            ))}
          </HScroller>
        </Container>
      )}
    </>
  )
}

/** ปุ่มไปแผนที่ก่อนหน้า/ถัดไป มีรูปเล็ก + ชื่อ ให้รู้ว่ากดแล้วจะไปไหน */
function MapStep({ map, dir, label }: { map: GameMap; dir: 'prev' | 'next'; label: string }) {
  return (
    <Link
      href={`/maps/${map.uuid}`}
      aria-label={`${label}: ${map.displayName}`}
      className={`card card-hover flex items-center gap-2 py-1.5 ${dir === 'prev' ? 'pr-3 pl-2' : 'flex-row-reverse pr-2 pl-3'}`}
    >
      <span className="font-display text-lg font-bold">{dir === 'prev' ? '◀' : '▶'}</span>
      <img src={map.listViewIcon ?? map.splash ?? ''} alt="" className="h-8 w-14 rounded object-cover max-sm:hidden" />
      <span className={`leading-tight ${dir === 'next' ? 'text-right' : ''}`}>
        <span className="block text-[11px] text-ink-soft">{label}</span>
        <span className="block font-display font-bold">{map.displayName}</span>
      </span>
    </Link>
  )
}
