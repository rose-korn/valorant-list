'use client'

import { useEffect, useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'
import { FilterBar, FilterButton, SearchInput, SortSwitch } from '@/components/Filters'
import { Container } from '@/components/ui'
import { useI18n } from '@/components/LangProvider'

export interface TierInfo {
  uuid: string
  name: string
  icon: string
  color: string
  rank: number
}

export interface SkinItem {
  uuid: string
  /** ลำดับใน API (-1 = ปืนเริ่มต้น) ใช้เรียงใหม่ → เก่า */
  order: number
  displayName: string
  tier: string | null
  image: string | null
  wallpaper: string | null
  chromas: { uuid: string; displayName: string; image: string | null; swatch: string | null; video: string | null }[]
  levels: { uuid: string; displayName: string; levelItem: string | null; video: string | null }[]
}

const PAGE = 24

// วิดีโอสกินจาก Riot เสียงค่อนข้างดัง — เริ่มที่ 25% แล้วจำค่าที่ผู้ใช้ปรับไว้
const VOLUME_KEY = 'valolist:video-volume'
const DEFAULT_VOLUME = 0.25

function savedVolume() {
  try {
    const v = localStorage.getItem(VOLUME_KEY)
    return v === null ? DEFAULT_VOLUME : Math.min(1, Math.max(0, Number(v) || 0))
  } catch {
    return DEFAULT_VOLUME
  }
}

function saveVolume(el: HTMLVideoElement) {
  try {
    localStorage.setItem(VOLUME_KEY, String(el.muted ? 0 : el.volume))
  } catch {
    // private mode — ไม่เป็นไร
  }
}

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
  const { t } = useI18n()
  const w = t.weapons
  const [selected, setSelected] = useState(skins[0])
  const [chroma, setChroma] = useState(0)
  const [tier, setTier] = useState('ALL')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'tier' | 'new' | 'az'>('tier')
  const [limit, setLimit] = useState(PAGE)
  const [video, setVideo] = useState<{ src: string; title: string } | null>(null)

  const tierOf = (uuid: string | null) => tiers.find((x) => x.uuid === uuid)
  const tierNow = tierOf(selected.tier)
  const accent = tierNow?.color ?? '#ff4654'
  const image = selected.chromas[chroma]?.image ?? selected.image

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const found = skins.filter((s) => (tier === 'ALL' || s.tier === tier) && (!q || s.displayName.toLowerCase().includes(q)))
    // ปืนเริ่มต้นอยู่หน้าสุดเสมอ ส่วนที่เหลือเรียงตามที่เลือก (server ส่งมาเรียงตามระดับแล้ว)
    if (sort === 'new') found.sort((a, b) => (a.order < 0 ? -1 : b.order < 0 ? 1 : b.order - a.order))
    if (sort === 'az') found.sort((a, b) => (a.order < 0 ? -1 : b.order < 0 ? 1 : a.displayName.localeCompare(b.displayName)))
    return found
  }, [skins, tier, query, sort])

  const index = list.findIndex((s) => s.uuid === selected.uuid)

  const pick = (s: SkinItem) => {
    setSelected(s)
    setChroma(0)
    // ให้สกินที่เลือกโผล่ในหน้าที่โหลดแล้วเสมอ
    const i = list.findIndex((x) => x.uuid === s.uuid)
    if (i >= limit) setLimit(Math.ceil((i + 1) / PAGE) * PAGE)
  }

  const step = (d: number) => {
    const next = list[index + d]
    if (next) pick(next)
  }

  // ปุ่มลูกศรซ้าย/ขวาเปลี่ยนสกิน, Esc ปิดวิดีโอ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideo(null)
      const target = e.target as HTMLElement | null
      if (video || target?.closest('input, textarea')) return
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const resetPage = () => setLimit(PAGE)
  const levelVideos = selected.levels.filter((l) => l.video)
  const title = chroma > 0 && selected.chromas[chroma] ? selected.chromas[chroma].displayName : selected.displayName

  return (
    <>
      <section className="py-6 md:py-10">
        <Container className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
          {/* ================= ซ้าย: จอ 3D ค้างไว้ (มือถือค้างด้านบน) ================= */}
          <div className="sticky top-16 z-20 -mx-4 self-start border-b-2 border-ink bg-paper/95 px-4 pt-2 pb-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-20 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div
              className="screen relative h-[25svh] min-h-[170px] lg:h-[48svh] lg:min-h-[320px]"
              style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}40, #1c1e24 72%)` }}
            >
              {selected.wallpaper && <img src={selected.wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />}
              <Viewer3D src={image} alt={selected.displayName} accent={accent} variant="weapon" className="h-full w-full" />
              {/* เลื่อนดูสกินก่อนหน้า/ถัดไปได้โดยไม่ต้องเลื่อนหน้า */}
              <button
                onClick={() => step(-1)}
                disabled={index <= 0}
                aria-label={t.common.prev}
                className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-card text-lg font-bold shadow-[2px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 disabled:opacity-30"
              >
                ◀
              </button>
              <button
                onClick={() => step(1)}
                disabled={index < 0 || index >= list.length - 1}
                aria-label={t.common.next}
                className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-card text-lg font-bold shadow-[2px_3px_0_var(--color-ink)] transition-transform hover:translate-x-0.5 disabled:opacity-30"
              >
                ▶
              </button>
              {index >= 0 && (
                <span className="absolute top-3 right-3 rounded-full bg-night/70 px-2 py-0.5 font-display text-xs text-paper">
                  {index + 1} / {list.length}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              {tierNow ? (
                <img src={tierNow.icon} alt={tierNow.name} title={tierNow.name} className="h-7 w-7 shrink-0" />
              ) : (
                <span className="chip shrink-0 !px-2 text-xs">{w.starter}</span>
              )}
              <h2 key={title} className="min-w-0 flex-1 animate-fade-in truncate text-xl font-bold md:text-2xl">
                {title}
              </h2>
            </div>

            {selected.chromas.length > 1 && (
              <div className="scrollbar-hide mt-2 flex items-center gap-2 overflow-x-auto py-1">
                {selected.chromas.map((c, i) => (
                  <button
                    key={c.uuid}
                    onClick={() => setChroma(i)}
                    title={c.displayName}
                    aria-label={c.displayName}
                    aria-pressed={chroma === i}
                    className={`h-9 w-9 shrink-0 overflow-hidden rounded-lg border-2 transition-transform ${
                      chroma === i ? '-translate-y-0.5 border-ink shadow-[2px_3px_0_var(--color-ink)]' : 'border-line hover:border-ink'
                    }`}
                  >
                    {c.swatch ? <img src={c.swatch} alt="" className="h-full w-full object-cover" /> : <span className="text-sm">{i + 1}</span>}
                  </button>
                ))}
                {selected.chromas[chroma]?.video && (
                  <button
                    onClick={() => setVideo({ src: selected.chromas[chroma].video!, title: selected.chromas[chroma].displayName })}
                    className="ml-1 shrink-0 text-sm font-semibold whitespace-nowrap text-red-ink underline underline-offset-4"
                  >
                    {w.colorVideo}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================= ขวา: รายละเอียด + รายการสกิน ================= */}
          <div className="min-w-0">
            {(selected.levels.length > 1 || levelVideos.length > 0 || selected.uuid === 'default') && (
              <div className="card mb-6 p-4">
                {selected.uuid === 'default' && <p className="hand -rotate-1 text-lg">{w.pickNote(skins.length - 1, weaponName)}</p>}
                {selected.levels.length > 1 && (
                  <>
                    <p className="mb-2 font-semibold">{w.levels(selected.levels.length)}</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.levels.map((l, i) =>
                        l.video ? (
                          <button
                            key={l.uuid}
                            onClick={() => setVideo({ src: l.video!, title: l.displayName })}
                            title={l.displayName}
                            className="chip !py-1 transition-colors hover:!bg-mustard"
                          >
                            ▶ Lv.{i + 1}
                          </button>
                        ) : (
                          <span key={l.uuid} title={l.displayName} className="chip !bg-paper-2 !py-1">
                            Lv.{i + 1}
                          </span>
                        ),
                      )}
                    </div>
                  </>
                )}
                {levelVideos.length > 0 && selected.levels.length <= 1 && (
                  <button onClick={() => setVideo({ src: levelVideos[0].video!, title: selected.displayName })} className="btn btn-paper !py-1.5 text-sm">
                    {w.video}
                  </button>
                )}
              </div>
            )}

            <h3 className="text-2xl font-bold">{w.allSkins(weaponName)}</h3>
            <p className="hand mb-4 text-base">{w.browseHint}</p>

            <FilterBar
              search={
                <SearchInput
                  value={query}
                  onChange={(v) => {
                    setQuery(v)
                    resetPage()
                  }}
                  placeholder={w.searchSkin}
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
                {w.allTiers}
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

            <div className="mb-5 -mt-4">
              <SortSwitch
                value={sort}
                onChange={(v) => {
                  setSort(v)
                  resetPage()
                }}
                label={t.sort.label}
                hint={t.sort.hint}
                options={[
                  { key: 'tier', label: t.sort.tier },
                  { key: 'new', label: t.sort.newest },
                  { key: 'az', label: t.sort.az },
                ]}
              />
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {list.slice(0, limit).map((s) => {
                const st = tierOf(s.tier)
                const on = s.uuid === selected.uuid
                return (
                  <li key={s.uuid}>
                    <button
                      onClick={() => pick(s)}
                      aria-pressed={on}
                      className={`card group relative flex h-full w-full flex-col p-2 text-left ${on ? '!bg-mustard' : 'card-hover'}`}
                    >
                      <span className="skeleton-dark flex h-16 items-center justify-center rounded-md px-2 md:h-20">
                        {s.image && (
                          <img src={s.image} alt={s.displayName} loading="lazy" className="max-h-[80%] max-w-full object-contain transition-transform group-hover:scale-105" />
                        )}
                      </span>
                      <span className="mt-1.5 flex items-start gap-1.5 px-0.5">
                        {st && <img src={st.icon} alt={st.name} className="mt-0.5 h-4 w-4 shrink-0" />}
                        <span className="line-clamp-2 text-sm leading-snug font-medium">{s.displayName}</span>
                      </span>
                      {on && (
                        <span aria-hidden className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-red text-xs font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            {list.length === 0 && <p className="hand py-14 text-center text-xl">{t.common.noResult}</p>}
            {list.length > limit && (
              <div className="mt-6 flex justify-center">
                <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-paper">
                  {t.common.loadMore(list.length - limit)}
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {children}

      {/* ================= VIDEO ================= */}
      {video && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-ink/80 p-4" onClick={() => setVideo(null)}>
          <div className="w-full max-w-4xl rounded-2xl border-2 border-ink bg-paper p-3 shadow-[6px_8px_0_var(--color-ink)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-4 px-1">
              <p className="truncate font-display text-lg font-bold">{video.title}</p>
              <button onClick={() => setVideo(null)} className="btn btn-paper !px-3 !py-1 text-sm">
                {t.common.close}
              </button>
            </div>
            <video
              key={video.src}
              ref={(el) => {
                // ตั้งเสียงก่อนเริ่มเล่น จะได้ไม่ดังตูมตอนเปิด
                if (el) el.volume = savedVolume()
              }}
              src={video.src}
              autoPlay
              controls
              playsInline
              onVolumeChange={(e) => saveVolume(e.currentTarget)}
              className="aspect-video w-full rounded-lg bg-black"
            />
            <p className="mt-2 px-1 text-sm text-ink-soft">🔉 {w.volumeNote}</p>
          </div>
        </div>
      )}
    </>
  )
}
