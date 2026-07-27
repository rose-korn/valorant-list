export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: '#050d14',
        borderTop: '1px solid rgba(255,70,84,0.15)',
        padding: '24px clamp(20px, 6vw, 80px)',
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
  )
}
