'use client'

import { useState, useEffect } from 'react'
import { useDeviceSize } from '@/hooks/useDeviceSize'

interface DamageRange {
  rangeStartMeters: number
  rangeEndMeters: number
  headDamage: number
  bodyDamage: number
  legDamage: number
}

interface WeaponStats {
  fireRate: number
  magazineSize: number
  reloadTimeSeconds: number
  equipTimeSeconds: number
  firstBulletAccuracy: number
  wallPenetration: string
  damageRanges: DamageRange[]
}

interface Weapon {
  uuid: string
  displayName: string
  category: string
  displayIcon: string
  shopData: {
    cost: number
    category: string
    categoryText: string
  } | null
  weaponStats: WeaponStats | null
}

const CATEGORY_ORDER = [
  'EEquippableCategory::Sidearm',
  'EEquippableCategory::SMG',
  'EEquippableCategory::Shotgun',
  'EEquippableCategory::Rifle',
  'EEquippableCategory::Sniper',
  'EEquippableCategory::Heavy',
  'EEquippableCategory::Melee',
]

const CATEGORY_LABEL: Record<string, string> = {
  'EEquippableCategory::Sidearm': 'Sidearm',
  'EEquippableCategory::SMG': 'SMG',
  'EEquippableCategory::Shotgun': 'Shotgun',
  'EEquippableCategory::Rifle': 'Rifle',
  'EEquippableCategory::Sniper': 'Sniper',
  'EEquippableCategory::Heavy': 'Heavy',
  'EEquippableCategory::Melee': 'Melee',
}

const WALL_PEN: Record<string, string> = {
  'EWallPenetrationDisplayType::Low': 'ต่ำ',
  'EWallPenetrationDisplayType::Medium': 'กลาง',
  'EWallPenetrationDisplayType::High': 'สูง',
}

export default function WeaponsClient({ weapons }: { weapons: Weapon[] }) {
  const [selected, setSelected] = useState<Weapon | null>(null)
  const [filterCat, setFilterCat] = useState('ALL')
  const { isMobile } = useDeviceSize()

  const categories = [
    'ALL',
    ...CATEGORY_ORDER.filter(cat => weapons.some(w => w.category === cat))
  ]

  const filtered = filterCat === 'ALL'
    ? weapons
    : weapons.filter(w => w.category === filterCat)

  const stats = selected?.weaponStats

  // ปิดด้วย ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div
      className="bg-[#0f1923] flex flex-col relative overflow-x-hidden"
      style={{ minHeight: 'calc(100vh - 20px)' }}
    >
      {/* bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0f1923] via-[#0f1923] to-[#1a2a3a] pointer-events-none" />

      {/* Main content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-5 md:px-16 py-8">
        {selected ? (
          <div className="w-full max-w-4xl">

            {/* รูปปืน */}
            <div className="flex justify-center mb-6">
              <img
                key={selected.uuid}
                src={selected.displayIcon}
                alt={selected.displayName}
                className="w-full max-w-xl object-contain"
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(255,70,84,0.2))',
                  animation: 'fadeInWeapon 0.4s ease-out',
                }}
              />
            </div>

            {/* ชื่อ + ราคา */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase mb-1">
                  // {CATEGORY_LABEL[selected.category] ?? selected.category}
                </p>
                <h1 className="font-rajdhani font-bold text-5xl md:text-6xl uppercase text-white leading-none">
                  {selected.displayName}
                </h1>
              </div>
              {selected.shopData?.cost && (
                <div className="text-right flex-shrink-0">
                  <p className="font-barlow text-white/30 text-[10px] uppercase tracking-widest">ราคา</p>
                  <p className="font-rajdhani font-bold text-3xl text-[#ff4654]">
                    {selected.shopData.cost.toLocaleString()} ¢
                  </p>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-white/10 mb-6" />

            {/* Stats */}
            {stats ? (
              <>
                <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase mb-3">
                  // Stats
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Fire Rate', value: `${stats.fireRate}/วิ` },
                    { label: 'Magazine', value: `${stats.magazineSize} นัด` },
                    { label: 'Reload', value: `${stats.reloadTimeSeconds}s` },
                    { label: 'Equip Time', value: `${stats.equipTimeSeconds}s` },
                    { label: 'Accuracy', value: `${(stats.firstBulletAccuracy * 100).toFixed(0)}%` },
                    { label: 'Wall Pen', value: WALL_PEN[stats.wallPenetration] ?? '-' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-sm p-3">
                      <p className="font-barlow text-white/40 text-[9px] uppercase tracking-widest mb-1">
                        {s.label}
                      </p>
                      <p className="font-rajdhani font-bold text-white text-xl">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Damage table */}
                {stats.damageRanges.length > 0 && (
                  <>
                    <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase mb-3">
                      // Damage
                    </p>
                    <div className="border border-white/10 rounded-sm overflow-hidden mb-6">
                      <div className="grid grid-cols-4 bg-white/5 px-4 py-2">
                        {['ระยะ (m)', 'หัว', 'ตัว', 'ขา'].map(h => (
                          <p key={h} className="font-barlow text-white/30 text-[9px] uppercase tracking-widest">
                            {h}
                          </p>
                        ))}
                      </div>
                      {stats.damageRanges.map((range, i) => (
                        <div key={i} className="grid grid-cols-4 px-4 py-3 border-t border-white/5 hover:bg-white/5 transition-colors">
                          <p className="font-barlow text-white/50 text-xs">
                            {range.rangeStartMeters}–{range.rangeEndMeters}
                          </p>
                          <p className="font-rajdhani font-bold text-[#ff4654] text-base">
                            {range.headDamage}
                          </p>
                          <p className="font-rajdhani font-bold text-white text-base">
                            {range.bodyDamage}
                          </p>
                          <p className="font-rajdhani font-bold text-white/50 text-base">
                            {Math.round(range.legDamage)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="font-barlow text-white/20 text-sm text-center py-8">
                ไม่มีข้อมูล stats สำหรับอาวุธนี้
              </p>
            )}

          </div>
        ) : (
          <div className="text-center">
            <p className="font-rajdhani font-bold text-3xl md:text-4xl uppercase text-white/20 tracking-widest">
              เลือกอาวุธ
            </p>
            <p className="font-barlow text-white/20 text-sm mt-2 tracking-widest uppercase">
              Select a weapon below
            </p>
          </div>
        )}
      </div>

      {/* แถบล่าง */}
      <div className="relative z-20 border-t border-white/10 bg-[#0f1923]/90 backdrop-blur-sm">

        {/* Filter tabs */}
        <div className="pt-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-end gap-1 px-5 min-w-max md:min-w-0 md:justify-center mx-auto">
            {categories.map((cat) => {
              const isActive = filterCat === cat
              const label = cat === 'ALL' ? 'All' : (CATEGORY_LABEL[cat] ?? cat)
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCat(cat)
                    setSelected(null)
                  }}
                  className="relative font-barlow text-[10px] tracking-widest uppercase transition-all duration-200"
                  style={{
                    padding: isActive ? '8px 16px 10px' : '6px 12px 8px',
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                    borderTop: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    borderLeft: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    borderRight: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    borderBottom: '1px solid transparent',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: isActive ? '-1px' : '0',
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-sm bg-[#ff4654]" />
                  )}
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-b border-white/10 mx-5" />

        {/* weapon list */}
        <div
          className="flex px-5 pb-6 gap-6 scrollbar-hide items-end"
          style={{ overflowX: 'auto', overflowY: 'visible', paddingTop: '40px' }}
        >
          {filtered.map((weapon) => {
            const isSelected = selected?.uuid === weapon.uuid
            return (
              <button
                key={weapon.uuid}
                onClick={() => setSelected(isSelected ? null : weapon)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
                style={{ overflow: 'visible', position: 'relative' }}
              >
                {/* spacer */}
                <div style={{ height: isSelected ? '16px' : '0px', transition: 'height 0.2s' }} />

                {/* รูปปกติ */}
                <img
                  src={weapon.displayIcon}
                  alt={weapon.displayName}
                  className={`h-10 w-auto object-contain transition-all duration-200 ${
                    isSelected
                      ? 'opacity-0'
                      : 'opacity-40 grayscale hover:opacity-80 hover:grayscale-0'
                  }`}
                />

                {/* รูปโผล่ขึ้น */}
                {isSelected && (
                  <img
                    src={weapon.displayIcon}
                    alt={weapon.displayName}
                    className="object-contain"
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '52px',
                      width: 'auto',
                      zIndex: 50,
                      animation: 'popUp 0.2s ease-out',
                      filter: 'drop-shadow(0 0 8px rgba(255,70,84,0.7))',
                    }}
                  />
                )}

                {/* ชื่อ */}
                <span
                  className="font-barlow text-[9px] uppercase tracking-wider whitespace-nowrap"
                  style={{ color: isSelected ? '#ff4654' : 'rgba(255,255,255,0.3)' }}
                >
                  {weapon.displayName}
                </span>

                {isSelected && (
                  <div className="h-[2px] w-full rounded-full bg-[#ff4654] opacity-60" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInWeapon {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popUp {
          from { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}