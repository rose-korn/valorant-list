'use client'

import { useCallback, useMemo, useState } from 'react'
import { SearchInput } from '@/components/Filters'
import Modal from '@/components/Modal'
import type { Bundle } from '@/lib/valorant'

const PAGE = 18

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
        <p className="text-xs tracking-[0.25em] text-val-cream/40 uppercase">
          {list.length} bundles
        </p>
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v)
            setLimit(PAGE)
          }}
          placeholder="ค้นหาบันเดิล..."
        />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, limit).map((b, i) => (
          <li key={b.uuid} className="animate-fade-up" style={{ animationDelay: `${(i % PAGE) * 30}ms` }}>
            <button onClick={() => setOpen(b)} className="group val-corners relative block aspect-video w-full overflow-hidden bg-val-panel text-left">
              <img
                src={b.displayIcon}
                alt={b.displayName}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-val-ink via-val-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                {b.displayNameSubText && <p className="text-[10px] tracking-[0.3em] text-val-red uppercase">{b.displayNameSubText}</p>}
                <p className="font-display text-3xl leading-none text-val-cream uppercase">{b.displayName}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {list.length === 0 && <p className="py-20 text-center font-thai text-val-cream/40">ไม่พบบันเดิล</p>}
      {list.length > limit && (
        <div className="mt-10 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="val-btn-ghost">
            โหลดเพิ่ม ({list.length - limit})
          </button>
        </div>
      )}

      <Modal open={!!open} onClose={close} title={open?.displayName ?? ''}>
        {open && (
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <img src={open.displayIcon2 ?? open.displayIcon} alt={open.displayName} className="w-full" />
              {(open.description || open.extraDescription || open.promoDescription) && (
                <div className="space-y-2 font-thai text-sm leading-relaxed font-light text-val-cream/70">
                  {[open.description, open.extraDescription, open.promoDescription]
                    .filter((d, i, arr) => d && arr.indexOf(d) === i)
                    .map((d) => (
                      <p key={d}>{d}</p>
                    ))}
                </div>
              )}
            </div>
            {open.verticalPromoImage && (
              <img src={open.verticalPromoImage} alt="" className="hidden max-h-[70vh] w-auto md:block" loading="lazy" />
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
