'use client'

import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-black/85 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`val-scroll relative max-h-[92svh] w-full overflow-y-auto border-t-2 border-val-red bg-val-ink sm:border ${
          wide ? 'sm:max-w-5xl' : 'sm:max-w-3xl'
        } animate-fade-up`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-val-ink/95 px-5 py-4 backdrop-blur">
          <h3 className="truncate font-display text-2xl text-val-cream uppercase md:text-3xl">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-val-cream transition-colors hover:border-val-red hover:bg-val-red"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
