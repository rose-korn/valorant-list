'use client'

import Link from '@/components/Link'
import { useI18n } from '@/components/LangProvider'
import { type Shelf, useLocker } from '@/lib/locker'

/** ปุ่ม "มีแล้ว / อยากได้" ของสกิน — จดลงคลังของฉัน (/my) */
export default function LockerToggle({ uuid, showLink = false, className = '' }: { uuid: string; showLink?: boolean; className?: string }) {
  const { t } = useI18n()
  const m = t.my
  const { has, toggle } = useLocker()
  const shelves: Shelf[] = ['own', 'want']
  const any = shelves.some((s) => has(s, uuid))
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label={m.toggleHint}>
      {shelves.map((s) => {
        const on = has(s, uuid)
        return (
          <button
            key={s}
            onClick={() => toggle(s, uuid)}
            aria-pressed={on}
            className={`rounded-full border-[1.5px] border-ink px-3 py-1 font-display text-sm font-semibold transition-colors ${
              on ? (s === 'own' ? 'bg-blue text-paper' : 'bg-red text-white') : 'bg-card hover:bg-paper-2'
            }`}
          >
            {on ? '✓ ' : '+ '}
            {m[s]}
          </button>
        )
      })}
      {showLink && any && (
        <Link href="/my" className="text-sm text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink">
          {m.goMy}
        </Link>
      )}
    </div>
  )
}
