'use client'

import { useState, useEffect } from 'react'
import { useDeviceSize } from '@/hooks/useDeviceSize'

interface GameMap {
    uuid: string
    displayName: string
    coordinates: string
    splash: string
    displayIcon: string
    listViewIcon: string
    callouts: {
        regionName: string
        superRegionName: string
        location: { x: number; y: number }
    }[] | null
}

export default function MapsClient({ maps }: { maps: GameMap[] }) {
    const [selected, setSelected] = useState<GameMap | null>(null)
    const { isMobile, isTablet } = useDeviceSize()
    const isMobileOrTablet = isMobile || isTablet
    const [showMinimap, setShowMinimap] = useState(false)
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowMinimap(false)
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])
    return (
        <div
            className="bg-[#0f1923] flex relative overflow-x-hidden"
            style={{ minHeight: 'calc(100vh - 20px)', flexDirection: isMobileOrTablet ? 'column' : 'row' }}
        >

            {/* ซ้าย — list แมพ (คอมเท่านั้น) */}
            {!isMobileOrTablet && (
                <div className="w-64 flex-shrink-0 border-r border-white/10 overflow-y-auto h-screen sticky top-14 z-20 scrollbar-hide">
                    <div className="p-4 border-b border-white/5">
                        <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase">
                        // Select Map
                        </p>
                    </div>
                    {maps.map((map) => {
                        const isSelected = selected?.uuid === map.uuid
                        return (
                            <button
                                key={map.uuid}
                                onClick={() => setSelected(isSelected ? null : map)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 transition-all duration-200 text-left ${isSelected
                                    ? 'bg-[#ff4654]/10 border-l-2 border-l-[#ff4654]'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="w-16 h-10 flex-shrink-0 overflow-hidden rounded-sm">
                                    <img
                                        src={map.listViewIcon ?? map.splash}
                                        alt={map.displayName}
                                        className={`w-full h-full object-cover transition-all duration-200 ${isSelected ? 'grayscale-0' : 'grayscale opacity-50'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <p className={`font-rajdhani font-bold text-sm uppercase tracking-wide ${isSelected ? 'text-white' : 'text-white/50'
                                        }`}>
                                        {map.displayName}
                                    </p>
                                    {map.coordinates && (
                                        <p className="font-barlow text-[9px] text-white/30 tracking-widest">
                                            {map.coordinates}
                                        </p>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ขวา / main */}
            <div
                className="flex-1 flex flex-col relative"
                style={{
                    height: isMobileOrTablet ? 'calc(100vh - 56px)' : '100vh'
                    // 56px = ความสูง navbar
                }}
            >
                {/* Hero splash */}
                <div className="flex-1 relative overflow-hidden">
                    {selected ? (
                        <img
                            key={selected.uuid}
                            src={selected.splash}
                            alt={selected.displayName}
                            className="w-full h-full object-cover object-center" // ← เพิ่ม object-center
                            style={{ animation: 'fadeIn 0.6s ease-out' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center px-4">
                                <p className="font-rajdhani font-bold text-3xl md:text-4xl uppercase text-white/20 tracking-widest">
                                    เลือกแผนที่
                                </p>
                                <p className="font-barlow text-white/20 text-sm mt-2 tracking-widest uppercase">
                                    {isMobileOrTablet ? 'Scroll below to select' : 'Select from the left'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-[#0f1923]/10 to-transparent pointer-events-none" />
                    {/* ข้อมูล overlay */}
                    {selected && (
                        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end gap-4">
                            <div className="flex-1">
                                <p className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase mb-1">
        // Map
                                </p>
                                <h1
                                    className="font-rajdhani font-bold uppercase text-white leading-none mb-1"
                                    style={{
                                        fontSize: isMobileOrTablet ? 'clamp(2rem, 8vw, 4rem)' : 'clamp(3rem, 6vw, 5rem)',
                                        animation: 'fadeIn 0.4s ease-out',
                                    }}
                                >
                                    {selected.displayName}
                                </h1>
                                {selected.coordinates && (
                                    <p className="font-barlow text-white/40 text-xs tracking-widest">
                                        {selected.coordinates}
                                    </p>
                                )}
                            </div>

                            {/* minimap button — ทั้งมือถือและคอม */}
                            {selected.displayIcon && (
                                <button
                                    onClick={() => setShowMinimap(true)}
                                    className="flex-shrink-0 border border-white/10 rounded-sm overflow-hidden bg-black/30 hover:border-[#ff4654]/40 transition-all duration-200 group relative"
                                    style={{ width: isMobileOrTablet ? '72px' : '160px', height: isMobileOrTablet ? '72px' : '160px' }}
                                >
                                    <img
                                        src={selected.displayIcon}
                                        alt="minimap"
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="font-barlow text-white text-[9px] uppercase tracking-widest">
                                            ขยาย
                                        </span>
                                    </div>
                                </button>
                            )}

                            {/* minimap — คอมแสดง label */}
                            {!isMobileOrTablet && (
                                <div className="absolute top-0 right-8 transform -translate-y-6">
                                    <p className="font-barlow text-white/30 text-[9px] tracking-[3px] uppercase">
          // Minimap
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* แถบมือถือ — ชิดล่างสุด */}
                {isMobileOrTablet && (
                    <div className="flex-shrink-0 border-t border-white/10 bg-[#0f1923]/90 backdrop-blur-sm">
                        <div
                            className="flex px-4 gap-3 items-end scrollbar-hide"
                            style={{
                                overflowX: 'auto',
                                overflowY: 'visible',
                                paddingTop: '40px',
                                paddingBottom: '16px',
                            }}
                        >
                            {maps.map((map) => {
                                const isSelected = selected?.uuid === map.uuid
                                return (
                                    <button
                                        key={map.uuid}
                                        onClick={() => setSelected(isSelected ? null : map)}
                                        className="flex flex-col items-center gap-1 flex-shrink-0"
                                        style={{ overflow: 'visible', position: 'relative' }}
                                    >
                                        <div style={{ height: isSelected ? '16px' : '0px', transition: 'height 0.2s' }} />

                                        <div className={`w-20 h-12 overflow-hidden rounded-sm transition-all duration-200 ${isSelected ? 'opacity-0' : 'opacity-40 grayscale hover:opacity-70 hover:grayscale-0'
                                            }`}>
                                            <img
                                                src={map.listViewIcon ?? map.splash}
                                                alt={map.displayName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {isSelected && (
                                            <div
                                                className="overflow-hidden rounded-sm"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '20px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '100px',
                                                    height: '60px',
                                                    zIndex: 50,
                                                    animation: 'popUp 0.2s ease-out',
                                                    boxShadow: '0 0 16px rgba(255,70,84,0.4)',
                                                    outline: '1px solid rgba(255,70,84,0.5)',
                                                }}
                                            >
                                                <img
                                                    src={map.listViewIcon ?? map.splash}
                                                    alt={map.displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <span
                                            className="font-barlow text-[9px] uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: isSelected ? '#ff4654' : 'rgba(255,255,255,0.3)' }}
                                        >
                                            {map.displayName}
                                        </span>

                                        {isSelected && (
                                            <div className="h-[2px] w-full rounded-full bg-[#ff4654] opacity-60" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
            {/* Modal minimap */}
            {showMinimap && selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
                    onClick={() => setShowMinimap(false)}
                >
                    <div
                        className="relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                    >
                        {/* header */}
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase mb-1">
            // Minimap
                                </p>
                                <p className="font-rajdhani font-bold text-2xl uppercase text-white">
                                    {selected.displayName}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowMinimap(false)}
                                className="w-8 h-8 rounded-full border border-white/20 hover:border-[#ff4654] bg-white/5 hover:bg-[#ff4654]/20 flex items-center justify-center transition-all duration-200"
                            >
                                <span className="text-white/60 hover:text-white text-sm leading-none">✕</span>
                            </button>
                        </div>

                        {/* รูป minimap ใหญ่ */}
                        {/* รูป minimap ใหญ่ */}
                        <div className="border border-white/10 rounded-sm overflow-hidden bg-black/50">
                            <img
                                src={selected.displayIcon}
                                alt={`${selected.displayName} minimap`}
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        {/* Callouts list */}
                        {selected.callouts && selected.callouts.length > 0 && (
                            <div className="mt-4">
                                <p className="font-barlow text-white/30 text-[10px] tracking-[4px] uppercase mb-3">
      // Callouts
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {/* จัดกลุ่มตาม superRegionName */}
                                    {Object.entries(
                                        selected.callouts.reduce((acc, c) => {
                                            const key = c.superRegionName
                                            if (!acc[key]) acc[key] = []
                                            acc[key].push(c.regionName)
                                            return acc
                                        }, {} as Record<string, string[]>)
                                    ).map(([region, names]) => (
                                        <div
                                            key={region}
                                            className="bg-white/5 border border-white/10 rounded-sm px-3 py-2"
                                        >
                                            <p className="font-barlow text-[#ff4654] text-[9px] uppercase tracking-widest mb-1">
                                                {region}
                                            </p>
                                            {names.map((name, i) => (
                                                <p key={i} className="font-barlow text-white/60 text-xs">
                                                    {name}
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="font-barlow text-white/20 text-[9px] uppercase tracking-widest text-center mt-3">
                            กดพื้นที่ด้านนอกเพื่อปิด
                        </p>
                    </div>
                </div>
            )}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes popUp {
          from { opacity: 0; transform: translateX(-50%) scale(0.8); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    )
}