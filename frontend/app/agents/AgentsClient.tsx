'use client'

import { useState } from 'react'

interface Ability {
  slot: string
  displayName: string
  description: string
  displayIcon: string | null
}

interface Agent {
  uuid: string
  displayName: string
  description: string
  fullPortrait: string
  displayIcon: string
  background: string
  backgroundGradientColors: string[]
  role: {
    displayName: string
    description: string
    displayIcon: string
  }
  abilities: Ability[]
}

export default function AgentsClient({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState<Agent | null>(null)
  const [activeAbility, setActiveAbility] = useState<number | null>(null)

  const bgColor = selected?.backgroundGradientColors?.[0]
    ? `#${selected.backgroundGradientColors[0].slice(0, 6)}`
    : '#0f1923'

  return (
    <div className="min-h-screen bg-[#0f1923] flex flex-col relative overflow-hidden">

      {/* background gradient */}
      <div
        className="absolute inset-0 opacity-20 transition-all duration-700"
        style={{ backgroundColor: bgColor }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent" />

      {/* main area */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        {selected ? (
          <div className="flex items-end gap-16 px-16 w-full max-w-6xl">

            {/* รูป agent */}
            <div className="relative flex-shrink-0 flex items-end justify-center">
              {selected.background && (
                <img
                  src={selected.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-10"
                />
              )}
              <img
                key={selected.uuid}
                src={selected.fullPortrait ?? ''}
                alt={selected.displayName}
                className="h-[70vh] w-auto object-contain"
                style={{ animation: 'fadeInUp 0.4s ease-out' }}
              />
            </div>

            {/* info */}
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-3">
                {selected.role?.displayIcon && (
                  <img src={selected.role.displayIcon} alt="" className="w-4 h-4 opacity-60" />
                )}
                <span className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase">
                  {selected.role?.displayName}
                </span>
              </div>

              <h1 className="font-rajdhani font-bold text-7xl uppercase leading-none text-white mb-3">
                {selected.displayName}
              </h1>

              <p className="font-barlow text-white/60 text-sm leading-relaxed mb-8 max-w-md">
                {selected.description}
              </p>

              {/* abilities */}
              <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase mb-3">
                // Abilities
              </p>
              <div className="flex gap-3 mb-4">
                {selected.abilities.filter((a) => a.displayIcon).map((ability, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAbility(activeAbility === i ? null : i)}
                    className={`w-12 h-12 rounded-sm border p-2 transition-all duration-200
                      ${activeAbility === i
                        ? 'border-[#ff4654] bg-[#ff4654]/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                  >
                    <img
                      src={ability.displayIcon ?? ''}
                      alt={ability.displayName}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* ability accordion */}
              <div className={`overflow-hidden transition-all duration-300 ${activeAbility !== null ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                {activeAbility !== null && selected.abilities[activeAbility] && (
                  <div className="border border-[#ff4654]/20 bg-[#ff4654]/5 rounded-sm p-4 max-w-md">
                    <p className="font-rajdhani font-bold text-lg uppercase text-white mb-1">
                      {selected.abilities[activeAbility].displayName}
                    </p>
                    <p className="font-barlow text-white/60 text-sm leading-relaxed">
                      {selected.abilities[activeAbility].description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ยังไม่เลือก */
          <div className="text-center">
            <p className="font-rajdhani font-bold text-4xl uppercase text-white/20 tracking-widest">
              เลือกเอเจนท์
            </p>
            <p className="font-barlow text-white/20 text-sm mt-2 tracking-widest uppercase">
              Select an agent below
            </p>
          </div>
        )}
      </div>

      {/* แถบ agent ด้านล่าง */}
      <div className="relative z-20">

        {/* รูป selected ที่ลอยอยู่เหนือ nav — render แยกออกมา */}
        {selected && (
          <div
            className="absolute bottom-full left-0 right-0 pointer-events-none"
            style={{ height: '60px' }}
          >
            {/* ไม่ต้องทำอะไรตรงนี้ เราจะใช้วิธีอื่น */}
          </div>
        )}

        <div className="border-t border-white/10 bg-[#0f1923]/90 backdrop-blur-sm">
          <div
            className="flex px-6 pb-4 gap-4 scrollbar-hide items-end"
            style={{
              overflowX: 'auto',
              overflowY: 'visible',
              paddingTop: '48px', // พื้นที่สำหรับรูปที่โผล่ขึ้น
            }}
          >
            {agents.map((agent) => {
              const isSelected = selected?.uuid === agent.uuid
              return (
                <button
                  key={agent.uuid}
                  onClick={() => {
                    if (isSelected) {
                      setSelected(null)
                      setActiveAbility(null)
                    } else {
                      setSelected(agent)
                      setActiveAbility(null)
                    }
                  }}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  style={{ overflow: 'visible', position: 'relative' }}
                >
                  {/* รูปปกติ — ซ่อนตอน selected */}
                  <img
                    src={agent.displayIcon}
                    alt={agent.displayName}
                    className={`w-14 h-14 object-cover rounded-sm transition-all duration-200 ${isSelected
                      ? 'opacity-0'  // ซ่อนตัวเดิม
                      : 'opacity-40 grayscale hover:opacity-70 hover:grayscale-0'
                      }`}
                  />

                  {/* รูปที่โผล่ขึ้น — absolute ลอยเหนือ nav */}
                  {isSelected && (
                    <img
                      src={agent.displayIcon}
                      alt={agent.displayName}
                      className="object-cover rounded-sm"
                      style={{
                        position: 'absolute',
                        bottom: '30%',        // ← เปลี่ยนตรงนี้ ให้นับจากขอบบนของ button ขึ้นไป
                        marginBottom: '4px',   // ← ระยะห่างจากชื่อ
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '72px',
                        height: '72px',
                        zIndex: 50,
                        animation: 'popUp 0.2s ease-out',
                      }}
                    />
                  )}

                  <span
                    className={`font-barlow text-[9px] uppercase tracking-wider transition-all duration-200 mt-1 ${isSelected ? 'text-white' : 'text-white/30'
                      }`}
                  >
                    {agent.displayName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes popUp {
    from { opacity: 0; transform: translateX(-50%) scale(0.8); }
    to { opacity: 1; transform: translateX(-50%) scale(1); }
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`}</style>

    </div>
  )
}