import Link from 'next/link'
import type { Agent } from '../agents/AgentsClient'

export default function AgentsSection({ agentPreviews }: { agentPreviews?: Agent[] }) {
  return (
    <section className="relative bg-[#0f1923]" style={{ padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 80px)' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,70,84,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,70,84,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div data-reveal="left" className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: '#ff4654' }} />
              <span className="font-barlow uppercase tracking-[4px] text-[#ff4654]" style={{ fontSize: '10px' }}>01</span>
            </div>
            <h2 className="font-rajdhani font-bold uppercase text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-1px' }}>
              เอเจนท์
            </h2>
          </div>
          <Link href="/agents" className="font-barlow uppercase tracking-widest text-[#ff4654] hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: '11px' }}>
            ดูทั้งหมด <span>→</span>
          </Link>
        </div>

        {/* agent grid */}
        {agentPreviews && (
          <div data-reveal-stagger className="perspective grid grid-cols-3 md:grid-cols-6 gap-3">
            {agentPreviews.map((agent: Agent) => (
              <Link href="/agents" key={agent.uuid} data-reveal-item>
                <div
                  data-tilt
                  data-tilt-strength="14"
                  className="tilt-card glass relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    aspectRatio: '1',
                    background: `linear-gradient(135deg, #${agent.backgroundGradientColors?.[0]?.slice(0, 6) ?? '1a1a2e'}40, rgba(15,25,35,0.6))`,
                  }}
                >
                  <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end" style={{ padding: '10px 12px' }}>
                    <p className="font-barlow text-white uppercase tracking-wide truncate" style={{ fontSize: '10px' }}>
                      {agent.displayName}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="font-barlow text-white/20 mt-4" style={{ fontSize: '12px' }}>
          เลือกสไตล์การเล่นของคุณด้วยเอเจนท์หลากหลาย แต่ละตัวมีสกิลเฉพาะตัวที่ไม่เหมือนใคร
        </p>
      </div>
    </section>
  )
}
