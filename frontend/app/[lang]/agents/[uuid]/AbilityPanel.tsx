'use client'

import { useState } from 'react'
import type { Ability } from '@/lib/valorant'
import { KEYBIND } from '@/lib/valorant'
import { useI18n } from '@/components/LangProvider'

/**
 * ไอคอนสกิลจาก API เป็นสีขาวเสมอ จึงวางบนพื้นหมึกเข้มตลอด (ไม่ใช้สีเอเจนท์เป็นพื้น
 * เพราะเอเจนท์สีอ่อนอย่าง Jett/Killjoy จะทำให้ไอคอนกลืนหาย)
 * สีเอเจนท์ใช้แค่เป็นแถบตกแต่งเล็ก ๆ ที่ไม่มีตัวหนังสือทับ
 */
export default function AbilityPanel({ abilities, color }: { abilities: Ability[]; color: string }) {
  const { t } = useI18n()
  const SLOT_LABEL = t.agents.slot
  const [active, setActive] = useState(0)
  const current = abilities[active]
  if (!current) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      <div className="grid grid-cols-2 gap-3">
        {abilities.map((a, i) => {
          const on = i === active
          return (
            <button
              key={a.slot}
              onClick={() => setActive(i)}
              aria-pressed={on}
              className={`card relative flex items-center gap-3 p-3 text-left transition-all ${
                on ? '-translate-y-0.5 !bg-mustard !shadow-[4px_6px_0_var(--color-ink)]' : 'card-hover'
              }`}
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink">
                {a.displayIcon ? <img src={a.displayIcon} alt="" className="h-8 w-8 object-contain" /> : <span className="font-display font-bold text-paper">P</span>}
                <kbd className="absolute -right-1.5 -bottom-1.5 flex h-5 min-w-5 items-center justify-center rounded-md border-2 border-ink bg-card px-1 font-display text-[11px] font-bold text-ink">
                  {KEYBIND[a.slot] ?? '—'}
                </kbd>
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-ink-soft">{SLOT_LABEL[a.slot] ?? a.slot}</span>
                <span className="block truncate font-display text-lg font-bold text-ink">{a.displayName}</span>
              </span>
              {on && (
                <span aria-hidden className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-red text-xs font-bold text-white">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div key={current.slot} className="card relative flex animate-fade-in flex-col overflow-hidden p-6 pt-8 md:p-8 md:pt-10">
        {/* แถบสีเอเจนท์ด้านบน — ตกแต่งอย่างเดียว ไม่มีตัวหนังสือทับ */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-2.5 border-b-2 border-ink" style={{ background: color }} />
        <div className="flex items-center gap-4">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink">
            {current.displayIcon ? (
              <img src={current.displayIcon} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <span className="font-display text-2xl font-bold text-paper">P</span>
            )}
            <kbd className="absolute -right-2 -bottom-2 flex h-7 min-w-7 items-center justify-center rounded-lg border-2 border-ink bg-mustard px-1.5 font-display text-base font-bold text-ink">
              {KEYBIND[current.slot] ?? '—'}
            </kbd>
          </span>
          <div>
            <p className="text-sm text-ink-soft">
              {t.agents.key} {KEYBIND[current.slot] ?? '—'} · {SLOT_LABEL[current.slot] ?? current.slot}
            </p>
            <h3 className="text-3xl font-bold">{current.displayName}</h3>
          </div>
        </div>
        <p className="mt-5 text-lg leading-relaxed whitespace-pre-line text-ink/85">{current.description}</p>
        {current.slot === 'Ultimate' && <p className="hand mt-4 -rotate-1 text-lg">{t.agents.ultNote}</p>}
      </div>
    </div>
  )
}
