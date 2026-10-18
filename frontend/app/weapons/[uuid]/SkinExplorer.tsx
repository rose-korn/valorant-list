'use client'

import { useEffect, useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'
import { Container, Eyebrow } from '@/components/ui'

export interface TierInfo {
  uuid: string
  name: string
  icon: string
  color: string
  rank: number
}

export interface SkinItem {
  uuid: string
  displayName: string
  tier: string | null
  image: string | null
  wallpaper: string | null
  chromas: { uuid: string; displayName: string; image: string | null; swatch: string | null; video: string | null }[]
  levels: { uuid: string; displayName: string; levelItem: string | null; video: string | null }[]
}

const PAGE = 24

export default function SkinExplorer({
  weaponName,
  skins,
  tiers,
  children,
}: {
  weaponName: string
  skins: SkinItem[]
  tiers: TierInfo[]
  children?: React.ReactNode
}) {
  const [selected, setSelected] = useState(skins[0])
  const [chroma, setChroma] = useState(0)
  const [tier, setTier] = useState('ALL')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [video, setVideo] = useState<{ src: string; title: string } | null>(null)

  const tierOf = (uuid: string | null) => tiers.find((t) => t.uuid === uuid)
  const t = tierOf(selected.tier)
  const accent = t?.color ?? '#ff4654'
  const image = selected.chromas[chroma]?.image ?? selected.image

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return skins.filter((s) => (tier === 'ALL' || s.tier === tier) && (!q || s.displayName.toLowerCase().includes(q)))
  }, [skins, tier, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setVideo(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pick = (s: SkinItem) => {
    setSelected(s)
    setChroma(0)
    document.getElementById('skin-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const levelVideos = selected.levels.filter((l) => l.video)

  return (
    <>
      {/* ================= VIEWER ================= */}
      <section id="skin-viewer" className="relative scroll-mt-16 overflow-hidden">
        {selected.wallpaper && (
          <img src={selected.wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        )}
        <div className="absolute inset-0 transition-colors duration-700" style={{ background: `radial-gradient(ellipse at 50% 60%, ${accent}26, transparent 65%)` }} />
        <Container className="relative grid gap-6 py-8 lg:grid-cols-[1fr_360px] lg:py-12">
          <div className="val-corners h-[48svh] min-h-[300px] border border-white/10 md:h-[60svh]">
            <Viewer3D src={image} alt={selected.displayName} accent={accent} variant="weapon" className="h-full w-full !bg-transparent" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {t && <img src={t.icon} alt="" className="h-6 w-6" />}
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>
                {t?.name ?? 'Standard'}
              </span>
            </div>
            <h2 key={selected.uuid} className="mt-2 animate-fade-up font-display text-4xl leading-none text-val-cream uppercase md:text-5xl">
              {selected.chromas[chroma] && chroma > 0 ? selected.chromas[chroma].displayName : selected.displayName}
            </h2>

            {selected.chromas.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Variants · {selected.chromas.length}</p>
                <div className="flex flex-wrap gap-2">
                  {selected.chromas.map((c, i) => (
                    <button
                      key={c.uuid}
                      onClick={() => setChroma(i)}
                      title={c.displayName}
                      className={`h-12 w-12 overflow-hidden border-2 bg-white/5 transition-all ${
                        chroma === i ? 'scale-110 border-val-red' : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      {c.swatch ? (
                        <img src={c.swatch} alt={c.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-sm text-val-cream/70">{i + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
                {selected.chromas[chroma]?.video && (
                  <button
                    onClick={() => setVideo({ src: selected.chromas[chroma].video!, title: selected.chromas[chroma].displayName })}
                    className="mt-3 text-xs tracking-widest text-val-red uppercase hover:text-white"
                  >
                    ▶ ดูวิดีโอ variant นี้
                  </button>
                )}
              </div>
            )}

            {selected.levels.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Upgrade levels · {selected.levels.length}</p>
                <ol className="space-y-1.5">
                  {selected.levels.map((l, i) => (
                    <li key={l.uuid} className="flex items-center gap-3 border border-white/5 bg-white/[0.02] px-3 py-2">
                      <span className="font-display text-val-red">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-val-cream/80">{l.displayName}</span>
                        {l.levelItem && (
                          <span className="text-[10px] tracking-wider text-val-cream/35 uppercase">{l.levelItem.split('::')[1] ?? l.levelItem}</span>
                        )}
                      </span>
                      {l.video && (
                        <button
                          onClick={() => setVideo({ src: l.video!, title: l.displayName })}
                          className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 text-xs text-val-cream hover:border-val-red hover:bg-val-red"
                          aria-label={`เล่นวิดีโอ ${l.displayName}`}
                        >
                          ▶
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {selected.uuid === 'default' && (
              <p className="mt-6 font-thai text-sm font-light text-val-cream/50">
                เลือกสกินด้านล่างเพื่อดูแบบ 3D — {skins.length - 1} ลายสำหรับ {weaponName}
              </p>
            )}
            {levelVideos.length > 0 && selected.levels.length <= 1 && (
              <button onClick={() => setVideo({ src: levelVideos[0].video!, title: selected.displayName })} className="val-btn-ghost mt-6 self-start">
                ▶ Preview video
              </button>
            )}
          </div>
        </Container>
      </section>

      {children}

      {/* ================= SKIN GALLERY ================= */}
      <section className="py-14 md:py-20">
        <Container>
          <Eyebrow className="mb-6">Skins</Eyebrow>
          <FilterBar search={<SearchInput value={query} onChange={(v) => { setQuery(v); setLimit(PAGE) }} placeholder="ค้นหาสกิน..." />}>
            <FilterButton active={tier === 'ALL'} onClick={() => { setTier('ALL'); setLimit(PAGE) }}>
              All
            </FilterButton>
            {tiers.map((x) => (
              <FilterButton key={x.uuid} active={tier === x.uuid} onClick={() => { setTier(x.uuid); setLimit(PAGE) }}>
                <img src={x.icon} alt="" className="h-4 w-4" />
                {x.name}
              </FilterButton>
            ))}
          </FilterBar>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {list.slice(0, limit).map((s) => {
              const st = tierOf(s.tier)
              const on = s.uuid === selected.uuid
              return (
                <li key={s.uuid}>
                  <button
                    onClick={() => pick(s)}
                    className={`group relative flex h-full w-full flex-col overflow-hidden border p-3 text-left transition-colors md:p-4 ${
                      on ? 'border-val-red bg-val-red/10' : 'border-white/8 bg-white/[0.02] hover:border-white/30'
                    }`}
                  >
                    <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: st?.color ?? 'transparent' }} />
                    <span className="flex h-20 items-center justify-center md:h-24">
                      {s.image && (
                        <img src={s.image} alt={s.displayName} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                      )}
                    </span>
                    <span className="mt-3 flex items-center gap-2">
                      {st && <img src={st.icon} alt="" className="h-4 w-4 shrink-0" />}
                      <span className="line-clamp-2 text-xs leading-tight text-val-cream/80 md:text-sm">{s.displayName}</span>
                    </span>
                    {s.chromas.length > 1 && (
                      <span className="mt-1 text-[10px] tracking-wider text-val-cream/35 uppercase">{s.chromas.length} variants</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          {list.length === 0 && <p className="py-16 text-center font-thai text-val-cream/40">ไม่พบสกิน</p>}
          {list.length > limit && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setLimit((l) => l + PAGE)} className="val-btn-ghost">
                โหลดเพิ่ม ({list.length - limit})
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* ================= VIDEO MODAL ================= */}
      {video && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black/90 p-4" onClick={() => setVideo(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="truncate font-display text-xl text-val-cream uppercase md:text-2xl">{video.title}</p>
              <button onClick={() => setVideo(null)} className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 hover:border-val-red hover:bg-val-red" aria-label="ปิด">
                ✕
              </button>
            </div>
            <video key={video.src} src={video.src} autoPlay controls playsInline className="aspect-video w-full bg-black" />
          </div>
        </div>
      )}
    </>
  )
}
