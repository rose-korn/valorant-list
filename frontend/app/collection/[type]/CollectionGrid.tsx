'use client'

import { useCallback, useMemo, useState } from 'react'
import { SearchInput } from '@/components/Filters'
import Modal from '@/components/Modal'
import Viewer3D from '@/components/three/Viewer3D'
import type { CollectionItem, CollectionKind } from '../data'

const PAGE = 48

export default function CollectionGrid({ kind, items }: { kind: CollectionKind; items: CollectionItem[] }) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [open, setOpen] = useState<CollectionItem | null>(null)
  const [mode, setMode] = useState<'3d' | '2d'>('3d')
  const close = useCallback(() => setOpen(null), [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items
  }, [items, query])

  const search = (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs tracking-[0.25em] text-val-cream/40 uppercase">
        {list.length.toLocaleString()} / {items.length.toLocaleString()}
      </p>
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v)
          setLimit(PAGE)
        }}
        placeholder="ค้นหา..."
      />
    </div>
  )

  const more = list.length > limit && (
    <div className="mt-10 flex justify-center">
      <button onClick={() => setLimit((l) => l + PAGE)} className="val-btn-ghost">
        โหลดเพิ่ม ({(list.length - limit).toLocaleString()})
      </button>
    </div>
  )

  if (kind === 'titles') {
    return (
      <>
        {search}
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.slice(0, limit * 2).map((t) => (
            <li key={t.uuid} className="group border border-white/8 bg-white/[0.02] px-4 py-3 transition-colors hover:border-val-red/60">
              <span className="font-display text-lg tracking-wider text-val-cream/80 uppercase group-hover:text-white">{t.name}</span>
            </li>
          ))}
        </ul>
        {list.length > limit * 2 && (
          <div className="mt-10 flex justify-center">
            <button onClick={() => setLimit((l) => l + PAGE)} className="val-btn-ghost">
              โหลดเพิ่ม
            </button>
          </div>
        )}
      </>
    )
  }

  const tall = kind === 'cards'

  return (
    <>
      {search}
      <ul className={`grid gap-3 ${tall ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8'}`}>
        {list.slice(0, limit).map((item) => (
          <li key={item.uuid}>
            <button
              onClick={() => {
                setOpen(item)
                setMode('3d')
              }}
              title={item.name}
              className={`group relative flex w-full flex-col overflow-hidden border border-white/8 bg-white/[0.02] transition-colors hover:border-val-red/70 ${
                tall ? 'aspect-[1/2.4]' : 'aspect-square p-3'
              }`}
            >
              {item.thumb && (
                <img
                  src={item.thumb}
                  alt={item.name}
                  loading="lazy"
                  className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${tall ? 'object-cover' : 'object-contain'}`}
                />
              )}
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-transparent p-2 pt-6 text-left text-[10px] leading-tight text-white transition-transform group-hover:translate-y-0">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-20 text-center font-thai text-val-cream/40">ไม่พบรายการ</p>}
      {more}

      <Modal open={!!open} onClose={close} title={open?.name ?? ''} wide>
        {open && (
          <div className="grid gap-5 md:grid-cols-[1fr_260px]">
            <div className="relative h-[55svh] min-h-[320px] border border-white/10 bg-val-deep">
              {mode === '3d' ? (
                <Viewer3D src={open.full} alt={open.name} variant={kind === 'buddies' ? 'emblem' : 'card'} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <img src={(kind === 'sprays' && open.extra) || open.full || ''} alt={open.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex border border-white/15">
                {(['3d', '2d'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 font-display text-sm tracking-widest uppercase ${mode === m ? 'bg-val-red text-white' : 'text-val-cream/60 hover:text-white'}`}
                  >
                    {m === '3d' ? '3D View' : kind === 'sprays' && open.extra ? 'Animated' : '2D Art'}
                  </button>
                ))}
              </div>
              {kind === 'cards' && open.extra && (
                <div>
                  <p className="mb-2 text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Wide art</p>
                  <img src={open.extra} alt="" className="w-full border border-white/10" />
                </div>
              )}
              {open.full && (
                <a href={open.full} target="_blank" rel="noreferrer" className="val-btn-ghost mt-auto">
                  เปิดรูปเต็ม ↗
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
