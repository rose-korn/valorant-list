import Link from '@/components/Link'
import { getAgents, getCompetitiveTiers } from '@/lib/api'
import type { Dict, Lang } from '@/lib/i18n'
import { latestTiers, rgbaHex } from '@/lib/valorant'
import type { BeatAgent } from './SpikeBeat'

export async function getRanks(lang: Lang) {
  return latestTiers(await getCompetitiveTiers(lang)).map((r) => ({ name: r.tierName, icon: r.largeIcon, color: rgbaHex(r.color, '#1d1f24') }))
}

// เอเจนต์ประจำด่านของ Spike Beat: ช้า → เร็ว
const STAGE_AGENTS = { easy: 'Sage', normal: 'Jett', hard: 'Neon' } as const

export async function getStageAgents(lang: Lang) {
  const list = await getAgents(lang)
  const agents: Partial<Record<keyof typeof STAGE_AGENTS, BeatAgent>> = {}
  for (const [stage, name] of Object.entries(STAGE_AGENTS) as [keyof typeof STAGE_AGENTS, string][]) {
    const a = list.find((x) => x.displayName === name)
    if (a) agents[stage] = { name: a.displayName, image: a.fullPortrait ?? a.displayIcon, color: rgbaHex(a.backgroundGradientColors?.[0]) }
  }
  return agents
}

/** แท็บสลับเกม — แต่ละเกมเป็นหน้าแยก (/play กับ /play/beat) */
export function GameTabs({ active, t }: { active: 'aim' | 'beat'; t: Dict }) {
  const tabs = [
    { key: 'aim', href: '/play', label: t.play.title, emoji: '🎯' },
    { key: 'beat', href: '/play/beat', label: t.beat.tab, emoji: '🎹' },
  ] as const
  return (
    <nav className="mx-auto mb-5 flex max-w-5xl gap-2" aria-label="games">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          scroll={false}
          aria-current={active === tab.key ? 'page' : undefined}
          className={`rounded-full border-2 border-ink px-4 py-1.5 font-display font-bold transition-transform ${
            active === tab.key ? 'bg-ink text-paper' : 'bg-card hover:-rotate-2 hover:bg-mustard/50'
          }`}
        >
          {tab.emoji} {tab.label}
        </Link>
      ))}
    </nav>
  )
}
