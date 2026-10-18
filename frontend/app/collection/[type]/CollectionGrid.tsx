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

  const shown = kind === 'titles' ? limit * 2 : limit

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-soft">
          เจอ {list.length.toLocaleString()} จาก {items.length.toLocaleString()}
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

      {kind === 'titles' ? (
        <ul className="flex flex-wrap gap-2.5">
          {list.slice(0, shown).map((t, i) => (
            <li key={t.uuid} className={`chip !px-4 !py-1.5 text-base ${i % 5 === 0 ? '!bg-mustard' : ''}`}>
              {t.name}
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`grid gap-3 ${kind === 'cards' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'}`}>
          {list.slice(0, shown).map((item) => (
            <li key={item.uuid}>
              <button
                onClick={() => {
                  setOpen(item)
                  setMode('3d')
                }}
                title={item.name}
                className={`group block w-full overflow-hidden rounded-xl border-2 border-ink bg-card transition-transform hover:-translate-y-1 hover:-rotate-2 ${
                  kind === 'cards' ? 'aspect-[1/2.4]' : 'aspect-square p-2'
                }`}
              >
                {item.thumb && (
                  <img src={item.thumb} alt={item.name} loading="lazy" className={`h-full w-full ${kind === 'cards' ? 'object-cover' : 'object-contain'}`} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {list.length === 0 && <p className="hand py-16 text-center text-xl">ไม่เจอเลย ลองคำอื่นดูนะ</p>}
      {list.length > shown && (
        <div className="mt-10 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-paper">
            โหลดเพิ่มอีก ({(list.length - shown).toLocaleString()})
          </button>
        </div>
      )}

      <Modal open={!!open} onClose={close} title={open?.name ?? ''} wide>
        {open && (
          <div className="grid gap-5 md:grid-cols-[1fr_240px]">
            <div className="screen h-[52svh] min-h-[300px]">
              {mode === '3d' ? (
                <Viewer3D src={open.full} alt={open.name} variant={kind === 'buddies' ? 'emblem' : 'card'} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <img src={(kind === 'sprays' && open.extra) || open.full || ''} alt={open.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex overflow-hidden rounded-xl border-2 border-ink">
                {(['3d', '2d'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 font-display font-semibold ${mode === m ? 'bg-ink text-paper' : 'bg-card hover:bg-mustard/40'}`}
                  >
                    {m === '3d' ? 'หมุน 3D' : kind === 'sprays' && open.extra ? 'ภาพเคลื่อนไหว' : 'ภาพ 2D'}
                  </button>
                ))}
              </div>
              {kind === 'cards' && open.extra && (
                <div>
                  <p className="mb-1.5 text-sm text-ink-soft">แบบแนวนอน</p>
                  <img src={open.extra} alt="" className="w-full rounded-lg border-2 border-ink" />
                </div>
              )}
              {open.full && (
                <a href={open.full} target="_blank" rel="noreferrer" className="btn btn-paper mt-auto">
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
