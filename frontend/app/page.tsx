import Link from 'next/link'
import Image from 'next/image'

async function getHomeData() {
  const [agentsRes, mapsRes, weaponsRes] = await Promise.all([
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=th-TH', { next: { revalidate: 3600 } }),
    fetch('https://valorant-api.com/v1/maps?language=th-TH', { next: { revalidate: 3600 } }),
    fetch('https://valorant-api.com/v1/weapons?language=th-TH', { next: { revalidate: 3600 } }),
  ])
  const [agents, maps, weapons] = await Promise.all([
    agentsRes.json(),
    mapsRes.json(),
    weaponsRes.json(),
  ])
  return {
    // สุ่มเอาตัวนึง
    featuredAgent: agents.data?.[Math.floor(Math.random() * 10)],
    featuredMap: maps.data?.find((m: any) => m.splash),
    featuredWeapon: weapons.data?.find((w: any) => w.category === 'EEquippableCategory::Rifle' && w.displayIcon),
    // เอามาแสดงใน grid
    agentPreviews: agents.data?.slice(0, 6),
    mapPreviews: maps.data?.filter((m: any) => m.splash).slice(0, 3),
    weaponPreviews: weapons.data?.filter((w: any) => w.displayIcon).slice(0, 5).map((w: any) => ({
      uuid: w.uuid,
      displayName: w.displayName,
      displayIcon: w.displayIcon,
    })),
  }
}

export default async function HomePage() {
  const { featuredAgent, featuredMap, featuredWeapon, agentPreviews, mapPreviews, weaponPreviews } = await getHomeData()

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .a1 { animation: fadeUp 0.9s 0.1s ease-out both; }
        .a2 { animation: fadeUp 0.9s 0.25s ease-out both; }
        .a3 { animation: fadeUp 0.9s 0.4s ease-out both; }
        .a4 { animation: fadeUp 0.9s 0.55s ease-out both; }
        .agent-float { animation: float 4s ease-in-out infinite; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .weapon-hover { transition: all 0.3s ease; }
        .weapon-hover:hover { transform: scale(1.05) translateY(-2px); filter: drop-shadow(0 0 16px rgba(255,70,84,0.5)); }
      `}</style>

      {/* ========== HERO ========== */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #050d14 0%, #0f1923 40%, #1a0a0d 100%)',
        }}
      >
        {/* scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />

        {/* red glow top right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-100px', right: '-100px',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(255,70,84,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
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
          className="relative z-10 flex flex-col md:flex-row items-center"
          style={{
            minHeight: '100vh',
            padding: '80px clamp(24px, 6vw, 80px) 40px',
            gap: '40px',
          }}
        >
          {/* left text */}
          <div style={{ flex: '1 1 480px', maxWidth: '540px' }}>
            <div className="a1 flex items-center gap-3 mb-6">
              <div style={{ width: '32px', height: '1px', background: '#ff4654' }} />
              <span
                className="font-barlow uppercase tracking-[5px] text-[#ff4654]"
                style={{ fontSize: '10px' }}
              >
                Fan Site
              </span>
              <div
                className="font-barlow"
                style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  border: '1px solid rgba(255,70,84,0.3)',
                  color: 'rgba(255,70,84,0.6)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </div>
            </div>

            <h1
              className="a2 font-rajdhani font-bold uppercase leading-none"
              style={{ fontSize: 'clamp(52px, 8vw, 88px)', letterSpacing: '-2px', marginBottom: '4px' }}
            >
              Valorant
            </h1>
            <h1
              className="a2 font-rajdhani font-bold uppercase leading-none"
              style={{
                fontSize: 'clamp(52px, 8vw, 88px)',
                letterSpacing: '-2px',
                marginBottom: '24px',
                color: '#ff4654',
                textShadow: '0 0 40px rgba(255,70,84,0.4)',
              }}
            >
              List
            </h1>

            <p
              className="a3 font-barlow text-white/50 leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '360px', marginBottom: '40px' }}
            >
              ข้อมูลตัวละคร แผนที่ และอาวุธครบถ้วน<br />
              อัปเดตทุก patch ในสไตล์ที่เป็นของเราเอง
            </p>

            <div className="a4 flex flex-wrap gap-3 mb-12">
              <Link
                href="/agents"
                className="font-barlow uppercase tracking-widest text-white transition-all hover:scale-105"
                style={{
                  fontSize: '11px',
                  padding: '13px 30px',
                  background: '#ff4654',
                  borderRadius: '2px',
                  boxShadow: '0 0 20px rgba(255,70,84,0.4)',
                }}
              >
                ดูเอเจนท์
              </Link>
              <Link
                href="/weapons"
                className="font-barlow uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                style={{
                  fontSize: '11px',
                  padding: '13px 30px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '2px',
                }}
              >
                ดูอาวุธ
              </Link>
            </div>

            {/* agent icon preview row */}
            {agentPreviews && (
              <div className="a4 flex items-center gap-3">
                <div className="flex">
                  {agentPreviews.slice(0, 5).map((agent: any, i: number) => (
                    <div
                      key={agent.uuid}
                      className="rounded-full overflow-hidden border-2 border-[#0f1923]"
                      style={{
                        width: '36px', height: '36px',
                        marginLeft: i > 0 ? '-10px' : '0',
                        background: `#${agent.backgroundGradientColors?.[0]?.slice(0, 6) ?? '1a1a2e'}`,
                      }}
                    >
                      <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="font-barlow text-white/30" style={{ fontSize: '11px' }}>
                  +{agentPreviews.length > 5 ? agentPreviews.length - 5 : 0} agents อีกมากมาย
                </p>
              </div>
            )}
          </div>

          {/* right — featured agent */}
          {featuredAgent && (
            <div
              className="relative flex items-end justify-center flex-shrink-0"
              style={{ width: 'clamp(260px, 35vw, 420px)', height: 'clamp(320px, 50vh, 580px)' }}
            >
              {/* bg glow */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center bottom, #${featuredAgent.backgroundGradientColors?.[0]?.slice(0, 6) ?? 'ff4654'}25 0%, transparent 70%)`,
                }}
              />
              {/* background art */}
              {featuredAgent.background && (
                <img
                  src={featuredAgent.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain opacity-15"
                />
              )}
              {/* agent portrait */}
              <img
                src={featuredAgent.fullPortrait}
                alt={featuredAgent.displayName}
                className="agent-float relative z-10 w-auto"
                style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
              />
              {/* name badge */}
              <div
                className="absolute bottom-0 left-0 right-0 text-center pb-2 z-20"
                style={{
                  background: 'linear-gradient(to top, rgba(15,25,35,0.9), transparent)',
                }}
              >
                <p className="font-barlow text-white/30 uppercase tracking-widest" style={{ fontSize: '9px' }}>
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

      {/* ========== AGENTS SECTION ========== */}
      <section className="relative bg-[#0f1923]" style={{ padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,70,84,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,70,84,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
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
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {agentPreviews.map((agent: any) => (
                <Link href="/agents" key={agent.uuid}>
                  <div
                    className="card-hover relative overflow-hidden rounded-sm cursor-pointer"
                    style={{
                      aspectRatio: '1',
                      background: `linear-gradient(135deg, #${agent.backgroundGradientColors?.[0]?.slice(0, 6) ?? '1a1a2e'}40, #0f1923)`,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="font-barlow text-white uppercase tracking-widest" style={{ fontSize: '8px' }}>
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

      {/* ========== MAPS SECTION ========== */}
      <section className="relative bg-white" style={{ borderTop: '1px solid #e5e7eb', padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mapPreviews.map((map: any) => (
                <Link href="/maps" key={map.uuid}>
                  <div className="card-hover relative overflow-hidden rounded-sm cursor-pointer" style={{ aspectRatio: '16/9' }}>
                    <img src={map.listViewIcon ?? map.splash} alt={map.displayName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div>
                        <p className="font-barlow text-[#ff4654] uppercase tracking-widest mb-1" style={{ fontSize: '9px' }}>// Map</p>
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

      {/* ========== WEAPONS SECTION ========== */}
      <section
        className="relative overflow-hidden"
        style={{
          borderTop: '1px solid rgba(255,70,84,0.15)',
          padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px)',
          background: 'linear-gradient(135deg, #050d14 0%, #0f1923 60%, #0a0f14 100%)',
        }}
      >
        {/* red glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-100px', left: '20%',
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(255,70,84,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
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
            <div className="flex flex-col gap-6">
              {weaponPreviews.map((weapon: any, i: number) => (
                <Link href="/weapons" key={weapon.uuid}>
                  <div
                    className="flex items-center gap-6 group cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}
                  >
                    <span
                      className="font-rajdhani font-bold text-white/10 group-hover:text-[#ff4654]/30 transition-colors flex-shrink-0"
                      style={{ fontSize: '11px', width: '24px' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <img
                      src={weapon.displayIcon}
                      alt={weapon.displayName}
                      className="weapon-hover object-contain flex-shrink-0"
                      style={{ height: '48px', width: '160px', filter: 'brightness(0.7) group-hover:brightness(1)' }}
                    />
                    <div className="flex-1">
                      <p
                        className="font-rajdhani font-bold uppercase text-white/60 group-hover:text-white transition-colors"
                        style={{ fontSize: '16px', letterSpacing: '2px' }}
                      >
                        {weapon.displayName}
                      </p>
                    </div>
                    <span className="font-barlow text-white/20 group-hover:text-[#ff4654] transition-colors" style={{ fontSize: '11px' }}>
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        className="relative"
        style={{
          background: '#050d14',
          borderTop: '1px solid rgba(255,70,84,0.15)',
          padding: '24px clamp(24px, 6vw, 80px)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="font-rajdhani font-bold text-[#ff4654] uppercase tracking-widest" style={{ fontSize: '14px' }}>
              Valorant List
            </span>
            <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
            <p className="font-barlow text-white/20 uppercase tracking-widest" style={{ fontSize: '9px' }}>
              Fan site — not affiliated with Riot Games
            </p>
          </div>
          <p className="font-barlow text-[#ff4654]/30 uppercase tracking-widest" style={{ fontSize: '9px' }}>
            Powered by valorant-api.com
          </p>
        </div>
      </footer>
    </>
  )
}