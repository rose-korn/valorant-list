'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'

export interface AgentCard {
  uuid: string
  displayName: string
  developerName: string
  fullPortrait: string | null
  bustPortrait: string | null
  displayIcon: string
  background: string | null
  backgroundGradientColors: string[]
  roleUuid: string
  roleName: string
  roleIcon: string
}

const hex = (raw: string | undefined, fallback: string) => (raw ? `#${raw.slice(0, 6)}` : fallback)

export default function AgentsClient({
  agents,
  roles,
}: {
  agents: AgentCard[]
  roles: { uuid: string; name: string; icon: string }[]
}) {
  // รองรับลิงก์ /agents?role=<uuid> จากหน้าแรก
  const initialRole = useSearchParams().get('role')
  const [role, setRole] = useState<string>(() => (initialRole && roles.some((x) => x.uuid === initialRole) ? initialRole : 'ALL'))
  const [query, setQuery] = useState('')

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
      <FilterBar search={<SearchInput value={query} onChange={setQuery} placeholder="ค้นหาเอเจนท์..." />}>
        <FilterButton active={role === 'ALL'} onClick={() => setRole('ALL')}>
          All
        </FilterButton>
        {roles.map((r) => (
          <FilterButton key={r.uuid} active={role === r.uuid} onClick={() => setRole(r.uuid)}>
            <img src={r.icon} alt="" className="h-3.5 w-3.5" />
            {r.name}
          </FilterButton>
        ))}
      </FilterBar>

      <p className="mb-4 text-xs tracking-[0.25em] text-val-cream/40 uppercase">
        {list.length} / {agents.length} agents
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((a, i) => {
          const c1 = hex(a.backgroundGradientColors?.[0], '#ff4654')
          const c2 = hex(a.backgroundGradientColors?.[2], '#0f1923')
          return (
            <li key={a.uuid} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <Link
                href={`/agents/${a.uuid}`}
                className="group relative block aspect-[3/4] overflow-hidden"
                style={{ background: `linear-gradient(165deg, ${c1}, ${c2})` }}
              >
                {a.background && (
                  <img
                    src={a.background}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full scale-125 object-cover opacity-25 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute top-2 left-2 font-display text-[3.4rem] leading-none text-white/10 uppercase transition-colors group-hover:text-white/25 md:text-7xl"
                >
                  {a.displayName}
                </span>
                <img
                  src={a.fullPortrait ?? a.bustPortrait ?? a.displayIcon}
                  alt={a.displayName}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full translate-y-[6%] scale-[1.45] object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-[1.55]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-14 md:p-4">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-white/70 uppercase">
                    {a.roleIcon && <img src={a.roleIcon} alt="" className="h-3 w-3" />}
                    {a.roleName}
                  </div>
                  <p className="font-display text-2xl leading-none text-white uppercase md:text-3xl">{a.displayName}</p>
                </div>
                <span className="absolute top-0 right-0 h-0 w-0 border-t-[28px] border-l-[28px] border-t-val-red border-l-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          )
        })}
      </ul>

      {list.length === 0 && <p className="py-20 text-center font-thai text-val-cream/40">ไม่พบเอเจนท์ที่ค้นหา</p>}
    </>
  )
}
