'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Viewer3D from '@/components/three/Viewer3D'
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

type Sort = 'tier' | 'new' | 'az'

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
  const [sort, setSort] = useState<Sort>('tier')
  const [limit, setLimit] = useState(PAGE)
  const [video, setVideo] = useState<{ src: string; title: string } | null>(null)

  const tierOf = (uuid: string | null) => tiers.find((x) => x.uuid === uuid)
  const tierNow = tierOf(selected.tier)
  const accent = tierNow?.color ?? '#ff4654'
  const image = selected.chromas[chroma]?.image ?? selected.image

  // จำนวนสกินต่อระดับ ไว้โชว์บนปุ่มกรอง
  const tierCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of skins) if (s.tier) m.set(s.tier, (m.get(s.tier) ?? 0) + 1)
    return m
  }, [skins])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    // ค้นได้ทั้งชื่อสกินและชื่อสี (chroma)
    const match = (s: SkinItem) => !q || s.displayName.toLowerCase().includes(q) || s.chromas.some((c) => c.displayName.toLowerCase().includes(q))
    const found = skins.filter((s) => (tier === 'ALL' || s.tier === tier) && match(s))
    // ปืนเริ่มต้นอยู่หน้าสุดเสมอ (server ส่งมาเรียงตามระดับแล้ว)
    if (sort === 'new') found.sort((a, b) => (a.order < 0 ? -1 : b.order < 0 ? 1 : b.order - a.order))
    if (sort === 'az') found.sort((a, b) => (a.order < 0 ? -1 : b.order < 0 ? 1 : a.displayName.localeCompare(b.displayName)))
    return found
  }, [skins, tier, query, sort])

  const index = list.findIndex((s) => s.uuid === selected.uuid)
  const filtered = tier !== 'ALL' || query.trim() !== ''

  const pick = (s: SkinItem) => {
    setSelected(s)
    setChroma(0)
    // ให้สกินที่เลือกอยู่ในส่วนที่โหลดแล้วเสมอ
    const i = list.findIndex((x) => x.uuid === s.uuid)
    if (i >= limit) setLimit(Math.ceil((i + 1) / PAGE) * PAGE)
  }

  // ถ้าสกินที่เปิดอยู่ไม่อยู่ในผลกรอง ◀ ▶ จะพาไปตัวแรก/ตัวสุดท้ายของผลกรองแทน (ไม่ติดค้าง)
  const step = (d: number) => {
    if (!list.length) return
    const next = index < 0 ? list[d > 0 ? 0 : list.length - 1] : list[index + d]
    if (next) pick(next)
  }
  const canPrev = list.length > 0 && index !== 0
  const canNext = list.length > 0 && index !== list.length - 1

  const clearFilters = () => {
    setTier('ALL')
    setQuery('')
    setLimit(PAGE)
  }

  // ปุ่มลูกศรซ้าย/ขวาเปลี่ยนสกิน, Esc ปิดวิดีโอ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideo(null)
      const target = e.target as HTMLElement | null
      if (video || target?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const levelVideos = selected.levels.map((l, i) => ({ ...l, n: i + 1 })).filter((l) => l.video)
  const title = chroma > 0 && selected.chromas[chroma] ? selected.chromas[chroma].displayName : selected.displayName
  const shown = list.slice(0, limit)

  return (
    <>
      <section className="py-6 md:py-10">
        <Container className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
          {/* ================= ซ้าย: จอ 3D ค้างไว้ (มือถือค้างด้านบน) ================= */}
          <div className="sticky top-16 z-20 -mx-4 self-start border-b-2 border-ink bg-paper/95 px-4 pt-2 pb-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-20 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div
              className="screen relative h-[25svh] min-h-[170px] lg:h-[46svh] lg:min-h-[320px]"
              style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}40, #1c1e24 72%)` }}
            >
              {selected.wallpaper && <img src={selected.wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />}
              <Viewer3D src={image} alt={selected.displayName} accent={accent} variant="weapon" className="h-full w-full" />
              <NavButton side="left" onClick={() => step(-1)} disabled={!canPrev} label={t.common.prev} />
              <NavButton side="right" onClick={() => step(1)} disabled={!canNext} label={t.common.next} />
              {index >= 0 && (
                <span className="absolute top-3 right-3 rounded-full bg-night/70 px-2 py-0.5 font-display text-xs text-paper">
                  {index + 1} / {list.length}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2.5">
              {tierNow ? (
                <img src={tierNow.icon} alt={tierNow.name} title={tierNow.name} className="h-7 w-7 shrink-0" />
              ) : (
                <span className="chip shrink-0 !px-2 text-xs">{w.starter}</span>
              )}
              <h2 key={title} className="min-w-0 flex-1 animate-fade-in truncate text-xl font-bold md:text-2xl">
                {title}
              </h2>
            </div>

            {/* สี + คลิปเลเวล อยู่แถวเดียวกันใต้จอ */}
            {(selected.chromas.length > 1 || levelVideos.length > 0) && (
              <div className="scrollbar-hide mt-2 flex items-center gap-2 overflow-x-auto py-1">
                {selected.chromas.length > 1 &&
                  selected.chromas.map((c, i) => (
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
                    className="chip shrink-0 !py-1 text-sm hover:!bg-mustard"
                  >
                    {w.colorVideo}
                  </button>
                )}
                {selected.chromas.length > 1 && levelVideos.length > 0 && <span className="h-6 w-px shrink-0 bg-line" />}
                {levelVideos.map((l) => (
                  <button
                    key={l.uuid}
                    onClick={() => setVideo({ src: l.video!, title: l.displayName })}
                    title={l.displayName}
                    className="chip shrink-0 !py-1 text-sm hover:!bg-mustard"
                  >
                    ▶ Lv.{l.n}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1 hidden text-sm text-ink-soft lg:block">{w.browseHint}</p>
          </div>

          {/* ================= ขวา: แถบค้นหา/กรอง + รายการสกิน ================= */}
          <div className="min-w-0">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h3 className="text-2xl font-bold">{w.allSkins(weaponName)}</h3>
              <span className="shrink-0 text-sm text-ink-soft">{t.common.found(list.length, skins.length)}</span>
            </div>

            {/* แถบเครื่องมือ: ค้นหา + เรียง / ปุ่มระดับเลื่อนแนวนอน */}
            <div className="card mb-5 space-y-3 p-3 lg:sticky lg:top-20 lg:z-10">
              <div className="flex gap-2">
                <label className="relative block min-w-0 flex-1">
                  <span className="sr-only">{w.searchSkin}</span>
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setLimit(PAGE)
                    }}
                    placeholder={w.searchSkin}
                    className="w-full rounded-xl border-2 border-ink bg-paper py-2 pr-9 pl-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-mustard/60"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label={t.common.clear}
                      className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-xs text-paper"
                    >
                      ✕
                    </button>
                  )}
                </label>
                <label className="relative shrink-0">
                  <span className="sr-only">{t.sort.label}</span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as Sort)
                      setLimit(PAGE)
                    }}
                    title={t.sort.hint}
                    className="h-full cursor-pointer appearance-none rounded-xl border-2 border-ink bg-paper py-2 pr-8 pl-3 font-display font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-mustard/60"
                  >
                    <option value="tier">{t.sort.tier}</option>
                    <option value="new">{t.sort.newest}</option>
                    <option value="az">{t.sort.az}</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">▼</span>
                </label>
              </div>

              <div className="scrollbar-hide -mx-3 flex gap-1.5 overflow-x-auto px-3">
                <TierChip active={tier === 'ALL'} onClick={() => setTier('ALL')} label={w.allTiers} count={skins.length} />
                {tiers.map((x) => (
                  <TierChip
                    key={x.uuid}
                    active={tier === x.uuid}
                    onClick={() => {
                      setTier(x.uuid)
                      setLimit(PAGE)
                    }}
                    label={x.name}
                    icon={x.icon}
                    count={tierCount.get(x.uuid) ?? 0}
                  />
                ))}
              </div>
            </div>

            {list.length === 0 ? (
              <div className="card flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="hand text-xl">{t.common.noResult}</p>
                {filtered && (
                  <button onClick={clearFilters} className="btn btn-paper !py-1.5 text-sm">
                    {t.common.clear}
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {shown.map((s, i) => {
                  const st = tierOf(s.tier)
                  const on = s.uuid === selected.uuid
                  // เรียงตามระดับ: ใส่หัวข้อทุกครั้งที่เปลี่ยนระดับ จะได้รู้ว่ากำลังดูกลุ่มไหน
                  const showGroup = sort === 'tier' && tier === 'ALL' && !query.trim() && (i === 0 || shown[i - 1].tier !== s.tier)
                  return (
                    <Fragment key={s.uuid}>
                      {showGroup && (
                        <li className="col-span-full mt-2 flex items-center gap-2 first:mt-0">
                          {st ? <img src={st.icon} alt="" className="h-5 w-5" /> : null}
                          <span className="font-display font-bold">{st?.name ?? w.starter}</span>
                          <span className="h-0.5 flex-1 rounded-full bg-line" />
                        </li>
                      )}
                      <li>
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
                    </Fragment>
                  )
                })}
              </ul>
            )}
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

function NavButton({ side, onClick, disabled, label }: { side: 'left' | 'right'; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-card text-lg font-bold shadow-[2px_3px_0_var(--color-ink)] transition-transform disabled:opacity-30 ${
        side === 'left' ? 'left-2 hover:-translate-x-0.5' : 'right-2 hover:translate-x-0.5'
      }`}
    >
      {side === 'left' ? '◀' : '▶'}
    </button>
  )
}

function TierChip({ active, onClick, label, icon, count }: { active: boolean; onClick: () => void; label: string; icon?: string; count: number }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
        active ? 'border-ink bg-ink text-paper' : 'border-line bg-paper hover:border-ink'
      }`}
    >
      {icon && <img src={icon} alt="" className="h-4 w-4" />}
      {label}
      <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-paper/20' : 'bg-paper-2'}`}>{count}</span>
    </button>
  )
}
