'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FilterBar, FilterButton, SearchInput } from '@/components/Filters'

export interface AgentCard {
  uuid: string
  displayName: string
  developerName: string
  bustPortrait: string | null
  displayIcon: string
  backgroundGradientColors: string[]
  roleUuid: string
  roleName: string
  roleIcon: string
}

const hex = (raw: string | undefined, fallback: string) => (raw ? `#${raw.slice(0, 6)}` : fallback)
const tilt = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-[0.5deg]', 'rotate-[1.5deg]']

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
      <FilterBar search={<SearchInput value={query} onChange={setQuery} placeholder="หาชื่อเอเจนท์..." />}>
        <FilterButton active={role === 'ALL'} onClick={() => setRole('ALL')}>
          ทั้งหมด
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

      {list.length === 0 && <p className="hand py-16 text-center text-xl">ไม่เจอเลยอะ ลองพิมพ์ใหม่ดูนะ</p>}
    </>
  )
}
