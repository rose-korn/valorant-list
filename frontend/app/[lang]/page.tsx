import Link from '@/components/Link'
import PaperScene from '@/components/three/PaperScene'
import Viewer3D from '@/components/three/Viewer3D'
import Reveal from '@/components/Reveal'
import HScroller from '@/components/HScroller'
import { Crosshair, RegMark } from '@/components/brand'
import { Container, SectionHeading } from '@/components/ui'
import { getI18n } from '@/lib/i18n-server'
import { agentColor, groupByRole, isCompetitiveMap, isRealSkin, latestTiers } from '@/lib/valorant'
import { DailyAgentCard, DailyPicks, DailyShareCard } from '@/components/home/Daily'
import WhatsNew from '@/components/home/WhatsNew'
import { BUILT_AT } from '@/lib/first-seen'
import { dailyPlan, newItems } from '@/lib/home-data'
import {
  getAgents,
  getBundles,
  getBuddies,
  getCompetitiveTiers,
  getContentTiers,
  getMaps,
  getPlayerCards,
  getSprays,
  getVersion,
  getWeapons,
} from '@/lib/api'

// โพลารอยด์เอเจนท์เท่านั้นที่เอียง (เหมือนรูปที่แปะไว้) ส่วนอื่นวางตรง
const tilt = (i: number) => ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'][i % 4]

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang, t } = await getI18n(params)
  const h = t.home
  const [agents, maps, weapons, bundles, tiers, cards, sprays, buddies, version, contentTiers] = await Promise.all([
    getAgents(lang),
    getMaps(lang),
    getWeapons(lang),
    getBundles(lang),
    getCompetitiveTiers(lang),
    getPlayerCards(lang),
    getSprays(lang),
    getBuddies(lang),
    getVersion(lang),
    getContentTiers(lang),
  ])

  // ของประจำวัน: คำนวณล่วงหน้าไว้หลายวัน ฝั่ง client เลือกของวันนี้เอง (เปลี่ยนทุกเที่ยงคืนเวลาไทยโดยไม่ต้อง build ใหม่)
  const daily = dailyPlan({ agents, weapons, maps, cards, tiers: contentTiers })
  const fresh = newItems({ agents, weapons, maps, bundles, cards, sprays, buddies })
  const patch = version ? version.version.split('.').slice(0, 2).join('.') : null
  const compMaps = maps.filter(isCompetitiveMap)
  const skinCount = weapons.reduce((n, w) => n + w.skins.filter(isRealSkin).length, 0)
  const vandal = weapons.find((w) => w.displayName.toLowerCase() === 'vandal') ?? weapons.find((w) => w.category.endsWith('Rifle'))
  const ranks = latestTiers(tiers)
  // ตัวแทน 1 อันต่อ division (Iron, Bronze, ... Radiant)
  const rankGroups = ranks.filter((t, i) => ranks.findIndex((x) => x.divisionName === t.divisionName) === i)
  const latestBundles = bundles.slice(-2).reverse()
  const roleGroups = groupByRole(agents)

  return (
    <>
      {/* ================= HERO: หน้าปกนิตยสาร ================= */}
      <section className="relative overflow-hidden border-b-[1.5px] border-ink">
        <PaperScene />
        <RegMark className="absolute top-3 left-3 h-7 w-7 text-blue max-sm:hidden" />
        <RegMark className="absolute top-3 right-3 h-7 w-7 text-blue max-sm:hidden" />
        <Container className="relative pt-8 pb-12 md:pt-10 md:pb-16">
          {/* หัวนิตยสาร: เลขฉบับ = แพตช์ปัจจุบัน */}
          <div className="rule-double animate-fade-up" aria-hidden />
          <div className="flex animate-fade-up items-center justify-between gap-3 py-1.5 font-mono text-xs font-bold tracking-[0.18em] text-blue uppercase sm:text-sm">
            <span>Issue № {patch ?? '—'}</span>
            <span className="tracking-normal max-sm:hidden">{h.chip}</span>
            <span>valo-thai</span>
          </div>
          <div className="rule-double animate-fade-up" aria-hidden />

          <div className="relative mt-10 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            {/* เม็ดสกรีนอยู่หลังรูปเอเจนท์ประจำวัน ไม่ทับตัวหนังสือ */}
            <div aria-hidden className="halftone pointer-events-none absolute top-1/2 right-0 h-[34rem] w-[34rem] -translate-y-1/2 max-lg:hidden" />
            <div className="relative">
              <Crosshair className="absolute -top-6 right-0 h-16 w-16 text-ink sm:h-20 sm:w-20 lg:hidden" />
              <h1 className="relative animate-fade-up text-5xl leading-[1.08] font-extrabold [animation-delay:80ms] sm:text-6xl lg:text-7xl">
                <span className="mark">{h.titleA}</span>{' '}
                <span className="riso">Valorant</span>
                <br />
                {h.titleB}
              </h1>
              <p className="relative mt-6 max-w-lg animate-fade-up text-lg text-ink-soft [animation-delay:160ms]">{h.desc}</p>
              <div className="relative mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
                <Link href="/agents" className="btn">
                  {h.ctaAgents}
                </Link>
                <Link href="/weapons" className="btn btn-paper">
                  {h.ctaSkins}
                </Link>
              </div>
              {/* กล่องตัวเลขแบบบนโปสเตอร์ */}
              <dl className="stat-table relative mt-9 grid-cols-2 sm:grid-cols-4 [&>*:nth-child(3)]:max-sm:border-l-0 [&>*:nth-child(n+3)]:max-sm:border-t-[1.5px] [&>*:nth-child(n+3)]:max-sm:border-ink">
                {[
                  [agents.length, h.agents],
                  [maps.length, h.maps],
                  [skinCount, h.skins],
                  [cards.length + sprays.length + buddies.length, h.collectibles],
                ].map(([n, label]) => (
                  <div key={String(label)} className="flex flex-col-reverse">
                    <dt className="text-sm text-ink-soft">{label}</dt>
                    <dd className="stat-num">{n.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <DailyAgentCard plan={daily} />
          </div>
        </Container>
      </section>

      {/* ================= มีอะไรใหม่ ================= */}
      <WhatsNew items={fresh} builtAt={BUILT_AT} patch={patch} />

      {/* ================= ของประจำวัน ================= */}
      <section className="pt-16 md:pt-20">
        <Container>
          <SectionHeading title={h.dailyTitle} note={h.dailyNote} />
          <DailyPicks plan={daily} />
        </Container>
      </section>

      {/* ================= ROLES ================= */}
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading title={h.rolesTitle} note={h.rolesNote} href="/agents" linkLabel={t.common.seeAll} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {roleGroups.map((r, i) => (
              <Reveal key={r.uuid} delay={i * 70}>
                <Link href={`/agents?role=${r.uuid}`} className="card card-hover flex h-full flex-col p-4 sm:p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink">
                    <img src={r.role.displayIcon} alt="" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3 text-xl font-bold sm:text-2xl">{r.role.displayName}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-ink-soft max-sm:hidden">{r.role.description}</p>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <div className="flex -space-x-2">
                      {r.agents.slice(0, 4).map((a) => (
                        <img
                          key={a.uuid}
                          src={a.displayIconSmall ?? a.displayIcon}
                          alt={a.displayName}
                          className="h-8 w-8 rounded-full border-2 border-card object-cover"
                          style={{ background: agentColor(a) }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-ink-soft">{h.count(r.agents.length)}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* โพลารอยด์เอเจนท์ เลื่อนแนวนอน */}
          <HScroller className="soft-scroll -mx-4 mt-10 flex snap-x scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pt-3 pb-6 sm:-mx-6 sm:scroll-px-6 sm:px-6">
            {agents.map((a, i) => (
              <Link key={a.uuid} href={`/agents/${a.uuid}`} className={`card card-hover w-40 shrink-0 snap-start p-2 md:w-44 ${tilt(i)}`}>
                <div className="relative aspect-square overflow-hidden rounded-md" style={{ background: agentColor(a) }}>
                  <img src={a.bustPortrait ?? a.displayIcon} alt={a.displayName} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                </div>
                <p className="hand mt-1.5 text-center text-lg !text-ink">{a.displayName}</p>
              </Link>
            ))}
          </HScroller>
        </Container>
      </section>

      {/* ================= FUN ================= */}
      <section className="pb-16 md:pb-20">
        <Container>
          <SectionHeading title={h.funTitle} note={h.funNote} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DailyShareCard plan={daily} />
            <Link href="/play/beat" className="fair card card-hover relative flex min-h-56 flex-col overflow-hidden !bg-night p-6 text-paper">
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-mustard uppercase">Admit one · Game A</span>
              <h3 className="mt-2 text-3xl font-bold">{h.playTitle}</h3>
              <p className="mt-2 max-w-md text-paper/75">{h.playDesc}</p>
              <span className="btn mt-auto self-start">{h.playCta}</span>
              {/* ปุ่ม W A S D แบบคีย์แคป */}
              <svg viewBox="0 0 100 70" className="pointer-events-none absolute -right-3 -bottom-3 h-32 w-44 animate-bob opacity-90" aria-hidden>
                {[
                  ['W', 35, 4],
                  ['A', 4, 36],
                  ['S', 35, 36],
                  ['D', 66, 36],
                ].map(([k, x, y]) => (
                  <g key={k as string} transform={`translate(${x} ${y})`}>
                    <rect width="30" height="30" rx="5" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="3" />
                    <text x="15" y="21" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-red)">
                      {k}
                    </text>
                  </g>
                ))}
              </svg>
            </Link>
            <Link href="/random" className="fair card card-hover relative flex min-h-56 flex-col overflow-hidden !bg-mustard p-6 md:col-span-2 lg:col-span-1">
              <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">Admit one · Wheel</span>
              <h3 className="mt-2 text-3xl font-bold">{h.randomTitle}</h3>
              <p className="mt-2 max-w-[70%] text-ink/75">{h.randomDesc}</p>
              <span className="btn mt-auto self-start">{h.randomCta}</span>
              <div className="pointer-events-none absolute -right-8 -bottom-8 h-40 w-40 animate-[spin_14s_linear_infinite]" aria-hidden>
                <div className="grid h-full w-full grid-cols-2 overflow-hidden rounded-full border-4 border-[var(--color-ink)]">
                  {agents.slice(0, 4).map((a) => (
                    <div key={a.uuid} style={{ background: agentColor(a) }}>
                      <img src={a.displayIcon} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* ================= MAPS ================= */}
      <section className="border-y-[1.5px] border-ink bg-paper-2 py-16 md:py-20">
        <Container>
          <SectionHeading title={h.mapsTitle} note={h.mapsNote} href="/maps" linkLabel={t.common.seeAll} />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {compMaps.slice(0, 6).map((m, i) => (
              <Reveal key={m.uuid} delay={(i % 3) * 70}>
                <Link href={`/maps/${m.uuid}`} className="card card-hover block p-2.5">
                  <div className="aspect-video overflow-hidden rounded-md skeleton-dark">
                    {m.splash && <img src={m.splash} alt={m.displayName} loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex items-baseline justify-between px-1 pt-2.5">
                    <p className="font-display text-xl font-bold">{m.displayName}</p>
                    <p className="text-sm text-ink-soft">{h.callouts(m.callouts?.length ?? 0)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= ARSENAL ================= */}
      {vandal && (
        <section className="py-16 md:py-20">
          <Container>
            <SectionHeading title={h.arsenalTitle} note={h.arsenalNote} href="/weapons" linkLabel={h.arsenalLink} />
            <div className="grid items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Reveal className="screen h-[280px] sm:h-[380px]">
                <Viewer3D src={vandal.displayIcon} alt={vandal.displayName} variant="weapon" className="h-full w-full" />
              </Reveal>
              <Reveal delay={100} className="card flex flex-col p-6">
                <p className="kicker">{vandal.shopData?.categoryText ?? 'Rifle'}</p>
                <h3 className="text-4xl font-bold">{vandal.displayName}</h3>
                {vandal.weaponStats && (
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      [h.fireRate, `${vandal.weaponStats.fireRate}`],
                      [h.magazine, `${vandal.weaponStats.magazineSize} ${h.rounds}`],
                      [h.head, `${vandal.weaponStats.damageRanges[0]?.headDamage ?? '-'}`],
                      [h.cost, `${vandal.shopData?.cost ?? '-'}`],
                    ].map(([k, v]) => (
                      <div key={k} className="border-l-[1.5px] border-blue px-3 py-1">
                        <dt className="font-mono text-xs tracking-wider text-blue uppercase">{k}</dt>
                        <dd className="font-poster text-2xl">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="mt-5 font-mono text-sm text-red-ink">{h.skinsToPick(vandal.skins.filter(isRealSkin).length)}</p>
                <Link href={`/weapons/${vandal.uuid}`} className="btn mt-auto self-start">
                  {h.seeSkins(vandal.displayName)}
                </Link>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* ================= RANKS ================= */}
      {rankGroups.length > 0 && (
        <section className="border-y-[1.5px] border-ink bg-night py-16 text-paper md:py-20">
          <Container>
            <SectionHeading title={h.ranksTitle} note={h.ranksNote} href="/ranks" linkLabel={t.common.seeAll} dark />
            <div className="soft-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 lg:justify-between">
              {rankGroups.map((t) => (
                <Link key={t.tier} href="/ranks" className="group flex w-24 shrink-0 flex-col items-center text-center">
                  <img
                    src={t.largeIcon ?? ''}
                    alt={t.tierName}
                    loading="lazy"
                    className="h-16 w-16 object-contain transition-transform group-hover:-translate-y-1.5 group-hover:-rotate-6 md:h-20 md:w-20"
                  />
                  <span className="mt-2 text-sm text-paper/80">{t.divisionName}</span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= BUNDLES + COLLECTION ================= */}
      <section className="py-16 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {latestBundles.length > 0 && (
            <div>
              <SectionHeading title={h.bundlesTitle} note={h.bundlesNote} href="/bundles" linkLabel={t.common.seeAll} />
              <div className="grid gap-5 sm:grid-cols-2">
                {latestBundles.map((b) => (
                  <Link key={b.uuid} href="/bundles" className="card card-hover block p-2.5">
                    <div className="aspect-video overflow-hidden rounded-md skeleton-dark">
                      <img src={b.displayIcon} alt={b.displayName} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <p className="px-1 pt-2 font-display text-lg font-bold">{b.displayName}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/collection" className="card card-hover relative flex flex-col justify-between overflow-hidden !bg-pink p-6">
            <div aria-hidden className="halftone pointer-events-none absolute -right-16 -bottom-16 h-64 w-64" />
            <div className="relative">
              <p className="kicker">{h.collectionKicker}</p>
              <h3 className="mt-1 text-3xl font-bold">{h.collectionTitle}</h3>
            </div>
            <ul className="x-list relative mt-6 space-y-1 text-ink/80">
              <li>{h.cards(cards.length)}</li>
              <li>{h.sprays(sprays.length)}</li>
              <li>{h.buddies(buddies.length)}</li>
            </ul>
            <span className="btn btn-paper relative mt-6 self-start">{h.enter}</span>
          </Link>
        </Container>
      </section>
    </>
  )
}
