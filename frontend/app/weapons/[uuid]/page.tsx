import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink, Container, SectionHeading } from '@/components/ui'
import { getContentTiers, getWeapon } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { WALL_PEN, categoryLabel, isRealSkin, rgbaHex, skinImage } from '@/lib/valorant'
import SkinExplorer, { type SkinItem, type TierInfo } from './SkinExplorer'

export async function generateMetadata({ params }: PageProps<'/weapons/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const weapon = await getWeapon(uuid)
  return { title: weapon?.displayName ?? 'Weapon' }
}

const HP = 150

export default async function WeaponPage({ params }: PageProps<'/weapons/[uuid]'>) {
  const { uuid } = await params
  const [weapon, tiers, { t }] = await Promise.all([getWeapon(uuid), getContentTiers(), getI18n()])
  if (!weapon) notFound()
  const w = t.weapons

  const tierMap: Record<string, TierInfo> = Object.fromEntries(
    tiers.map((x) => [x.uuid, { uuid: x.uuid, name: x.devName ?? x.displayName, icon: x.displayIcon, color: rgbaHex(x.highlightColor), rank: x.rank }]),
  )

  const skins: SkinItem[] = [
    { uuid: 'default', order: -1, displayName: w.standard(weapon.displayName), tier: null, image: weapon.displayIcon, wallpaper: null, chromas: [], levels: [] },
    ...weapon.skins
      .filter(isRealSkin)
      .map((s, order) => ({
        uuid: s.uuid,
        order,
        displayName: s.displayName,
        tier: s.contentTierUuid,
        image: skinImage(s),
        wallpaper: s.wallpaper,
        chromas: s.chromas.map((c) => ({ uuid: c.uuid, displayName: c.displayName, image: c.fullRender ?? c.displayIcon, swatch: c.swatch, video: c.streamedVideo })),
        levels: s.levels.map((l) => ({ uuid: l.uuid, displayName: l.displayName, levelItem: l.levelItem, video: l.streamedVideo })),
      }))
      .filter((s) => s.image)
      .sort((a, b) => (tierMap[b.tier ?? '']?.rank ?? 0) - (tierMap[a.tier ?? '']?.rank ?? 0) || a.displayName.localeCompare(b.displayName)),
  ]

  const stats = weapon.weaponStats
  const usedTiers = Object.values(tierMap)
    .filter((x) => skins.some((s) => s.tier === x.uuid))
    .sort((a, b) => b.rank - a.rank)
  const wallPen = stats ? WALL_PEN[stats.wallPenetration] : undefined

  // [key ใน dict, ค่า]
  const statRows: [string, string][] = stats
    ? [
        ['fireRate', `${stats.fireRate}`],
        ['magazine', `${stats.magazineSize} ${w.rounds}`],
        ['reload', `${stats.reloadTimeSeconds} ${w.sec}`],
        ['equip', `${stats.equipTimeSeconds} ${w.sec}`],
        ['run', `${Math.round(stats.runSpeedMultiplier * 100)}%`],
        ['wall', wallPen ? (w.wallPen[wallPen] ?? wallPen) : '—'],
        ['accuracy', `${stats.firstBulletAccuracy}°`],
        ...(stats.shotgunPelletCount > 1 ? ([['pellets', `${stats.shotgunPelletCount}`]] as [string, string][]) : []),
        ...(stats.adsStats ? ([['zoom', `${stats.adsStats.zoomMultiplier}x`]] as [string, string][]) : []),
      ]
    : []

  return (
    <>
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="pt-8 pb-6">
          <BackLink href="/weapons" label={w.back} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-ink-soft">{weapon.shopData?.categoryText ?? categoryLabel(weapon.category)}</p>
              <h1 className="animate-fade-up text-6xl font-bold sm:text-7xl">{weapon.displayName}</h1>
            </div>
            <div className="flex gap-2">
              {weapon.shopData?.cost != null && (
                <span className="chip text-base">
                  💰 {weapon.shopData.cost.toLocaleString()} {t.common.credits}
                </span>
              )}
              <span className="chip text-base">
                🎨 {skins.length - 1} {w.skins}
              </span>
            </div>
          </div>
        </Container>
      </section>

      <SkinExplorer weaponName={weapon.displayName} skins={skins} tiers={usedTiers}>
        {stats && (
          <section className="border-y-2 border-ink bg-paper-2 py-12 md:py-16">
            <Container>
              <SectionHeading title={w.statsTitle} note={w.statsNote} />
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {statRows.map(([key, value]) => (
                  <div key={key} className="card !shadow-[2px_3px_0_var(--color-ink)] px-4 py-3">
                    <dt className="text-sm font-semibold">{w.stat[key][0]}</dt>
                    <dd className="font-display text-2xl font-bold">{value}</dd>
                    <p className="text-xs leading-snug text-ink-soft">{w.stat[key][1]}</p>
                  </div>
                ))}
              </dl>

              {stats.damageRanges.length > 0 && (
                <>
                  <h3 className="mt-12 mb-1 text-2xl font-bold">{w.damageTitle}</h3>
                  <p className="hand mb-5 text-lg">{w.damageNote}</p>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {stats.damageRanges.map((r) => {
                      const top = Math.max(...stats.damageRanges.map((d) => d.headDamage), 1)
                      return (
                        <div key={`${r.rangeStartMeters}-${r.rangeEndMeters}`} className="card p-5">
                          <p className="font-display text-xl font-bold">
                            {r.rangeStartMeters}–{r.rangeEndMeters} {w.meters}
                          </p>
                          <div className="mt-3 space-y-2.5">
                            {[
                              { k: w.headShort, v: r.headDamage, c: 'var(--color-red)' },
                              { k: w.body, v: r.bodyDamage, c: 'var(--color-mustard)' },
                              { k: w.legs, v: r.legDamage, c: 'var(--color-teal)' },
                            ].map((p) => (
                              <div key={p.k} className="grid grid-cols-[40px_1fr_96px] items-center gap-2">
                                <span className="text-ink-soft">{p.k}</span>
                                <span className="h-3 overflow-hidden rounded-full bg-paper-2">
                                  <span className="block h-full rounded-full" style={{ width: `${(p.v / top) * 100}%`, background: p.c }} />
                                </span>
                                <span className="text-right">
                                  <b className="font-display">{Math.round(p.v)}</b>
                                  <span className="text-sm text-ink-soft"> — {w.shots(Math.ceil(HP / Math.max(p.v, 1)))}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </Container>
          </section>
        )}
      </SkinExplorer>
    </>
  )
}
