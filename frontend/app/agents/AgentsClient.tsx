'use client'

import { useAgentImageHeight } from '@/hooks/useAgentImageHeight'
import { useDeviceSize } from '@/hooks/useDeviceSize'
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

const keyBindMap: Record<string, string> = {
  Ability1: 'Q',
  Ability2: 'E',
  Grenade: 'C',
  Ultimate: 'X',
  Passive: '—',
}

export default function AgentsClient({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState<Agent | null>(null)
  const [activeAbility, setActiveAbility] = useState<number | null>(null)
  const [filterRole, setFilterRole] = useState('ALL')
  const { isMobile, isTablet } = useDeviceSize()
  const { height, marginTop } = useAgentImageHeight()

  const bgColor = selected?.backgroundGradientColors?.[0]
    ? `#${selected.backgroundGradientColors[0].slice(0, 6)}`
    : '#0f1923'

  const selectAgent = (agent: Agent) => {
    if (selected?.uuid === agent.uuid) {
      setSelected(null)
      setActiveAbility(null)
      return
    }
    setSelected(agent)
    setActiveAbility(null)
  }

  return (
    <div
      className="bg-[#0f1923] flex flex-col relative overflow-x-hidden"
      style={{ minHeight: 'calc(100vh - 20px)' }}
    >
      {/* background color */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ backgroundColor: bgColor, opacity: 0.08 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923]/80 via-transparent to-transparent" />

      {/* main area */}
      <div className="flex-1 relative z-10 flex items-center justify-center py-6">
        {selected ? (
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-16 w-full max-w-6xl px-5 md:px-12">

            {/* รูป agent */}
            <div
              className="relative flex-shrink-0 flex items-end justify-center w-full md:w-auto"
              style={{ maxHeight: isMobile ? '40vh' : undefined, overflow: isMobile ? 'hidden' : 'visible' }}
            >
              {selected.background && (
                <img
                  src={selected.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain opacity-30"
                  style={{ zIndex: 0, marginTop, animation: 'slideFromLeft 0.5s ease-out' }}
                />
              )}
              <img
                key={selected.uuid}
                src={selected.fullPortrait ?? ''}
                alt={selected.displayName}
                className="relative w-auto object-contain"
                style={{
                  zIndex: 1,
                  height,
                  marginTop,
                  animation: 'slideFromRight 0.5s ease-out',
                }}
              />
            </div>

            {/* info */}
            <div className="flex-1 pb-4 md:pb-8 w-full px-5 md:px-0">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                {selected.role?.displayIcon && (
                  <img src={selected.role.displayIcon} alt="" className="w-4 h-4 opacity-60" />
                )}
                <span className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase">
                  {selected.role?.displayName}
                </span>
              </div>

              <h1 className="font-rajdhani font-bold text-5xl md:text-7xl uppercase leading-none text-white mb-2 md:mb-3">
                {selected.displayName}
              </h1>

              <p className="font-barlow text-white/60 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-md">
                {selected.description}
              </p>

              {/* abilities */}
              <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase mb-1">
                // Abilities
              </p>
              <p className="font-barlow text-white/20 text-[9px] mb-2">
                กดที่สกิลเพื่อดูคำอธิบาย
              </p>
              <div className="flex gap-2 md:gap-3 mb-3 flex-wrap">
                {selected.abilities.filter((a) => a.displayIcon).map((ability, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAbility(activeAbility === i ? null : i)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-sm border p-1.5 md:p-2 transition-all duration-200
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
              <div className={`overflow-hidden transition-all duration-500 pt-4 md:pt-6 ${activeAbility !== null ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {activeAbility !== null && selected.abilities[activeAbility] && (
                  <div className="border border-[#ff4654]/20 bg-[#ff4654]/5 rounded-sm mt-6 md:mt-8">

                    {/* header — ชื่อ + keybind */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ff4654]/10">

                      <div className="flex-shrink-0 w-8 h-8 border border-white/20 bg-white/5 rounded-sm flex items-center justify-center">
                        <span className="font-rajdhani font-bold text-white text-sm">
                          {keyBindMap[selected.abilities[activeAbility].slot] ?? '—'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-rajdhani font-bold text-xl md:text-2xl uppercase text-white leading-none">
                          {selected.abilities[activeAbility].displayName}
                        </p>
                        <p className="font-barlow text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                          Ability
                        </p>
                      </div>

                    </div>

                    {/* description */}
                    <div className="px-4 py-4">
                      <p className="font-barlow text-white/70 text-sm md:text-base leading-relaxed">
                        {selected.abilities[activeAbility].description}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center px-4">
            <p className="font-rajdhani font-bold text-3xl md:text-4xl uppercase text-white/20 tracking-widest">
              เลือกเอเจนท์
            </p>
            <p className="font-barlow text-white/20 text-sm mt-2 tracking-widest uppercase">
              Select an agent below
            </p>
          </div>
        )}
      </div>

      {/* แถบล่าง */}
      <div className="relative z-20">
        <div
          className="border-t border-white/10 backdrop-blur-sm transition-all duration-700"
          style={{
            background: selected
              ? `linear-gradient(to right,
                  #${selected.backgroundGradientColors?.[0]?.slice(0, 6) ?? '0f1923'}20,
                  #${selected.backgroundGradientColors?.[1]?.slice(0, 6) ?? '0f1923'}10,
                  transparent)`
              : 'rgba(15,25,35,0.9)',
          }}
        >
          {/* Filter tabs */}
          <div className="pt-4 scrollbar-hide">
            <div className="flex items-end gap-1 px-5 min-w-max md:min-w-0 md:justify-center mx-auto">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'DUELIST', label: 'Duelist' },
                { key: 'INITIATOR', label: 'Initiator' },
                { key: 'CONTROLLER', label: 'Controller' },
                { key: 'SENTINEL', label: 'Sentinel' },
              ].map((role) => {
                const isActive = filterRole === role.key
                return (
                  <button
                    key={role.key}
                    onClick={() => setFilterRole(role.key)}
                    className="relative font-barlow text-[10px] tracking-widest uppercase transition-all duration-200"
                    style={{
                      padding: isActive ? '8px 20px 10px' : '6px 16px 8px',
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
                    {role.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-b border-white/10 mx-5" />

          {/* agent icons */}
          <div className="px-5 pb-8" style={{ paddingTop: '40px' }}>
            <div className="flex flex-wrap gap-4 justify-center items-end">
              {agents
                .filter((agent) =>
                  filterRole === 'ALL'
                    ? true
                    : agent.role?.displayName?.toUpperCase() === filterRole
                )
                .map((agent) => {
                  const isSelected = selected?.uuid === agent.uuid
                  const agentColor = agent.backgroundGradientColors?.[0]
                    ? `#${agent.backgroundGradientColors[0].slice(0, 6)}`
                    : 'transparent'

                  return (
                    <button
                      key={agent.uuid}
                      onClick={() => selectAgent(agent)}
                      className="flex flex-col items-center gap-1 flex-shrink-0"
                      style={{ overflow: 'visible', position: 'relative' }}
                    >
                      <div style={{ height: isSelected ? '16px' : '0px', transition: 'height 0.2s' }} />

                      <img
                        src={agent.displayIcon}
                        alt={agent.displayName}
                        className={`w-14 h-14 object-cover rounded-sm transition-all duration-200 ${isSelected
                          ? 'opacity-0'
                          : 'opacity-40 grayscale hover:opacity-70 hover:grayscale-0'
                          }`}
                      />

                      {isSelected && (
                        <img
                          src={agent.displayIcon}
                          alt={agent.displayName}
                          className="object-cover rounded-sm"
                          style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80px',
                            height: '80px',
                            zIndex: 50,
                            animation: 'popUp 0.2s ease-out',
                            filter: `drop-shadow(0 0 10px ${agentColor}90)`,
                          }}
                        />
                      )}

                      <span
                        className="font-barlow text-[9px] uppercase tracking-wider transition-all duration-200"
                        style={{ color: isSelected ? agentColor : 'rgba(255,255,255,0.3)' }}
                      >
                        {agent.displayName}
                      </span>

                      {isSelected && (
                        <div
                          className="h-[2px] w-full rounded-full"
                          style={{ backgroundColor: agentColor, opacity: 0.6 }}
                        />
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popUp {
          from { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}