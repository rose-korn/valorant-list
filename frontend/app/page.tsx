import Link from 'next/link'

const sections = [
  {
    label: 'Agents',
    href: '/agents',
    title: 'เอเจนท์',
    desc: 'เลือกสไตล์การเล่นของคุณด้วยเอเจนท์หลากหลาย แต่ละตัวมีสกิลเฉพาะตัวที่ไม่เหมือนใคร',
    reverse: false,
  },
  {
    label: 'Maps',
    href: '/maps',
    title: 'แผนที่',
    desc: 'สำรวจสนามรบทั่วโลก แต่ละแผนที่มีเอกลักษณ์และกลยุทธ์ที่แตกต่างกัน',
    reverse: true,
  },
  {
    label: 'Weapons',
    href: '/weapons',
    title: 'อาวุธ',
    desc: 'ดู stats และ skin ของอาวุธทุกชิ้น เลือกอาวุธที่เหมาะกับสไตล์การเล่นของคุณ',
    reverse: false,
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[75vh] bg-[#0f1923]">
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#ff4654] to-transparent z-10" />

        <div className="min-h-[75vh] flex items-center justify-center px-8">
          <div className="flex items-center gap-20 w-full max-w-4xl">

            {/* ซ้าย */}
            <div className="flex-1">
              <p className="font-barlow text-[#ff4654] text-xs tracking-[4px] uppercase mb-4">
          // Fan Site
              </p>
              <h1 className="font-rajdhani font-bold text-7xl uppercase leading-none tracking-wide mb-4">
                Valorant<br />
                <span className="text-[#ff4654]">List</span>
              </h1>
              <p className="font-barlow text-white/60 text-sm leading-relaxed mb-8">
                ดูตัวละคร แผนที่ และอาวุธทั้งหมด<br />
                ในสไตล์ของเรา ข้อมูลครบ อัปเดตเสมอ
              </p>
              <div className="flex gap-4">
                <Link href="/agents" className="font-barlow bg-[#ff4654] text-white text-xs tracking-widest uppercase px-7 py-3 rounded-sm hover:bg-[#e03545] transition-colors">
                  ดูเอเจนท์
                </Link>
                <Link href="/maps" className="font-barlow border border-white/30 text-white text-xs tracking-widest uppercase px-7 py-3 rounded-sm hover:border-white/60 transition-colors">
                  ดูแผนที่
                </Link>
              </div>
            </div>

            {/* ขวา */}
            <div className="flex-1 flex justify-center items-end self-end">
              <div className="w-64 h-80 border border-dashed border-[#ff4654]/20 rounded-sm flex items-center justify-center">
                <span className="font-barlow text-[#ff4654]/30 text-xs tracking-widest uppercase">
                  Agent Art
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Sections สลับซ้าย-ขวา */}
      {sections.map((s) => (
        <section key={s.href} className="border-t border-gray-200 bg-white">
          <div className={`flex min-h-[300px] ${s.reverse ? 'flex-row-reverse' : ''}`}>

            {/* รูป */}
            <div className="w-1/2 bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="font-barlow text-gray-400 text-xs uppercase tracking-widest">
                {s.label} Image
              </span>
            </div>

            {/* ข้อความ — จัดกลาง block */}
            <div className="w-1/2 flex flex-col justify-center items-center text-center px-16 py-10">
              <p className="font-barlow text-[#ff4654] text-[10px] tracking-[4px] uppercase mb-3">
          // {s.label}
              </p>
              <h2 className="font-rajdhani font-bold text-4xl uppercase tracking-wide text-[#0f1923] mb-3">
                {s.title}
              </h2>
              <p className="font-barlow text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
                {s.desc}
              </p>
              <Link
                href={s.href}
                className="font-barlow text-[#ff4654] text-[10px] tracking-[2px] uppercase border-b border-[#ff4654]/30 pb-1 hover:border-[#ff4654] transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>

          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <p className="font-barlow text-gray-400 text-xs tracking-widest">
            Fan site — not affiliated with Riot Games
          </p>
          <p className="font-barlow text-[#ff4654]/40 text-[10px] uppercase tracking-widest">
            Powered by valorant-api.com
          </p>
        </div>
      </footer>
    </>
  )
}