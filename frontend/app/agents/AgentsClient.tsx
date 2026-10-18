'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'
import { useI18n } from '@/components/LangProvider'

export interface AgentCard {
  uuid: string
  displayName: string
  developerName: string
  description: string
  bustPortrait: string | null
  displayIcon: string
  backgroundGradientColors: string[]
  roleUuid: string
  roleName: string
  roleIcon: string
  abilityIcons: { icon: string; name: string }[]
}

type View = 'grid' | 'list'

const hex = (raw: string | undefined, fallback: string) => (raw ? `#${raw.slice(0, 6)}` : fallback)
const tilt = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-[0.5deg]', 'rotate-[1.5deg]']

export default function AgentsClient({
  agents,
  roles,
}: {
  agents: AgentCard[]
  roles: { uuid: string; name: string; icon: string }[]
}) {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  // รองรับลิงก์ /agents?role=<uuid>&view=list
  const initialRole = params.get('role')
  const [role, setRole] = useState<string>(() => (initialRole && roles.some((x) => x.uuid === initialRole) ? initialRole : 'ALL'))
  const [view, setView] = useState<View>(() => (params.get('view') === 'list' ? 'list' : 'grid'))
  const [query, setQuery] = useState('')

  const changeView = (v: View) => {
    setView(v)
    const next = new URLSearchParams(params.toString())
    if (v === 'list') next.set('view', 'list')
    else next.delete('view')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return agents.filter(
      (a) =>
        (role === 'ALL' || a.roleUuid === role) &&
        (!q || a.displayName.toLowerCase().includes(q) || a.developerName?.toLowerCase().includes(q)),
    )
  }, [agents, role, query])

  return (
    <>
      <FilterBar search={<SearchInput value={query} onChange={setQuery} placeholder={t.agents.search} />}>
        <FilterButton active={role === 'ALL'} onClick={() => setRole('ALL')}>
          {t.common.all}
        </FilterButton>
        {roles.map((r) => (
          <FilterButton key={r.uuid} active={role === r.uuid} onClick={() => setRole(r.uuid)}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${role === r.uuid ? '' : 'bg-ink'}`}>
              <img src={r.icon} alt="" className="h-3 w-3" />
            </span>
            {r.name}
          </FilterButton>
        ))}
      </FilterBar>

      {/* สลับมุมมอง การ์ด / รายการ */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-ink-soft">{t.common.found(list.length, agents.length)}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-soft max-sm:hidden">{t.agents.viewAs}</span>
          <div role="group" className="flex overflow-hidden rounded-xl border-2 border-ink bg-card">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                aria-pressed={view === v}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-display font-semibold transition-colors ${
                  view === v ? 'bg-ink text-paper' : 'hover:bg-mustard/40'
                }`}
              >
                <ViewIcon view={v} />
                {v === 'grid' ? t.agents.grid : t.agents.list}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((a, i) => (
            <li key={a.uuid} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
              <Link href={`/agents/${a.uuid}`} className={`card card-hover block p-2 ${tilt[i % tilt.length]}`}>
                <div
                  className="relative aspect-square overflow-hidden rounded-md"
                  style={{ background: `linear-gradient(160deg, ${hex(a.backgroundGradientColors?.[0], '#ff4654')}, ${hex(a.backgroundGradientColors?.[2], '#ebe3d4')})` }}
                >
                  <img src={a.bustPortrait ?? a.displayIcon} alt={a.displayName} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                </div>
                <div className="flex items-center justify-between gap-2 px-1 pt-2">
                  <p className="truncate font-display text-lg font-bold">{a.displayName}</p>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink" title={a.roleName}>
                    <img src={a.roleIcon} alt={a.roleName} className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {list.map((a, i) => (
            <li key={a.uuid} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
              <Link href={`/agents/${a.uuid}`} className="card card-hover flex items-center gap-4 p-3 sm:p-4">
                <span
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20"
                  style={{ background: hex(a.backgroundGradientColors?.[0], '#ff4654') }}
                >
                  <img src={a.displayIcon} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl font-bold">{a.displayName}</p>
                    <span className="chip !py-0 text-xs">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink">
                        <img src={a.roleIcon} alt="" className="h-2.5 w-2.5" />
                      </span>
                      {a.roleName}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{a.description}</p>
                </div>
                <div className="hidden shrink-0 gap-1.5 md:flex">
                  {a.abilityIcons.slice(0, 4).map((ab) => (
                    <span key={ab.icon} title={ab.name} className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink">
                      <img src={ab.icon} alt={ab.name} loading="lazy" className="h-6 w-6 object-contain" />
                    </span>
                  ))}
                </div>
                <span className="text-xl text-ink-soft">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {list.length === 0 && <p className="hand py-16 text-center text-xl">{t.common.noResult}</p>}
    </>
  )
}

function ViewIcon({ view }: { view: View }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
      {view === 'grid' ? (
        <>
          <rect x="1" y="1" width="6" height="6" rx="1.5" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" />
        </>
      ) : (
        <>
          <rect x="1" y="2" width="14" height="3" rx="1.5" />
          <rect x="1" y="7" width="14" height="3" rx="1.5" />
          <rect x="1" y="12" width="14" height="3" rx="1.5" />
        </>
      )}
    </svg>
  )
}
