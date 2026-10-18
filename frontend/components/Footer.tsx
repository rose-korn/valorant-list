import Link from 'next/link'
import { getVersion } from '@/lib/valorant'
import { Logo, NAV_LINKS } from './brand'

export default async function Footer() {
  const version = await getVersion()

  return (
    <footer className="relative overflow-hidden border-t border-val-red/20 bg-val-deep">
      <div className="val-grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="val-outline-text pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-display text-[22vw] leading-none whitespace-nowrap uppercase select-none"
      >
        Valorant
      </div>

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm font-thai text-sm leading-relaxed font-light text-val-cream/50">
            แฟนไซต์ที่รวมข้อมูลทุกอย่างจาก Valorant — เอเจนท์ แผนที่ อาวุธ สกิน แรงค์ และของสะสม
            พร้อมมุมมอง 3D แบบโต้ตอบได้
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-val-red uppercase">{'// Explore'}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-val-cream/60 transition-colors hover:text-val-red">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-val-red uppercase">{'// Game Build'}</p>
          {version ? (
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-1.5">
                <dt className="text-val-cream/40">Version</dt>
                <dd className="font-mono text-val-cream/80">{version.version}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-1.5">
                <dt className="text-val-cream/40">Branch</dt>
                <dd className="font-mono text-val-cream/80">{version.branch}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-val-cream/40">Build date</dt>
                <dd className="font-mono text-val-cream/80">
                  {new Date(version.buildDate).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-val-cream/40">—</p>
          )}
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-[11px] tracking-[0.2em] text-val-cream/35 uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>Fan site — not affiliated with Riot Games</span>
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer" className="hover:text-val-red">
            Data · valorant-api.com
          </a>
        </div>
      </div>
    </footer>
  )
}
