'use client'

import { useEffect } from 'react'
import { useI18n } from './LangProvider'

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
  const { t } = useI18n()
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
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-ink/60 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`soft-scroll relative max-h-[92svh] w-full animate-fade-up overflow-y-auto rounded-t-2xl border-2 border-ink bg-paper shadow-[6px_8px_0_var(--color-ink)] sm:rounded-2xl ${
          wide ? 'sm:max-w-5xl' : 'sm:max-w-3xl'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-ink bg-paper px-5 py-3">
          <h3 className="truncate text-xl font-bold md:text-2xl">{title}</h3>
          <button onClick={onClose} className="btn btn-paper !px-3 !py-1 text-sm" aria-label={t.common.close}>
            {t.common.close}
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
