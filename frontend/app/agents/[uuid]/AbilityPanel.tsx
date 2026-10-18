'use client'

import { useState } from 'react'
import type { Ability } from '@/lib/valorant'
import { KEYBIND } from '@/lib/valorant'

const SLOT_LABEL: Record<string, string> = {
  Grenade: 'Basic Ability',
  Ability1: 'Basic Ability',
  Ability2: 'Signature Ability',
  Ultimate: 'Ultimate',
  Passive: 'Passive',
}

export default function AbilityPanel({ abilities, color }: { abilities: Ability[]; color: string }) {
  const [active, setActive] = useState(0)
  const current = abilities[active]
  if (!current) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      {/* ปุ่มสกิล */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
        {abilities.map((a, i) => {
          const on = i === active
          return (
            <button
              key={a.slot}
              onClick={() => setActive(i)}
              className={`group relative flex items-center gap-3 overflow-hidden border p-3 text-left transition-all md:p-4 ${
                on ? 'border-transparent' : 'border-white/10 hover:border-white/30'
              }`}
              style={on ? { background: `linear-gradient(120deg, ${color}55, ${color}11)`, boxShadow: `inset 3px 0 0 ${color}` } : undefined}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center md:h-14 md:w-14 ${on ? 'bg-black/30' : 'bg-white/5'}`}
              >
                {a.displayIcon ? (
                  <img src={a.displayIcon} alt="" className={`h-8 w-8 object-contain transition-transform md:h-10 md:w-10 ${on ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`} />
                ) : (
                  <span className="font-display text-xl text-val-cream/60">P</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <kbd className="flex h-5 min-w-5 items-center justify-center border border-white/30 px-1 font-display text-[11px] text-val-cream">
                    {KEYBIND[a.slot] ?? '—'}
                  </kbd>
                  <span className="truncate text-[9px] tracking-[0.2em] text-val-cream/40 uppercase">{SLOT_LABEL[a.slot] ?? a.slot}</span>
                </span>
                <span className={`mt-1 block truncate font-display text-lg uppercase md:text-xl ${on ? 'text-white' : 'text-val-cream/70'}`}>
                  {a.displayName}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* รายละเอียด */}
      <div key={current.slot} className="val-panel val-corners relative flex animate-fade-in flex-col overflow-hidden p-6 md:p-10">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: color }} />
        {current.displayIcon && (
          <img src={current.displayIcon} alt="" className="pointer-events-none absolute right-6 bottom-6 h-32 w-32 object-contain opacity-[0.07] md:h-48 md:w-48" />
        )}
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center border-2 font-display text-3xl text-white" style={{ borderColor: color }}>
            {KEYBIND[current.slot] ?? '—'}
          </span>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color }}>
              {SLOT_LABEL[current.slot] ?? current.slot}
            </p>
            <h3 className="font-display text-4xl leading-none text-val-cream uppercase md:text-5xl">{current.displayName}</h3>
          </div>
        </div>
        <p className="relative mt-6 font-thai text-base leading-relaxed font-light whitespace-pre-line text-val-cream/75 md:text-lg">
          {current.description}
        </p>
        <div className="relative mt-auto flex gap-1.5 pt-8">
          {abilities.map((a, i) => (
            <span key={a.slot} className="h-1 flex-1 transition-colors" style={{ background: i === active ? color : 'rgb(255 255 255 / .1)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
