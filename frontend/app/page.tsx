import Link from 'next/link'
import PaperScene from '@/components/three/PaperScene'
import Viewer3D from '@/components/three/Viewer3D'
import Reveal from '@/components/Reveal'
import { Arrow, Scribble, Star } from '@/components/brand'
import { Container, SectionHeading } from '@/components/ui'
import {
  agentColor,
  dayIndex,
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
} from '@/lib/valorant'

const tilt = (i: number) => ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'][i % 4]

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
  const featured = agents.length ? agents[dayIndex() % agents.length] : null
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
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b-2 border-ink">
        <PaperScene />
        <Container className="relative grid items-center gap-14 py-12 md:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="chip animate-fade-up">
              🛠️ แฟนไซต์ทำเอง{version ? ` · patch ${version.version.split('.').slice(0, 2).join('.')}` : ''}
            </span>
            <h1 className="mt-5 animate-fade-up text-5xl leading-[1.1] font-bold [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              สมุดจด{' '}
              <span className="relative inline-block text-red-ink">
                Valorant
                <Scribble className="absolute -bottom-2 left-0 h-3 w-full" color="var(--color-mustard)" />
              </span>
              <br />
              ของพวกเรา
            </h1>
            <p className="mt-6 max-w-lg animate-fade-up text-lg text-ink-soft [animation-delay:160ms]">
              รวมข้อมูลเอเจนท์ แผนที่ ปืน สกิน แรงค์ ไว้ในที่เดียว เปิดดูง่าย ๆ ตอนรอคิว หรือเอาไว้เถียงกับเพื่อนว่าใครเก่งสุด
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/agents" className="btn">
                ดูเอเจนท์ทั้งหมด
              </Link>
              <Link href="/weapons" className="btn btn-paper">
                ส่องสกินปืน
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="chip">{agents.length} เอเจนท์</span>
              <span className="chip">{maps.length} แผนที่</span>
              <span className="chip">{skinCount.toLocaleString()} สกิน</span>
              <span className="chip">{(cards.length + sprays.length + buddies.length).toLocaleString()} ของสะสม</span>
            </div>
          </div>

          {featured && (
            <Link href={`/agents/${featured.uuid}`} className="group relative mx-auto block w-full max-w-xs animate-fade-up [animation-delay:200ms] sm:max-w-sm">
              <div className="card tape relative rotate-2 p-3 transition-transform group-hover:rotate-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg" style={{ background: agentColor(featured) }}>
                  {featured.background && (
                    <img src={featured.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply" />
                  )}
                  {featured.fullPortrait && (
                    <img
                      src={featured.fullPortrait}
                      alt={featured.displayName}
                      className="absolute inset-0 h-full w-full scale-125 object-cover object-top transition-transform duration-500 group-hover:scale-[1.3]"
                    />
                  )}
                </div>
                <div className="flex items-baseline justify-between px-1 pt-3">
                  <p className="font-display text-2xl font-bold">{featured.displayName}</p>
                  <p className="text-sm text-ink-soft">{featured.role?.displayName}</p>
                </div>
              </div>
              <p className="hand absolute -top-11 left-0 flex -rotate-6 items-end gap-1 text-xl sm:-left-10">
                เอเจนท์ประจำวัน!
                <Arrow className="h-8 w-10 rotate-[25deg]" />
              </p>
            </Link>
          )}
        </Container>
      </section>

      {/* ================= ROLES ================= */}
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading title="เล่นสายไหนดี?" note="แต่ละบทบาทเหมาะกับคนละสไตล์นะ" href="/agents" />
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
                    <span className="text-sm text-ink-soft">{r.agents.length} ตัว</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* โพลารอยด์เอเจนท์ เลื่อนแนวนอน */}
          <div className="soft-scroll -mx-4 mt-10 flex snap-x gap-5 overflow-x-auto px-4 pt-3 pb-6 sm:-mx-6 sm:px-6">
            {agents.map((a, i) => (
              <Link key={a.uuid} href={`/agents/${a.uuid}`} className={`card card-hover w-40 shrink-0 snap-start p-2 md:w-44 ${tilt(i)}`}>
                <div className="relative aspect-square overflow-hidden rounded-md" style={{ background: agentColor(a) }}>
                  <img src={a.bustPortrait ?? a.displayIcon} alt={a.displayName} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                </div>
                <p className="hand mt-1.5 text-center text-lg !text-ink">{a.displayName}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= MAPS ================= */}
      <section className="border-y-2 border-ink bg-paper-2 py-16 md:py-20">
        <Container>
          <SectionHeading title="แผนที่ที่ต้องจำ callout ให้ได้" note="กดเข้าไปดูแผนที่ 3D ได้ด้วยนะ" href="/maps" />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {compMaps.slice(0, 6).map((m, i) => (
              <Reveal key={m.uuid} delay={(i % 3) * 70}>
                <Link href={`/maps/${m.uuid}`} className={`card card-hover tape block p-2.5 ${['', 'tape-teal', 'tape-red'][i % 3]} ${tilt(i)}`}>
                  <div className="aspect-video overflow-hidden rounded-md bg-ink">
                    {m.splash && <img src={m.splash} alt={m.displayName} loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex items-baseline justify-between px-1 pt-2.5">
                    <p className="font-display text-xl font-bold">{m.displayName}</p>
                    <p className="text-sm text-ink-soft">{m.callouts?.length ?? 0} จุด</p>
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
            <SectionHeading title="ปืนคู่ใจของคุณคือ?" note="ลองลากหมุนดูได้เลย" href="/weapons" linkLabel="ดูปืนทั้งหมด" />
            <div className="grid items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Reveal className="screen h-[280px] sm:h-[380px]">
                <Viewer3D src={vandal.displayIcon} alt={vandal.displayName} variant="weapon" className="h-full w-full" />
              </Reveal>
              <Reveal delay={100} className="card flex flex-col p-6">
                <p className="text-ink-soft">{vandal.shopData?.categoryText ?? 'Rifle'}</p>
                <h3 className="text-4xl font-bold">{vandal.displayName}</h3>
                {vandal.weaponStats && (
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ['ยิงต่อวินาที', `${vandal.weaponStats.fireRate}`],
                      ['กระสุน', `${vandal.weaponStats.magazineSize} นัด`],
                      ['ยิงหัว', `${vandal.weaponStats.damageRanges[0]?.headDamage ?? '-'}`],
                      ['ราคา', `${vandal.shopData?.cost ?? '-'}`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-paper-2 px-3 py-2">
                        <dt className="text-sm text-ink-soft">{k}</dt>
                        <dd className="font-display text-xl font-bold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="hand mt-5 -rotate-1 text-lg">มีสกินให้เลือก {vandal.skins.filter(isRealSkin).length} ลาย ไปส่องกัน →</p>
                <Link href={`/weapons/${vandal.uuid}`} className="btn mt-auto self-start">
                  ดูสกิน {vandal.displayName}
                </Link>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* ================= RANKS ================= */}
      {rankGroups.length > 0 && (
        <section className="border-y-2 border-ink bg-night py-16 text-paper md:py-20">
          <Container>
            <SectionHeading title="ตอนนี้ติดแรงค์ไหนกัน?" note="ไม่ต้องอาย เราก็ติด Gold 😅" href="/ranks" dark />
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
              <SectionHeading title="บันเดิลล่าสุด" note="เงินในกระเป๋าสั่นแล้ว" href="/bundles" />
              <div className="grid gap-5 sm:grid-cols-2">
                {latestBundles.map((b, i) => (
                  <Link key={b.uuid} href="/bundles" className={`card card-hover block p-2.5 ${tilt(i + 1)}`}>
                    <div className="aspect-video overflow-hidden rounded-md bg-ink">
                      <img src={b.displayIcon} alt={b.displayName} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <p className="px-1 pt-2 font-display text-lg font-bold">{b.displayName}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/collection" className="card card-hover relative flex flex-col justify-between overflow-hidden !bg-mustard p-6">
            <Star className="absolute top-4 right-4 h-10 w-10 animate-wiggle text-ink" />
            <div>
              <p className="hand text-xl !text-ink">มุมของสะสม</p>
              <h3 className="mt-1 text-3xl font-bold">การ์ด สเปรย์ พวงกุญแจ ฉายา</h3>
            </div>
            <ul className="mt-6 space-y-1 text-ink/80">
              <li>🃏 การ์ดผู้เล่น {cards.length.toLocaleString()} ใบ</li>
              <li>🎨 สเปรย์ {sprays.length.toLocaleString()} ลาย</li>
              <li>🔑 พวงกุญแจ {buddies.length.toLocaleString()} ชิ้น</li>
            </ul>
            <span className="btn btn-paper mt-6 self-start">เข้าไปดู →</span>
          </Link>
        </Container>
      </section>
    </>
  )
}
