import type { Metadata } from 'next'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getCurrencies, getGameModes } from '@/lib/valorant'

export const metadata: Metadata = { title: 'โหมดเกม' }

export default async function ModesPage() {
  const [modes, currencies] = await Promise.all([getGameModes(), getCurrencies()])
  // ตัดโหมดภายใน (ไม่มีคำอธิบาย/ไอคอน) ออก
  const visible = modes.filter((m) => m.description && m.displayIcon)

  return (
    <>
      <PageHero
        en="Game modes"
        title="โหมดเกม"
        description="จะจริงจังแบบ Competitive หรือเล่นขำ ๆ กับเพื่อน มาดูว่าแต่ละโหมดเล่นกันยังไง ใช้เวลานานแค่ไหน"
        facts={[{ label: 'โหมด', value: visible.length }]}
        note="Spike Rush ตอนเบื่อ ๆ คือดีที่สุด"
      />

      <Container className="py-10 md:py-14">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((m, i) => (
              <Reveal key={m.uuid} delay={(i % 3) * 60}>
                <article className={`card flex h-full flex-col p-5 ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink">
                      <img src={m.displayIcon!} alt="" className="h-7 w-7" />
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold">{m.displayName}</h2>
                      {m.duration && <p className="text-sm text-ink-soft">⏱ {m.duration}</p>}
                    </div>
                  </div>
                  <p className="mt-3 text-ink/85">{m.description}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {m.roundsPerHalf > 0 && <span className="chip !bg-paper-2 text-sm">ครึ่งละ {m.roundsPerHalf} รอบ</span>}
                    {m.orbCount > 0 && <span className="chip !bg-paper-2 text-sm">{m.orbCount} ลูกแก้ว</span>}
                    {m.economyType?.endsWith('None') && <span className="chip !bg-paper-2 text-sm">ไม่ต้องซื้อของ</span>}
                    {m.allowsMatchTimeouts && <span className="chip !bg-paper-2 text-sm">ขอเวลานอกได้</span>}
                    {m.isMinimapHidden && <span className="chip !bg-paper-2 text-sm">ไม่มีมินิแมพ</span>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Container>

      {currencies.length > 0 && (
        <section className="border-t-2 border-ink bg-paper-2 py-12 md:py-16">
          <Container>
            <SectionHeading title="สกุลเงินในเกม" note="VP หมดอีกแล้ว..." />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {currencies.map((c) => (
                <div key={c.uuid} className="card flex items-center gap-3 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink">
                    <img src={c.largeIcon ?? c.displayIcon} alt="" className="h-7 w-7 object-contain" loading="lazy" />
                  </span>
                  <p className="font-display font-bold">{c.displayName}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
