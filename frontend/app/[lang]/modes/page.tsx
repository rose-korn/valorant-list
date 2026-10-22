import type { Metadata } from 'next'
import Reveal from '@/components/Reveal'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getCurrencies, getGameModes } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'

export async function generateMetadata({ params }: PageProps<'/[lang]/modes'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.modes.title }
}

export default async function ModesPage({ params }: PageProps<'/[lang]/modes'>) {
  const { lang, t } = await getI18n(params)
  const [modes, currencies] = await Promise.all([getGameModes(lang), getCurrencies(lang)])
  const m = t.modes
  // ตัดโหมดภายใน (ไม่มีคำอธิบาย/ไอคอน) ออก
  const visible = modes.filter((m) => m.description && m.displayIcon)

  return (
    <>
      <PageHero
        en="Game modes"
        title={m.title}
        description={m.desc}
        facts={[{ label: m.unit, value: visible.length }]}
        note={m.note}
      />

      <Container className="py-10 md:py-14">
        {visible.length === 0 ? (
          <EmptyState text={t.common.empty} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((mode, i) => (
              <Reveal key={mode.uuid} delay={(i % 3) * 60}>
                <article className={`card flex h-full flex-col p-5 ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink">
                      <img src={mode.displayIcon!} alt="" className="h-7 w-7" />
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold">{mode.displayName}</h2>
                      {mode.duration && <p className="text-sm text-ink-soft">⏱ {mode.duration}</p>}
                    </div>
                  </div>
                  <p className="mt-3 text-ink/85">{mode.description}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {mode.roundsPerHalf > 0 && <span className="chip !bg-paper-2 text-sm">{m.rounds(mode.roundsPerHalf)}</span>}
                    {mode.orbCount > 0 && <span className="chip !bg-paper-2 text-sm">{m.orbs(mode.orbCount)}</span>}
                    {mode.economyType?.endsWith('None') && <span className="chip !bg-paper-2 text-sm">{m.noBuy}</span>}
                    {mode.allowsMatchTimeouts && <span className="chip !bg-paper-2 text-sm">{m.timeouts}</span>}
                    {mode.isMinimapHidden && <span className="chip !bg-paper-2 text-sm">{m.noMinimap}</span>}
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
            <SectionHeading title={m.currencyTitle} note={m.currencyNote} />
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
