'use client'

import { useState } from 'react'
import type { Ability } from '@/lib/valorant'
import { KEYBIND } from '@/lib/valorant'

const SLOT_LABEL: Record<string, string> = {
  Grenade: 'สกิลพื้นฐาน',
  Ability1: 'สกิลพื้นฐาน',
  Ability2: 'สกิลประจำตัว',
  Ultimate: 'อัลติเมต',
  Passive: 'พาสซีฟ',
}

export default function AbilityPanel({ abilities, color }: { abilities: Ability[]; color: string }) {
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
              className={`card flex items-center gap-3 p-3 text-left transition-all ${on ? '!bg-ink text-paper' : 'card-hover'}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: on ? color : 'var(--color-ink)' }}>
                {a.displayIcon ? <img src={a.displayIcon} alt="" className="h-8 w-8 object-contain" /> : <span className="text-paper">P</span>}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs ${on ? 'text-paper/70' : 'text-ink-soft'}`}>
                  ปุ่ม {KEYBIND[a.slot] ?? '—'} · {SLOT_LABEL[a.slot] ?? a.slot}
                </span>
                <span className="block truncate font-display text-lg font-bold">{a.displayName}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div key={current.slot} className="card relative flex animate-fade-in flex-col p-6 md:p-8">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink font-display text-2xl font-bold"
            style={{ background: color }}
          >
            {KEYBIND[current.slot] ?? '—'}
          </span>
          <div>
            <p className="text-sm text-ink-soft">{SLOT_LABEL[current.slot] ?? current.slot}</p>
            <h3 className="text-3xl font-bold">{current.displayName}</h3>
          </div>
        </div>
        <p className="mt-5 text-lg leading-relaxed whitespace-pre-line text-ink/85">{current.description}</p>
        {current.slot === 'Ultimate' && <p className="hand mt-4 -rotate-1 text-lg">ตัวเปลี่ยนเกมเลยอันนี้ 🔥</p>}
      </div>
    </div>
  )
}
