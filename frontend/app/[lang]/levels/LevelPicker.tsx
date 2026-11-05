'use client'

// เลือกเลเวลบัญชี → โชว์กรอบการ์ด + ป้ายเลเวลที่ได้ (กรอบใหม่ทุก 20 เลเวล ตาม startingLevel ของ API)

import { useState } from 'react'
import { useI18n } from '@/components/LangProvider'
import { SectionHeading } from '@/components/ui'

export interface BorderItem {
  uuid: string
  /** เลเวลแรกที่ได้กรอบนี้ */
  from: number
  plate: string
  frame: string
}

const LEVEL_MAX = 999

/** กรอบของเลเวลนี้ = กรอบสุดท้ายที่ from <= level */
const borderIndex = (borders: BorderItem[], level: number) => {
  let i = 0
  borders.forEach((b, j) => {
    if (b.from <= level) i = j
  })
  return i
}

function Preview({ border, level, card, big = false }: { border: BorderItem; level: number; card: string | null; big?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${big ? 'gap-3' : 'gap-1.5'}`}>
      <div className={`relative aspect-square ${big ? 'w-48 sm:w-56' : 'w-20 sm:w-24'}`}>
        {card && <img src={card} alt="" loading="lazy" className="absolute inset-[12%] h-[76%] w-[76%] object-cover" />}
        <img src={border.frame} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
      </div>
      {/* ป้ายเลเวล: ในเกมเลขเลเวลวางทับกลางป้าย */}
      <div className={`relative flex items-center justify-center ${big ? 'h-14 w-40' : 'h-8 w-20 sm:w-24'}`}>
        <img src={border.plate} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
        <span className={`relative font-display font-bold text-white [text-shadow:0_1px_2px_#000] ${big ? 'text-2xl' : 'text-sm'}`}>{level}</span>
      </div>
    </div>
  )
}

export default function LevelPicker({ borders, card }: { borders: BorderItem[]; card: string | null }) {
  const { t } = useI18n()
  const l = t.levels
  // เก็บเป็นข้อความ ลบช่องจนว่างแล้วพิมพ์ใหม่ได้ (ช่องว่าง = เลเวล 1)
  const [raw, setRaw] = useState('1')
  const level = Math.min(LEVEL_MAX, Math.max(1, Math.floor(Number(raw)) || 1))
  const idx = borderIndex(borders, level)
  const current = borders[idx]
  const next = borders[idx + 1]
  const set = (v: number) => setRaw(String(v))

  return (
    <>
      <div className="card grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <label htmlFor="lv" className="font-display text-xl font-bold">
            {l.input}
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              id="lv"
              type="number"
              inputMode="numeric"
              min={1}
              max={LEVEL_MAX}
              value={raw}
              onChange={(e) => setRaw(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={() => setRaw(String(level))}
              className="w-28 border-[1.5px] border-ink bg-paper px-3 py-2 font-display text-2xl font-bold"
            />
            <input
              type="range"
              min={1}
              max={500}
              value={Math.min(level, 500)}
              onChange={(e) => set(Number(e.target.value))}
              aria-label={l.input}
              className="w-full accent-[var(--color-red)]"
            />
          </div>
          <p className="mt-6 text-sm text-ink-soft">{l.current}</p>
          <p className="font-display text-3xl font-bold">{l.from(current.from)}</p>
          <p className="mt-2 text-ink-soft">{next ? l.next(next.from - level, next.from) : l.maxed}</p>
          {next && (
            <div className="mt-3 h-3 max-w-md border-[1.5px] border-ink bg-paper" aria-hidden>
              <div className="h-full bg-red" style={{ width: `${((level - current.from) / (next.from - current.from)) * 100}%` }} />
            </div>
          )}
        </div>
        <div className="screen flex justify-center rounded-none p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #3255a4, #1c1e24 75%)' }}>
          <Preview border={current} level={level} card={card} big />
        </div>
      </div>

      <div className="mt-14">
        <SectionHeading title={l.allTitle} note={l.allNote} />
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {borders.map((b, i) => (
            <li key={b.uuid}>
              <button
                onClick={() => set(b.from)}
                aria-pressed={i === idx}
                className={`flex w-full flex-col items-center gap-2 border-[1.5px] p-2 transition-transform hover:-translate-y-0.5 ${
                  i === idx ? 'border-red bg-ink text-paper' : 'border-ink bg-night text-paper'
                }`}
              >
                <Preview border={b} level={b.from} card={null} />
                <span className="font-mono text-xs">{l.from(b.from)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
