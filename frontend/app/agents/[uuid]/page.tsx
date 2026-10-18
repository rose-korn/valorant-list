import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Viewer3D from '@/components/three/Viewer3D'
import { BackLink, Container, Eyebrow, SectionHeading } from '@/components/ui'
import { SLOT_ORDER, agentColor, getAgent, getAgents } from '@/lib/valorant'
import AbilityPanel from './AbilityPanel'
import VoiceLine from './VoiceLine'

export async function generateStaticParams() {
  const agents = await getAgents()
  return agents.map((a) => ({ uuid: a.uuid }))
}

export async function generateMetadata({ params }: PageProps<'/agents/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const agent = await getAgent(uuid)
  return { title: agent ? `${agent.displayName} — Agent` : 'Agent', description: agent?.description }
}

export default async function AgentPage({ params }: PageProps<'/agents/[uuid]'>) {
  const { uuid } = await params
  const [agent, all] = await Promise.all([getAgent(uuid), getAgents()])
  if (!agent) notFound()

  const c = [0, 1, 2, 3].map((i) => agentColor(agent, i, '#0f1923'))
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c[0]}55 0%, #0f1923 45%, ${c[3]}40 100%)` }} />
        {agent.background && (
          <img src={agent.background} alt="" className="absolute top-0 right-0 h-full w-full object-contain object-right opacity-15 lg:w-2/3" />
        )}
        <div
          aria-hidden
          className="val-outline-text pointer-events-none absolute top-6 left-0 font-display text-[30vw] leading-[0.8] whitespace-nowrap uppercase select-none lg:text-[18vw]"
        >
          {agent.displayName}
        </div>

        <Container className="relative grid gap-6 pt-6 pb-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1fr_1.15fr] lg:items-center lg:pb-16">
          <div className="order-2 lg:order-1">
            <BackLink href="/agents" label="All agents" />
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {agent.role && (
                <span className="val-chip !border-transparent text-white" style={{ background: `${c[0]}66` }}>
                  <img src={agent.role.displayIcon} alt="" className="h-3.5 w-3.5" />
                  {agent.role.displayName}
                </span>
              )}
              <span className="val-chip font-mono">{`// ${agent.developerName}`}</span>
            </div>
            <h1 className="mt-4 animate-fade-up font-display text-7xl leading-[0.85] tracking-tight text-val-cream uppercase sm:text-8xl xl:text-[9rem]">
              {agent.displayName}
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up font-thai text-base leading-relaxed font-light text-val-cream/70 [animation-delay:120ms]">
              {agent.description}
            </p>
            {agent.characterTags && agent.characterTags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.characterTags.map((t) => (
                  <span key={t} className="val-chip">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#abilities" className="val-btn">
                ดูสกิล
              </a>
              {voice && <VoiceLine src={voice} color={c[0]} />}
            </div>
          </div>

          <div className="order-1 h-[58svh] sm:h-[64svh] lg:order-2 lg:h-[82svh]">
            <Viewer3D
              src={agent.fullPortrait ?? agent.bustPortrait ?? agent.displayIcon}
              alt={agent.displayName}
              accent={agentColor(agent)}
              variant="card"
              className="val-corners h-full w-full !bg-transparent"
            />
          </div>
        </Container>
      </section>

      {/* ================= ABILITIES ================= */}
      <section id="abilities" className="relative scroll-mt-20 border-t border-white/5 bg-val-deep py-16 md:py-24">
        <div className="val-grid-bg absolute inset-0 opacity-40" />
        <Container className="relative">
          <SectionHeading index="Abilities" title="Special Abilities" th="กดที่สกิลเพื่อดูรายละเอียด" />
          <AbilityPanel abilities={abilities} color={agentColor(agent)} />
        </Container>
      </section>

      {/* ================= ROLE ================= */}
      {agent.role && (
        <section className="relative py-16 md:py-20">
          <Container className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex h-28 w-28 items-center justify-center border border-white/10 md:h-36 md:w-36" style={{ background: `${c[0]}22` }}>
              <img src={agent.role.displayIcon} alt="" className="h-14 w-14 md:h-20 md:w-20" />
            </div>
            <div>
              <Eyebrow>Role</Eyebrow>
              <h2 className="mt-2 font-display text-5xl text-val-cream uppercase md:text-6xl">{agent.role.displayName}</h2>
              <p className="mt-3 max-w-2xl font-thai leading-relaxed font-light text-val-cream/60">{agent.role.description}</p>
              {sameRole.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {sameRole.map((a) => (
                    <Link
                      key={a.uuid}
                      href={`/agents/${a.uuid}`}
                      className="group flex items-center gap-2 border border-white/10 py-1 pr-3 pl-1 transition-colors hover:border-val-red"
                    >
                      <img src={a.displayIconSmall ?? a.displayIcon} alt="" className="h-8 w-8" style={{ background: agentColor(a) }} />
                      <span className="font-display text-sm tracking-wider text-val-cream/70 uppercase group-hover:text-white">
                        {a.displayName}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ================= PREV / NEXT ================= */}
      {prev && next && (
        <nav className="grid border-t border-white/5 sm:grid-cols-2">
          {[
            { a: prev, label: 'Previous', align: 'items-start text-left' },
            { a: next, label: 'Next', align: 'items-end text-right' },
          ].map(({ a, label, align }) => (
            <Link
              key={label}
              href={`/agents/${a.uuid}`}
              className={`group relative flex flex-col overflow-hidden px-6 py-10 sm:px-10 ${align} border-white/5 transition-colors hover:bg-white/[0.03] sm:even:border-l`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30" style={{ background: `linear-gradient(90deg, ${agentColor(a)}, transparent)` }} />
              <span className="relative text-[10px] tracking-[0.3em] text-val-red uppercase">{label}</span>
              <span className="relative font-display text-4xl text-val-cream uppercase md:text-5xl">{a.displayName}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
