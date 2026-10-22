import type { Metadata } from 'next'
import Link from '@/components/Link'
import { notFound } from 'next/navigation'
import Viewer3D from '@/components/three/Viewer3D'
import { Arrow } from '@/components/brand'
import { BackLink, Container, SectionHeading } from '@/components/ui'
import PassViewer from '@/components/PassViewer'
import { getAgent, getAgents, getContracts } from '@/lib/api'
import { buildPassChapters, buildRewardIndex } from '@/lib/rewards'
import { getI18n, toLang } from '@/lib/i18n-server'
import { SLOT_ORDER, agentColor } from '@/lib/valorant'
import AbilityPanel from './AbilityPanel'
import VoiceLine from './VoiceLine'

// build ทุกหน้าไว้ล่วงหน้า (static export) อันที่ไม่อยู่ในลิสต์ = 404
export async function generateStaticParams({ params }: { params: { lang: string } }) {
  return (await getAgents(toLang(params.lang))).map((a) => ({ uuid: a.uuid }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[lang]/agents/[uuid]'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  const { uuid } = await params
  const agent = await getAgent(lang, uuid)
  return { title: agent?.displayName ?? 'Agent', description: agent?.description }
}

export default async function AgentPage({ params }: PageProps<'/[lang]/agents/[uuid]'>) {
  const { lang, t } = await getI18n(params)
  const { uuid } = await params
  const [agent, all, contracts, resolve] = await Promise.all([getAgent(lang, uuid), getAgents(lang), getContracts(lang), buildRewardIndex(lang)])
  if (!agent) notFound()

  // สัญญาเอเจนท์ (ของที่ปลดได้จากการเล่นตัวนี้)
  const contract = contracts.find((c) => c.content.relationType === 'Agent' && c.content.relationUuid === agent.uuid)
  const contractChapters = buildPassChapters(contract, resolve)

  const color = agentColor(agent)
  const sorted = [...all].sort((a, b) => a.displayName.localeCompare(b.displayName))
  const idx = sorted.findIndex((a) => a.uuid === agent.uuid)
  const prev = idx > 0 ? sorted[idx - 1] : sorted[sorted.length - 1]
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : sorted[0]
  const sameRole = all.filter((a) => a.role?.uuid === agent.role?.uuid && a.uuid !== agent.uuid)

  const abilities = [...agent.abilities]
    .filter((a) => a.displayIcon || a.slot !== 'Passive')
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
  const voice = agent.voiceLine?.mediaList?.[0]?.wave ?? null

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="grid gap-10 py-8 md:py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <BackLink href="/agents" label={t.agents.back} />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {agent.role && (
                <span className="chip !bg-ink !text-paper">
                  <img src={agent.role.displayIcon} alt="" className="h-3.5 w-3.5" />
                  {agent.role.displayName}
                </span>
              )}
              <span className="chip">
                {t.agents.codename}: {agent.developerName}
              </span>
            </div>
            <h1 className="mt-4 animate-fade-up text-6xl font-bold sm:text-7xl">{agent.displayName}</h1>
            <p className="mt-4 max-w-xl animate-fade-up text-lg text-ink-soft [animation-delay:100ms]">{agent.description}</p>
            {agent.characterTags && agent.characterTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.characterTags.map((t) => (
                  <span key={t} className="chip !bg-paper-2">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#abilities" className="btn">
                {t.agents.seeAbilities}
              </a>
              {voice && <VoiceLine src={voice} />}
              <Link href={`/share?a=${agent.uuid}`} className="btn btn-paper !bg-[#ffd3d6]">
                {t.agents.makeCard}
              </Link>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="screen relative h-[52svh] min-h-[340px] lg:h-[70svh]" style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}66, #1c1e24 72%)` }}>
              {agent.background && <img src={agent.background} alt="" className="absolute inset-0 h-full w-full object-contain opacity-15" />}
              <Viewer3D src={agent.fullPortrait ?? agent.bustPortrait ?? agent.displayIcon} alt={agent.displayName} accent={color} variant="card" className="h-full w-full" />
            </div>
            <p className="hand absolute -right-1 -bottom-9 flex rotate-2 items-start gap-1 text-lg">
              <Arrow className="h-7 w-9 -scale-y-100 rotate-180" />
              {t.agents.dragMe(agent.displayName)}
            </p>
          </div>
        </Container>
      </section>

      {/* ================= ABILITIES ================= */}
      <section id="abilities" className="scroll-mt-20 py-14 md:py-20">
        <Container>
          <SectionHeading title={t.agents.abilitiesTitle} note={t.agents.abilitiesNote} />
          <AbilityPanel abilities={abilities} color={color} />
        </Container>
      </section>

      {/* ================= AGENT CONTRACT ================= */}
      {contractChapters.some((ch) => ch.levels.length) && (
        <section className="border-t-2 border-ink py-14 md:py-16">
          <Container>
            <SectionHeading title={t.battlepass.agentContract} note={t.battlepass.agentContractNote} />
            <PassViewer chapters={contractChapters} />
          </Container>
        </section>
      )}

      {/* ================= ROLE ================= */}
      {agent.role && (
        <section className="border-y-2 border-ink bg-paper-2 py-14">
          <Container className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-ink bg-ink shadow-[3px_4px_0_var(--color-red)]">
              <img src={agent.role.displayIcon} alt="" className="h-10 w-10" />
            </span>
            <div>
              <p className="hand text-lg">{t.agents.roleOf(agent.displayName)}</p>
              <h2 className="text-3xl font-bold sm:text-4xl">{agent.role.displayName}</h2>
              <p className="mt-2 max-w-2xl text-ink-soft">{agent.role.description}</p>
              {sameRole.length > 0 && (
                <>
                  <p className="mt-6 mb-2 font-display font-semibold">{t.agents.sameRole}</p>
                  <div className="flex flex-wrap gap-2">
                    {sameRole.map((a) => (
                      <Link key={a.uuid} href={`/agents/${a.uuid}`} className="chip !py-1 !pl-1 transition-transform hover:-translate-y-0.5">
                        <img src={a.displayIconSmall ?? a.displayIcon} alt="" className="h-7 w-7 rounded-full" style={{ background: agentColor(a) }} />
                        {a.displayName}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ================= PREV / NEXT ================= */}
      {prev && next && (
        <Container className="grid gap-4 py-12 sm:grid-cols-2">
          <Link href={`/agents/${prev.uuid}`} className="card card-hover flex items-center gap-3 p-3">
            <span className="text-2xl">←</span>
            <img src={prev.displayIconSmall ?? prev.displayIcon} alt="" className="h-12 w-12 rounded-lg" style={{ background: agentColor(prev) }} />
            <span>
              <span className="block text-sm text-ink-soft">{t.common.prev}</span>
              <span className="font-display text-xl font-bold">{prev.displayName}</span>
            </span>
          </Link>
          <Link href={`/agents/${next.uuid}`} className="card card-hover flex items-center justify-end gap-3 p-3 text-right">
            <span>
              <span className="block text-sm text-ink-soft">{t.common.next}</span>
              <span className="font-display text-xl font-bold">{next.displayName}</span>
            </span>
            <img src={next.displayIconSmall ?? next.displayIcon} alt="" className="h-12 w-12 rounded-lg" style={{ background: agentColor(next) }} />
            <span className="text-2xl">→</span>
          </Link>
        </Container>
      )}
    </>
  )
}
