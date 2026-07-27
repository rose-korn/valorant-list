import Link from 'next/link'
import type { WeaponPreview } from './types'

export default function WeaponsSection({ weaponPreviews }: { weaponPreviews?: WeaponPreview[] }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        borderTop: '1px solid rgba(255,70,84,0.15)',
        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 80px)',
        background: 'linear-gradient(135deg, #050d14 0%, #0f1923 60%, #0a0f14 100%)',
      }}
    >
      {/* red glow */}
      <div
        className="liquid-blob absolute pointer-events-none"
        style={{
          bottom: '-100px', left: '10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,70,84,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div data-reveal="left" className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: '#ff4654' }} />
              <span className="font-barlow uppercase tracking-[4px] text-[#ff4654]" style={{ fontSize: '10px' }}>03</span>
            </div>
            <h2 className="font-rajdhani font-bold uppercase text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-1px' }}>
              อาวุธ
            </h2>
          </div>
          <Link href="/weapons" className="font-barlow uppercase tracking-widest text-[#ff4654] hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: '11px' }}>
            ดูทั้งหมด <span>→</span>
          </Link>
        </div>

        {/* weapon showcase */}
        {weaponPreviews && (
          <div data-reveal-stagger className="flex flex-col gap-4">
            {weaponPreviews.map((weapon: WeaponPreview, i: number) => (
              <Link href="/weapons" key={weapon.uuid} data-reveal-item>
                <div
                  className="glass flex items-center gap-4 md:gap-6 group cursor-pointer rounded-2xl"
                  style={{ padding: '16px 20px' }}
                >
                  <span
                    className="font-rajdhani font-bold text-white/15 group-hover:text-[#ff4654]/40 transition-colors flex-shrink-0"
                    style={{ fontSize: '11px', width: '24px' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={weapon.displayIcon}
                    alt={weapon.displayName}
                    className="object-contain flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ height: '40px', width: 'clamp(90px, 20vw, 160px)', filter: 'brightness(0.75)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-rajdhani font-bold uppercase text-white/60 group-hover:text-white transition-colors truncate"
                      style={{ fontSize: '16px', letterSpacing: '2px' }}
                    >
                      {weapon.displayName}
                    </p>
                  </div>
                  <span className="font-barlow text-white/20 group-hover:text-[#ff4654] group-hover:translate-x-1 transition-all flex-shrink-0" style={{ fontSize: '11px' }}>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
