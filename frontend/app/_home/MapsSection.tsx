import Link from 'next/link'
import type { GameMap } from '../maps/MapsClient'

export default function MapsSection({ mapPreviews }: { mapPreviews?: GameMap[] }) {
  return (
    <section className="relative bg-white" style={{ borderTop: '1px solid #e5e7eb', padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 80px)' }}>
      <div className="max-w-6xl mx-auto">
        <div data-reveal="right" className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: '#ff4654' }} />
              <span className="font-barlow uppercase tracking-[4px] text-[#ff4654]" style={{ fontSize: '10px' }}>02</span>
            </div>
            <h2 className="font-rajdhani font-bold uppercase text-[#0f1923]" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-1px' }}>
              แผนที่
            </h2>
          </div>
          <Link href="/maps" className="font-barlow uppercase tracking-widest text-[#ff4654] hover:text-[#0f1923] transition-colors flex items-center gap-2" style={{ fontSize: '11px' }}>
            ดูทั้งหมด <span>→</span>
          </Link>
        </div>

        {/* map grid */}
        {mapPreviews && (
          <div data-reveal-stagger className="perspective grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapPreviews.map((map: GameMap) => (
              <Link href="/maps" key={map.uuid} data-reveal-item>
                <div
                  data-tilt
                  data-tilt-strength="8"
                  className="tilt-card relative overflow-hidden rounded-2xl cursor-pointer shadow-lg"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img src={map.listViewIcon ?? map.splash} alt={map.displayName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div className="glass rounded-xl" style={{ padding: '8px 14px' }}>
                      <p className="font-barlow text-[#ff4654] uppercase tracking-widest mb-1" style={{ fontSize: '9px' }}>{'// Map'}</p>
                      <p className="font-rajdhani font-bold text-white uppercase" style={{ fontSize: '18px', letterSpacing: '1px' }}>
                        {map.displayName}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
