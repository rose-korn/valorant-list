import Link from 'next/link'
import HeroScene from '@/components/three/HeroScene'
import Viewer3D from '@/components/three/Viewer3D'
import Reveal from '@/components/Reveal'
import { Container, Eyebrow, SectionHeading } from '@/components/ui'
import {
  agentColor,
  getAgents,
  getBundles,
  getBuddies,
  getCompetitiveTiers,
  getMaps,
  getPlayerCards,
  getSprays,
  getVersion,
  getWeapons,
  groupByRole,
  isCompetitiveMap,
  isRealSkin,
  latestTiers,
  rgbaHex,
  dayIndex,
} from '@/lib/valorant'

export default async function HomePage() {
  const [agents, maps, weapons, bundles, tiers, cards, sprays, buddies, version] = await Promise.all([
    getAgents(),
    getMaps(),
    getWeapons(),
    getBundles(),
    getCompetitiveTiers(),
    getPlayerCards(),
    getSprays(),
    getBuddies(),
    getVersion(),
  ])

  // เปลี่ยนเอเจนท์เด่นทุกวัน
  const day = dayIndex()
  const featured = agents.length ? agents[day % agents.length] : null
  const featuredColor = agentColor(featured)

  const compMaps = maps.filter(isCompetitiveMap)
  const skinCount = weapons.reduce((n, w) => n + w.skins.filter(isRealSkin).length, 0)
  const vandal = weapons.find((w) => w.displayName.toLowerCase() === 'vandal') ?? weapons.find((w) => w.category.endsWith('Rifle'))
  const ranks = latestTiers(tiers)
  // ตัวแทน 1 อันต่อ division (Iron, Bronze, ... Radiant)
  const rankGroups = ranks.filter((t, i) => ranks.findIndex((x) => x.divisionName === t.divisionName) === i)
  const latestBundles = bundles.slice(-4).reverse()

  const roleGroups = groupByRole(agents)

  const stats = [
    { label: 'Agents', value: agents.length },
    { label: 'Maps', value: maps.length },
    { label: 'Weapons', value: weapons.length },
    { label: 'Skins', value: skinCount },
    { label: 'Bundles', value: bundles.length },
    { label: 'Cards · Sprays · Buddies', value: cards.length + sprays.length + buddies.length },
  ]

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#2a0f17_0%,#0f1923_55%,#0a1118_100%)]" />
        <HeroScene accent={featuredColor} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-val-ink via-transparent to-val-ink/40" />
        <div
          aria-hidden
          className="val-outline-text pointer-events-none absolute bottom-[8%] left-0 font-display text-[24vw] leading-none whitespace-nowrap uppercase select-none"
        >
          Valorant
        </div>

        <Container className="relative grid w-full items-center gap-6 py-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10 order-2 lg:order-1">
            <Eyebrow className="animate-fade-up">
              Fan Database{version ? ` · Patch ${version.version.split('.').slice(0, 2).join('.')}` : ''}
            </Eyebrow>
            <h1 className="mt-5 animate-fade-up font-display text-[17vw] leading-[0.82] tracking-tight text-val-cream uppercase [animation-delay:100ms] sm:text-8xl lg:text-[8.5rem]">
              Defy
              <br />
              <span className="text-val-red [text-shadow:0_0_60px_rgba(255,70,84,.45)]">The Limits</span>
            </h1>
            <p className="mt-6 max-w-md animate-fade-up font-thai text-base leading-relaxed font-light text-val-cream/65 [animation-delay:200ms] md:text-lg">
              คลังข้อมูล Valorant ฉบับแฟนเมด — เอเจนท์ แผนที่ อาวุธ สกิน แรงค์ บันเดิล และของสะสมทั้งหมด
              พร้อมมุมมอง 3D ที่หมุน ซูม และสำรวจได้เอง
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
              <Link href="/agents" className="val-btn">
                Explore Agents
              </Link>
              <Link href="/weapons" className="val-btn-ghost">
                Arsenal 3D
              </Link>
            </div>
          </div>

          {featured && (
            <Link
              href={`/agents/${featured.uuid}`}
              className="group relative order-1 mx-auto h-[46svh] w-full max-w-md animate-fade-in sm:h-[52svh] lg:order-2 lg:h-[78svh] lg:max-w-none"
            >
              <div
                className="absolute inset-x-[10%] bottom-0 top-[15%] rotate-3 opacity-40 blur-3xl transition-opacity group-hover:opacity-60"
                style={{ background: `linear-gradient(160deg, ${featuredColor}, ${agentColor(featured, 2, '#0f1923')})` }}
              />
              {featured.background && (
                <img
                  src={featured.background}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain opacity-20 mix-blend-screen"
                />
              )}
              {featured.fullPortrait && (
                <img
                  src={featured.fullPortrait}
                  alt={featured.displayName}
                  className="relative h-full w-full animate-float object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,.6)] transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute right-0 bottom-6 flex flex-col items-end text-right">
                <span className="text-[10px] tracking-[0.35em] text-val-cream/50 uppercase">Agent of the day</span>
                <span className="font-display text-4xl leading-none text-val-cream uppercase md:text-5xl">
                  {featured.displayName}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase" style={{ color: featuredColor }}>
                  {featured.role?.displayIcon && <img src={featured.role.displayIcon} alt="" className="h-3.5 w-3.5" />}
                  {featured.role?.displayName}
                </span>
              </div>
            </Link>
          )}
        </Container>

        {/* scroll hint */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.35em] text-val-cream/40 uppercase md:flex">
          Scroll
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-val-red to-transparent" />
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="relative border-y border-white/5 bg-val-deep">
        <Container className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60} className="bg-val-deep px-4 py-6 md:py-8">
              <p className="font-display text-4xl text-val-cream md:text-5xl">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-val-red uppercase">{s.label}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* ================= MARQUEE ================= */}
      {agents.length > 0 && (
        <div className="relative overflow-hidden bg-val-red py-3">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
            {[...agents, ...agents].map((a, i) => (
              <span key={`${a.uuid}-${i}`} className="flex items-center gap-8 font-display text-2xl tracking-wider text-val-ink uppercase">
                {a.displayName}
                <span className="h-2 w-2 rotate-45 bg-val-ink" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= AGENTS / ROLES ================= */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="val-grid-bg absolute inset-0 opacity-50" />
        <Container className="relative">
          <SectionHeading index="01 — Agents" title="Your Agents" th="เลือกบทบาทที่ใช่ แล้วสร้างสไตล์การเล่นของคุณ" href="/agents" />

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {roleGroups.map((r, i) => (
              <Reveal key={r.uuid} delay={i * 80}>
                <Link
                  href={`/agents?role=${r.uuid}`}
                  className="val-panel val-corners group relative block h-full overflow-hidden p-4 transition-colors sm:p-6 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between">
                    <img src={r.role.displayIcon} alt="" className="h-10 w-10 opacity-80" />
                    <span className="font-display text-4xl text-white/10 transition-colors sm:text-5xl group-hover:text-val-red/40">
                      {String(r.agents.length).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl text-val-cream uppercase sm:mt-6 sm:text-3xl">{r.role.displayName}</h3>
                  <p className="mt-2 line-clamp-3 font-thai text-sm leading-relaxed max-sm:hidden font-light text-val-cream/50">
                    {r.role.description}
                  </p>
                  <div className="mt-5 flex -space-x-2">
                    {r.agents.slice(0, 6).map((a) => (
                      <img
                        key={a.uuid}
                        src={a.displayIconSmall ?? a.displayIcon}
                        alt={a.displayName}
                        className="h-9 w-9 rounded-full border-2 border-val-ink object-cover"
                        style={{ background: agentColor(a) }}
                      />
                    ))}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* แถวการ์ดเอเจนท์ เลื่อนแนวนอน */}
          <div className="val-scroll -mx-4 mt-10 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {agents.map((a) => (
              <Link
                key={a.uuid}
                href={`/agents/${a.uuid}`}
                className="group relative h-72 w-44 shrink-0 snap-start overflow-hidden md:h-80 md:w-52"
                style={{ background: `linear-gradient(170deg, ${agentColor(a)} 0%, ${agentColor(a, 3, '#0f1923')} 100%)` }}
              >
                {a.background && <img src={a.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />}
                <img
                  src={a.bustPortrait ?? a.fullPortrait ?? a.displayIcon}
                  alt={a.displayName}
                  loading="lazy"
                  className="absolute inset-x-0 bottom-0 h-[92%] w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                  <p className="font-display text-2xl leading-none text-white uppercase">{a.displayName}</p>
                  <p className="mt-1 text-[10px] tracking-[0.2em] text-white/60 uppercase">{a.role?.displayName}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= MAPS (cream section แบบเว็บทางการ) ================= */}
      <section className="relative overflow-hidden bg-val-cream py-20 text-val-ink md:py-28">
        <div className="val-stripes absolute inset-0 opacity-50 mix-blend-multiply" />
        <Container className="relative">
          <SectionHeading index="02 — Maps" title="Battlegrounds" th="สนามรบทั่วโลก จากโลกคู่ขนาน" href="/maps" light />
          <div className="grid gap-4 md:grid-cols-6">
            {compMaps.slice(0, 5).map((m, i) => (
              <Reveal key={m.uuid} delay={i * 70} className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
                <Link href={`/maps/${m.uuid}`} className="group relative block aspect-[16/10] overflow-hidden bg-val-ink">
                  {m.splash && (
                    <img
                      src={m.splash}
                      alt={m.displayName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-val-ink/90 via-val-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-5">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] text-val-red uppercase">{m.tacticalDescription}</p>
                      <p className="font-display text-3xl leading-none text-val-cream uppercase md:text-4xl">{m.displayName}</p>
                      <p className="mt-1 font-mono text-[10px] text-val-cream/50">{m.coordinates}</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center border border-val-cream/40 text-val-cream transition-colors group-hover:border-val-red group-hover:bg-val-red">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= ARSENAL 3D ================= */}
      {vandal && (
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-val-red/10 blur-[120px]" />
          <Container className="relative">
            <SectionHeading index="03 — Arsenal" title="Pick Your Weapon" th="หมุนดูอาวุธแบบ 3D และสกินกว่าพันลาย" href="/weapons" />
            <div className="grid items-stretch gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Reveal className="val-corners h-[320px] border border-white/10 sm:h-[420px] lg:h-[480px]">
                <Viewer3D src={vandal.displayIcon} alt={vandal.displayName} variant="weapon" className="h-full w-full" />
              </Reveal>
              <Reveal delay={120} className="val-panel flex flex-col p-6 md:p-8">
                <p className="text-[10px] tracking-[0.3em] text-val-red uppercase">{vandal.shopData?.categoryText ?? 'Rifle'}</p>
                <h3 className="font-display text-6xl text-val-cream uppercase">{vandal.displayName}</h3>
                {vandal.weaponStats && (
                  <dl className="mt-6 grid grid-cols-2 gap-4">
                    {[
                      ['Fire rate', `${vandal.weaponStats.fireRate}/s`],
                      ['Magazine', vandal.weaponStats.magazineSize],
                      ['Head dmg', vandal.weaponStats.damageRanges[0]?.headDamage ?? '-'],
                      ['Cost', `¤ ${vandal.shopData?.cost ?? '-'}`],
                    ].map(([k, v]) => (
                      <div key={k} className="border-l border-val-red/50 pl-3">
                        <dt className="text-[10px] tracking-[0.25em] text-val-cream/40 uppercase">{k}</dt>
                        <dd className="font-display text-3xl text-val-cream">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="mt-6 font-thai text-sm font-light text-val-cream/50">
                  มีสกินให้เลือกถึง {vandal.skins.filter(isRealSkin).length} แบบ — เข้าไปดูแบบ 3D ทีละลาย พร้อม chroma และวิดีโอ
                </p>
                <Link href={`/weapons/${vandal.uuid}`} className="val-btn mt-auto self-start">
                  ดูสกินทั้งหมด
                </Link>
              </Reveal>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {weapons
                .filter((w) => !w.category.endsWith('Melee'))
                .slice(0, 12)
                .map((w) => (
                  <Link
                    key={w.uuid}
                    href={`/weapons/${w.uuid}`}
                    className="group val-panel flex flex-col items-center gap-2 p-4 transition-colors hover:border-val-red/50"
                  >
                    <img
                      src={w.displayIcon}
                      alt={w.displayName}
                      loading="lazy"
                      className="h-12 w-full object-contain opacity-70 transition-all group-hover:scale-110 group-hover:opacity-100"
                    />
                    <span className="font-display text-sm tracking-widest text-val-cream/70 uppercase group-hover:text-white">
                      {w.displayName}
                    </span>
                  </Link>
                ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= RANKS ================= */}
      {rankGroups.length > 0 && (
        <section className="relative overflow-hidden border-y border-white/5 bg-val-deep py-20 md:py-24">
          <Container>
            <SectionHeading index="04 — Competitive" title="Climb The Ranks" th="เส้นทางจาก Iron สู่ Radiant" href="/ranks" />
            <div className="val-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:justify-between">
              {rankGroups.map((t, i) => (
                <Reveal key={t.tier} delay={i * 50} className="flex w-24 shrink-0 flex-col items-center text-center">
                  <Link href="/ranks" className="group flex flex-col items-center">
                    <img
                      src={t.largeIcon ?? ''}
                      alt={t.tierName}
                      loading="lazy"
                      className="h-20 w-20 object-contain transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110"
                    />
                    <span className="mt-2 font-display text-xs tracking-widest uppercase" style={{ color: rgbaHex(t.color, '#ece8e1') }}>
                      {t.divisionName}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= BUNDLES ================= */}
      {latestBundles.length > 0 && (
        <section className="relative py-20 md:py-28">
          <Container>
            <SectionHeading index="05 — Store" title="Bundles" th="คอลเลกชันสกินชุดล่าสุด" href="/bundles" />
            <div className="grid gap-4 sm:grid-cols-2">
              {latestBundles.map((b, i) => (
                <Reveal key={b.uuid} delay={i * 80}>
                  <Link href="/bundles" className="group relative block aspect-video overflow-hidden bg-val-panel">
                    <img
                      src={b.displayIcon}
                      alt={b.displayName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-val-ink via-transparent to-transparent" />
                    <p className="absolute bottom-4 left-4 font-display text-3xl text-val-cream uppercase md:text-4xl">{b.displayName}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-val-red py-20 md:py-24">
        <div className="val-stripes absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-val-ink/70 uppercase">{'// Collection'}</p>
            <h2 className="mt-2 font-display text-6xl leading-[0.85] text-val-ink uppercase md:text-8xl">
              Collect
              <br />
              Them All
            </h2>
            <p className="mt-4 max-w-md font-thai text-val-ink/75">
              Player Card {cards.length.toLocaleString()} ใบ · Spray {sprays.length.toLocaleString()} ลาย · Buddy{' '}
              {buddies.length.toLocaleString()} ชิ้น
            </p>
          </div>
          <Link
            href="/collection"
            className="val-btn !bg-val-ink !text-val-cream hover:!bg-val-cream hover:!text-val-ink"
          >
            เปิดคลังของสะสม
          </Link>
        </Container>
      </section>
    </>
  )
}
