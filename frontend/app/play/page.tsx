import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, PageHero } from '@/components/ui'
import { getAgents, getCompetitiveTiers } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { latestTiers, rgbaHex } from '@/lib/valorant'
import AimRush from './AimRush'
import SpikeBeat, { type BeatAgent } from './SpikeBeat'

type Game = 'aim' | 'beat'
const pickGame = (raw: string | string[] | undefined): Game => (raw === 'beat' ? 'beat' : 'aim')

export async function generateMetadata({ searchParams }: PageProps<'/play'>): Promise<Metadata> {
  const [{ game }, { t }] = await Promise.all([searchParams, getI18n()])
  return { title: pickGame(game) === 'beat' ? t.beat.title : t.play.title }
}

// เอเจนต์ประจำด่านของ Spike Beat: ช้า → เร็ว
const STAGE_AGENTS = { easy: 'Sage', normal: 'Jett', hard: 'Neon' } as const

export default async function PlayPage({ searchParams }: PageProps<'/play'>) {
  const [{ game: raw }, tierSeasons, agentList, { t }] = await Promise.all([searchParams, getCompetitiveTiers(), getAgents(), getI18n()])
  const game = pickGame(raw)
  const ranks = latestTiers(tierSeasons).map((r) => ({ name: r.tierName, icon: r.largeIcon, color: rgbaHex(r.color, '#1d1f24') }))

  const agents: Partial<Record<keyof typeof STAGE_AGENTS, BeatAgent>> = {}
  for (const [stage, name] of Object.entries(STAGE_AGENTS) as [keyof typeof STAGE_AGENTS, string][]) {
    const a = agentList.find((x) => x.displayName === name)
    if (a) agents[stage] = { name: a.displayName, image: a.fullPortrait ?? a.displayIcon, color: rgbaHex(a.backgroundGradientColors?.[0]) }
  }

  const tabs: { key: Game; href: string; label: string; emoji: string }[] = [
    { key: 'aim', href: '/play', label: t.play.title, emoji: '🎯' },
    { key: 'beat', href: '/play?game=beat', label: t.beat.tab, emoji: '🎹' },
  ]
  const copy = game === 'beat' ? t.beat : t.play

  return (
    <>
      <PageHero en="Mini game" title={copy.title} description={copy.desc} note={copy.note} />
      <Container className="py-8 md:py-12">
        <nav className="mx-auto mb-5 flex max-w-5xl gap-2" aria-label="games">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              scroll={false}
              aria-current={game === tab.key ? 'page' : undefined}
              className={`rounded-full border-2 border-ink px-4 py-1.5 font-display font-bold transition-transform ${
                game === tab.key ? 'bg-ink text-paper' : 'bg-card hover:-rotate-2 hover:bg-mustard/50'
              }`}
            >
              {tab.emoji} {tab.label}
            </Link>
          ))}
        </nav>
        {game === 'beat' ? <SpikeBeat ranks={ranks} agents={agents} /> : <AimRush ranks={ranks} />}
      </Container>
    </>
  )
}
