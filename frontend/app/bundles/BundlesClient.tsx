'use client'

import { useCallback, useMemo, useState } from 'react'
import { SearchInput } from '@/components/Filters'
import Modal from '@/components/Modal'
import type { Bundle } from '@/lib/valorant'

const PAGE = 18
const tilt = ['-rotate-1', 'rotate-1', 'rotate-[0.5deg]', '-rotate-[0.5deg]']

export default function BundlesClient({ bundles }: { bundles: Bundle[] }) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [open, setOpen] = useState<Bundle | null>(null)
  const close = useCallback(() => setOpen(null), [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? bundles.filter((b) => b.displayName.toLowerCase().includes(q)) : bundles
  }, [bundles, query])

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-soft">เจอ {list.length} ชุด</p>
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v)
            setLimit(PAGE)
          }}
          placeholder="หาชื่อบันเดิล..."
        />
      </div>

      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, limit).map((b, i) => (
          <li key={b.uuid}>
            <button onClick={() => setOpen(b)} className={`card card-hover block w-full p-2.5 text-left ${tilt[i % tilt.length]}`}>
              <div className="aspect-video overflow-hidden rounded-md bg-ink">
                <img src={b.displayIcon} alt={b.displayName} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="px-1 pt-2">
                <p className="font-display text-lg font-bold">{b.displayName}</p>
                {b.displayNameSubText && <p className="text-sm text-ink-soft">{b.displayNameSubText}</p>}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {list.length === 0 && <p className="hand py-16 text-center text-xl">ไม่เจอบันเดิลชื่อนี้นะ</p>}
      {list.length > limit && (
        <div className="mt-10 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-paper">
            โหลดเพิ่มอีก ({list.length - limit})
          </button>
        </div>
      )}

      <Modal open={!!open} onClose={close} title={open?.displayName ?? ''}>
        {open && (
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <img src={open.displayIcon2 ?? open.displayIcon} alt={open.displayName} className="w-full rounded-lg border-2 border-ink" />
              {(open.description || open.extraDescription || open.promoDescription) && (
                <div className="space-y-2 text-ink-soft">
                  {[open.description, open.extraDescription, open.promoDescription]
                    .filter((d, i, arr) => d && arr.indexOf(d) === i)
                    .map((d) => (
                      <p key={d}>{d}</p>
                    ))}
                </div>
              )}
            </div>
            {open.verticalPromoImage && (
              <img src={open.verticalPromoImage} alt="" className="hidden max-h-[70vh] w-auto rounded-lg border-2 border-ink md:block" loading="lazy" />
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
