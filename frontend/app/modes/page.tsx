import type { Metadata } from 'next'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getCurrencies, getGameModes } from '@/lib/valorant'

export const metadata: Metadata = { title: 'Game Modes' }

const ECONOMY: Record<string, string> = {
  'EEconomyType::Default': 'ซื้อของปกติ',
  'EEconomyType::None': 'ไม่มีระบบเงิน',
}

export default async function ModesPage() {
  const [modes, currencies] = await Promise.all([getGameModes(), getCurrencies()])
  // ตัดโหมดภายใน (ไม่มีคำอธิบาย/ไอคอน) ออก
  const visible = modes.filter((m) => m.description && m.displayIcon)

  return (
    <>
      <PageHero
        eyebrow="Play"
        title="Modes"
        th="โหมดเกม"
        description="ตั้งแต่ Competitive เต็มรูปแบบไปจนถึงโหมดเล่นสนุก — ดูกติกา ระยะเวลา และจำนวนรอบของแต่ละโหมด"
        stats={[
          { label: 'Game modes', value: visible.length },
          { label: 'Currencies', value: currencies.length },
        ]}
      />

      <Container className="py-10 md:py-14">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((m, i) => (
              <Reveal key={m.uuid} delay={(i % 3) * 70}>
                <article className="group val-panel val-corners relative flex h-full flex-col overflow-hidden p-6">
                  {m.listViewIconTall && (
                    <img
                      src={m.listViewIconTall}
                      alt=""
                      loading="lazy"
                      className="pointer-events-none absolute top-0 right-0 h-full w-1/2 object-cover opacity-15 transition-opacity duration-500 [mask-image:linear-gradient(to_left,black,transparent)] group-hover:opacity-30"
                    />
                  )}
                  <div className="relative flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-val-red/15">
                      <img src={m.displayIcon!} alt="" className="h-8 w-8" />
                    </span>
                    <div>
                      <h2 className="font-display text-3xl leading-none text-val-cream uppercase">{m.displayName}</h2>
                      {m.duration && <p className="mt-1 text-xs tracking-wider text-val-red uppercase">{m.duration}</p>}
                    </div>
                  </div>
                  <p className="relative mt-4 font-thai text-sm leading-relaxed font-light text-val-cream/65">{m.description}</p>
                  <dl className="relative mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 text-xs">
                    {m.roundsPerHalf > 0 && <Stat k="Rounds/half" v={m.roundsPerHalf} />}
                    {m.orbCount > 0 && <Stat k="Orbs" v={m.orbCount} />}
                    {m.economyType && <Stat k="Economy" v={ECONOMY[m.economyType] ?? m.economyType.split('::')[1]} />}
                    <Stat k="Timeouts" v={m.allowsMatchTimeouts ? 'Yes' : 'No'} />
                    <Stat k="Team voice" v={m.isTeamVoiceAllowed ? 'Yes' : 'No'} />
                    {m.isMinimapHidden && <Stat k="Minimap" v="Hidden" />}
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Container>

      {currencies.length > 0 && (
        <section className="border-t border-white/5 bg-val-deep py-14 md:py-20">
          <Container>
            <SectionHeading index="Economy" title="Currencies" th="สกุลเงินในเกม" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {currencies.map((c) => (
                <div key={c.uuid} className="val-panel flex flex-col items-center gap-3 p-6 text-center">
                  <img src={c.largeIcon ?? c.displayIcon} alt="" className="h-14 w-14 object-contain" loading="lazy" />
                  <p className="font-display text-xl text-val-cream uppercase">{c.displayName}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

function Stat({ k, v }: { k: string; v: string | number }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.2em] text-val-cream/35 uppercase">{k}</dt>
      <dd className="font-thai text-val-cream/80">{v}</dd>
    </div>
  )
}
