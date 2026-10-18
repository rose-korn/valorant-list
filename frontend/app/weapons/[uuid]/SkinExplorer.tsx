'use client'

import { useEffect, useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'
import { Container, SectionHeading } from '@/components/ui'

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

  const resetPage = () => setLimit(PAGE)
  const levelVideos = selected.levels.filter((l) => l.video)
  const title = chroma > 0 && selected.chromas[chroma] ? selected.chromas[chroma].displayName : selected.displayName

  return (
    <>
      {/* ================= VIEWER ================= */}
      <section id="skin-viewer" className="scroll-mt-16 py-8 md:py-12">
        <Container className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="screen relative h-[44svh] min-h-[280px] md:h-[56svh]" style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}40, #1c1e24 72%)` }}>
            {selected.wallpaper && <img src={selected.wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />}
            <Viewer3D src={image} alt={selected.displayName} accent={accent} variant="weapon" className="h-full w-full" />
          </div>

          <div className="card flex flex-col p-5">
            <div className="flex items-center gap-2">
              {t ? (
                <span className="chip" style={{ background: `${t.color}33` }}>
                  <img src={t.icon} alt="" className="h-4 w-4" />
                  {t.name}
                </span>
              ) : (
                <span className="chip">ปืนเริ่มต้น</span>
              )}
            </div>
            <h2 key={title} className="mt-3 animate-fade-up text-2xl font-bold md:text-3xl">
              {title}
            </h2>

            {selected.chromas.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 font-semibold">สีให้เลือก ({selected.chromas.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selected.chromas.map((c, i) => (
                    <button
                      key={c.uuid}
                      onClick={() => setChroma(i)}
                      title={c.displayName}
                      aria-pressed={chroma === i}
                      className={`h-11 w-11 overflow-hidden rounded-lg border-2 transition-transform ${
                        chroma === i ? '-translate-y-1 border-ink shadow-[2px_3px_0_var(--color-ink)]' : 'border-line hover:border-ink'
                      }`}
                    >
                      {c.swatch ? <img src={c.swatch} alt={c.displayName} className="h-full w-full object-cover" /> : <span>{i + 1}</span>}
                    </button>
                  ))}
                </div>
                {selected.chromas[chroma]?.video && (
                  <button
                    onClick={() => setVideo({ src: selected.chromas[chroma].video!, title: selected.chromas[chroma].displayName })}
                    className="mt-3 font-semibold text-red-ink underline underline-offset-4"
                  >
                    ▶ ดูวิดีโอสีนี้
                  </button>
                )}
              </div>
            )}

            {selected.levels.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 font-semibold">อัปเกรดได้ {selected.levels.length} เลเวล</p>
                <ol className="space-y-1.5">
                  {selected.levels.map((l, i) => (
                    <li key={l.uuid} className="flex items-center gap-3 rounded-lg bg-paper-2 px-3 py-2">
                      <span className="font-display font-bold text-red-ink">Lv.{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{l.displayName}</span>
                      {l.video && (
                        <button
                          onClick={() => setVideo({ src: l.video!, title: l.displayName })}
                          className="shrink-0 rounded-md border-2 border-ink bg-card px-2 text-sm hover:bg-mustard"
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
              <p className="hand mt-5 -rotate-1 text-lg">เลือกสกินข้างล่างได้เลย มีตั้ง {skins.length - 1} ลายสำหรับ {weaponName} ↓</p>
            )}
            {levelVideos.length > 0 && selected.levels.length <= 1 && (
              <button onClick={() => setVideo({ src: levelVideos[0].video!, title: selected.displayName })} className="btn btn-paper mt-5 self-start">
                ▶ ดูวิดีโอ
              </button>
            )}
          </div>
        </Container>
      </section>

      {children}

      {/* ================= SKIN GALLERY ================= */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeading title={`สกิน ${weaponName} ทั้งหมด`} note="กดที่สกินเพื่อหมุนดูด้านบน" />
          <FilterBar
            search={
              <SearchInput
                value={query}
                onChange={(v) => {
                  setQuery(v)
                  resetPage()
                }}
                placeholder="หาชื่อสกิน..."
              />
            }
          >
            <FilterButton
              active={tier === 'ALL'}
              onClick={() => {
                setTier('ALL')
                resetPage()
              }}
            >
              ทุกระดับ
            </FilterButton>
            {tiers.map((x) => (
              <FilterButton
                key={x.uuid}
                active={tier === x.uuid}
                onClick={() => {
                  setTier(x.uuid)
                  resetPage()
                }}
              >
                <img src={x.icon} alt="" className="h-4 w-4" />
                {x.name}
              </FilterButton>
            ))}
          </FilterBar>

          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.slice(0, limit).map((s) => {
              const st = tierOf(s.tier)
              const on = s.uuid === selected.uuid
              return (
                <li key={s.uuid}>
                  <button onClick={() => pick(s)} aria-pressed={on} className={`card group flex h-full w-full flex-col p-2.5 text-left ${on ? '!bg-mustard' : 'card-hover'}`}>
                    <span className="flex h-20 items-center justify-center rounded-md bg-ink px-2 md:h-24">
                      {s.image && <img src={s.image} alt={s.displayName} loading="lazy" className="max-h-[80%] max-w-full object-contain transition-transform group-hover:scale-105" />}
                    </span>
                    <span className="mt-2 flex items-start gap-1.5 px-0.5">
                      {st && <img src={st.icon} alt={st.name} className="mt-0.5 h-4 w-4 shrink-0" />}
                      <span className="line-clamp-2 text-sm leading-snug font-medium">{s.displayName}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {list.length === 0 && <p className="hand py-14 text-center text-xl">ไม่เจอสกินชื่อนี้นะ</p>}
          {list.length > limit && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-paper">
                โหลดเพิ่มอีก ({list.length - limit})
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* ================= VIDEO ================= */}
      {video && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-ink/80 p-4" onClick={() => setVideo(null)}>
          <div className="w-full max-w-4xl rounded-2xl border-2 border-ink bg-paper p-3 shadow-[6px_8px_0_var(--color-ink)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-4 px-1">
              <p className="truncate font-display text-lg font-bold">{video.title}</p>
              <button onClick={() => setVideo(null)} className="btn btn-paper !px-3 !py-1 text-sm">
                ปิด ✕
              </button>
            </div>
            <video key={video.src} src={video.src} autoPlay controls playsInline className="aspect-video w-full rounded-lg bg-black" />
          </div>
        </div>
      )}
    </>
  )
}
