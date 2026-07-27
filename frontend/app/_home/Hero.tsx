import Link from 'next/link'
import type { RefObject } from 'react'
import type { Agent } from '../agents/AgentsClient'

export default function Hero({
  featuredAgent,
  agentPreviews,
  heroLeftRef,
  heroRightRef,
  heroBadgeRef,
}: {
  featuredAgent?: Agent
  agentPreviews?: Agent[]
  heroLeftRef: RefObject<HTMLDivElement | null>
  heroRightRef: RefObject<HTMLDivElement | null>
  heroBadgeRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <section
      className="relative overflow-hidden perspective"
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #050d14 0%, #0f1923 40%, #1a0a0d 100%)',
      }}
    >
      {/* liquid blobs */}
      <div
        className="liquid-blob absolute pointer-events-none"
        style={{
          top: '-160px', right: '-120px',
          width: '620px', height: '620px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,70,84,0.35), rgba(255,70,84,0.02) 70%)',
        }}
      />
      <div
        className="liquid-blob absolute pointer-events-none"
        style={{
          bottom: '-180px', left: '-140px',
          width: '520px', height: '520px',
          background: 'radial-gradient(circle at 60% 60%, rgba(56,120,255,0.18), rgba(56,120,255,0.01) 70%)',
          animationDelay: '-6s',
        }}
      />

      {/* scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,70,84,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,70,84,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* big VALORANT text bg */}
      <div
        className="absolute select-none pointer-events-none font-rajdhani font-bold uppercase"
        style={{
          fontSize: 'clamp(80px, 15vw, 220px)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,70,84,0.06)',
          bottom: '60px',
          left: '-10px',
          lineHeight: 1,
          letterSpacing: '-4px',
          whiteSpace: 'nowrap',
        }}
      >
        VALORANT
      </div>

      {/* content */}
      <div
        className="relative z-10 flex flex-col md:flex-row items-center justify-center md:justify-between"
        style={{
          minHeight: '100svh',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '80px clamp(20px, 6vw, 80px) 40px',
          gap: 'clamp(40px, 6vw, 100px)',
        }}
      >
        {/* left text */}
        <div ref={heroLeftRef} style={{ flex: '1 1 480px', maxWidth: '560px' }}>
          <div
            ref={heroBadgeRef}
            className="glass inline-flex items-center gap-3 mb-6 rounded-full"
            style={{ padding: '8px 16px 8px 14px' }}
          >
            <div style={{ width: '20px', height: '1px', background: '#ff4654' }} />
            <span className="font-barlow uppercase tracking-[5px] text-[#ff4654]" style={{ fontSize: '10px' }}>
              Fan Site
            </span>
            <div
              className="font-barlow rounded-full"
              style={{
                fontSize: '9px',
                padding: '2px 10px',
                background: 'rgba(255,70,84,0.15)',
                color: '#ff8b95',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Live
            </div>
          </div>

          <h1
            className="font-rajdhani font-bold uppercase leading-none"
            style={{ fontSize: 'clamp(52px, 8vw, 92px)', letterSpacing: '-2px', marginBottom: '4px' }}
          >
            Valorant
          </h1>
          <h1
            className="font-rajdhani font-bold uppercase leading-none"
            style={{
              fontSize: 'clamp(52px, 8vw, 92px)',
              letterSpacing: '-2px',
              marginBottom: '24px',
              background: 'linear-gradient(120deg, #ff4654 0%, #ff8b95 50%, #ff4654 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(255,70,84,0.35))',
            }}
          >
            List
          </h1>

          <p
            className="font-barlow text-white/50 leading-relaxed"
            style={{ fontSize: '14px', maxWidth: '380px', marginBottom: '36px' }}
          >
            ข้อมูลตัวละคร แผนที่ และอาวุธครบถ้วน<br />
            อัปเดตทุก patch ในสไตล์ที่เป็นของเราเอง
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/agents"
              className="font-barlow uppercase tracking-widest text-white transition-transform hover:scale-105 rounded-full"
              style={{
                fontSize: '11px',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #ff4654, #d92f3d)',
                boxShadow: '0 8px 28px -6px rgba(255,70,84,0.55)',
              }}
            >
              ดูเอเจนท์
            </Link>
            <Link
              href="/weapons"
              className="glass font-barlow uppercase tracking-widest text-white/80 hover:text-white transition-colors rounded-full"
              style={{ fontSize: '11px', padding: '14px 32px' }}
            >
              ดูอาวุธ
            </Link>
          </div>

          {/* agent icon preview row */}
          {agentPreviews && (
            <div className="glass inline-flex items-center gap-3 rounded-full" style={{ padding: '8px 16px 8px 8px' }}>
              <div className="flex">
                {agentPreviews.slice(0, 5).map((agent: Agent, i: number) => (
                  <div
                    key={agent.uuid}
                    className="rounded-full overflow-hidden"
                    style={{
                      width: '34px', height: '34px',
                      marginLeft: i > 0 ? '-10px' : '0',
                      border: '2px solid #0f1923',
                      background: `#${agent.backgroundGradientColors?.[0]?.slice(0, 6) ?? '1a1a2e'}`,
                    }}
                  >
                    <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="font-barlow text-white/40" style={{ fontSize: '11px' }}>
                +{agentPreviews.length > 5 ? agentPreviews.length - 5 : 0} agents อีกมากมาย
              </p>
            </div>
          )}
        </div>

        {/* right — featured agent, 3D card */}
        {featuredAgent && (
          <div
            ref={heroRightRef}
            className="preserve-3d relative flex items-end justify-center flex-shrink-0"
            style={{ width: 'clamp(260px, 35vw, 440px)', height: 'clamp(340px, 52vh, 600px)' }}
          >
            <div
              className="glass absolute inset-0 rounded-[32px] overflow-hidden"
              style={{ transform: 'translateZ(-1px)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center bottom, #${featuredAgent.backgroundGradientColors?.[0]?.slice(0, 6) ?? 'ff4654'}30 0%, transparent 70%)`,
                }}
              />
              {featuredAgent.background && (
                <img
                  src={featuredAgent.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain opacity-[0.07]"
                />
              )}
            </div>

            <img
              src={featuredAgent.fullPortrait}
              alt={featuredAgent.displayName}
              className="relative z-10 w-auto"
              style={{ height: '74%', objectFit: 'contain', marginBottom: '58px', filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.55))' }}
            />

            {/* scrim so the caption never cuts hard across the art */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 pointer-events-none rounded-b-[32px]"
              style={{ height: '150px', background: 'linear-gradient(to top, rgba(5,13,20,0.92), transparent)' }}
            />

            <div
              className="glass absolute bottom-3 left-3 right-3 text-center rounded-2xl z-20"
              style={{ padding: '10px 8px' }}
            >
              <p className="font-barlow text-white/40 uppercase tracking-widest" style={{ fontSize: '9px' }}>
                {featuredAgent.role?.displayName}
              </p>
              <p className="font-rajdhani font-bold uppercase text-white" style={{ fontSize: '18px', letterSpacing: '2px' }}>
                {featuredAgent.displayName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #ff4654, transparent)' }}
      />
    </section>
  )
}
