import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink, Container, Eyebrow } from '@/components/ui'
import { WALL_PEN, categoryLabel, getContentTiers, getWeapon, getWeapons, isRealSkin, rgbaHex, skinImage } from '@/lib/valorant'
import SkinExplorer, { type SkinItem, type TierInfo } from './SkinExplorer'

export async function generateStaticParams() {
  const weapons = await getWeapons()
  return weapons.map((w) => ({ uuid: w.uuid }))
}

export async function generateMetadata({ params }: PageProps<'/weapons/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const weapon = await getWeapon(uuid)
  return { title: weapon ? `${weapon.displayName} — Skins & Stats` : 'Weapon' }
}

const HP = 150

export default async function WeaponPage({ params }: PageProps<'/weapons/[uuid]'>) {
  const { uuid } = await params
  const [weapon, tiers] = await Promise.all([getWeapon(uuid), getContentTiers()])
  if (!weapon) notFound()

  const tierMap: Record<string, TierInfo> = Object.fromEntries(
    tiers.map((t) => [t.uuid, { uuid: t.uuid, name: t.devName ?? t.displayName, icon: t.displayIcon, color: rgbaHex(t.highlightColor), rank: t.rank }]),
  )

  const skins: SkinItem[] = [
    {
      uuid: 'default',
      displayName: `Standard ${weapon.displayName}`,
      tier: null,
      image: weapon.displayIcon,
      wallpaper: null,
      chromas: [],
      levels: [],
    },
    ...weapon.skins
      .filter(isRealSkin)
      .map((s) => ({
        uuid: s.uuid,
        displayName: s.displayName,
        tier: s.contentTierUuid,
        image: skinImage(s),
        wallpaper: s.wallpaper,
        chromas: s.chromas.map((c) => ({
          uuid: c.uuid,
          displayName: c.displayName,
          image: c.fullRender ?? c.displayIcon,
          swatch: c.swatch,
          video: c.streamedVideo,
        })),
        levels: s.levels.map((l) => ({
          uuid: l.uuid,
          displayName: l.displayName,
          levelItem: l.levelItem,
          video: l.streamedVideo,
        })),
      }))
      .filter((s) => s.image)
      .sort((a, b) => (tierMap[b.tier ?? '']?.rank ?? 0) - (tierMap[a.tier ?? '']?.rank ?? 0) || a.displayName.localeCompare(b.displayName)),
  ]

  const stats = weapon.weaponStats
  const usedTiers = Object.values(tierMap)
    .filter((t) => skins.some((s) => s.tier === t.uuid))
    .sort((a, b) => b.rank - a.rank)

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="val-grid-bg absolute inset-0 opacity-60" />
        <Container className="relative pt-6">
          <BackLink href="/weapons" label="Arsenal" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>{weapon.shopData?.categoryText ?? categoryLabel(weapon.category)}</Eyebrow>
              <h1 className="mt-3 animate-fade-up font-display text-7xl leading-[0.85] text-val-cream uppercase sm:text-8xl lg:text-9xl">
                {weapon.displayName}
              </h1>
            </div>
            <div className="flex gap-6 pb-2">
              {weapon.shopData?.cost != null && (
                <div className="border-l-2 border-val-red pl-4">
                  <p className="font-display text-4xl text-val-cream">¤ {weapon.shopData.cost.toLocaleString()}</p>
                  <p className="text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Cost</p>
                </div>
              )}
              <div className="border-l-2 border-val-red pl-4">
                <p className="font-display text-4xl text-val-cream">{skins.length - 1}</p>
                <p className="text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">Skins</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SkinExplorer weaponName={weapon.displayName} skins={skins} tiers={usedTiers}>
        {stats && (
          <section className="border-y border-white/5 bg-val-deep py-14 md:py-20">
            <Container>
              <Eyebrow className="mb-6">Stats</Eyebrow>
              <dl className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  ['Fire rate', `${stats.fireRate}`, 'rounds/sec'],
                  ['Magazine', `${stats.magazineSize}`, 'rounds'],
                  ['Reload', `${stats.reloadTimeSeconds}`, 'seconds'],
                  ['Equip', `${stats.equipTimeSeconds}`, 'seconds'],
                  ['Run speed', `${Math.round(stats.runSpeedMultiplier * 100)}%`, 'of base'],
                  ['Wall pen', WALL_PEN[stats.wallPenetration] ?? '—', 'penetration'],
                  ['First shot', `${stats.firstBulletAccuracy}°`, 'spread'],
                  ...(stats.shotgunPelletCount > 1 ? [['Pellets', `${stats.shotgunPelletCount}`, 'per shot']] : []),
                  ...(stats.adsStats
                    ? [
                        ['ADS zoom', `${stats.adsStats.zoomMultiplier}x`, 'magnification'],
                        ['ADS rate', `${stats.adsStats.fireRate}`, 'rounds/sec'],
                      ]
                    : []),
                  ...(stats.fireMode ? [['Fire mode', stats.fireMode.split('::')[1] ?? stats.fireMode, '']] : []),
                  ...(stats.altFireType ? [['Alt fire', stats.altFireType.split('::')[1] ?? stats.altFireType, '']] : []),
                  ...(stats.feature ? [['Feature', stats.feature.split('::')[1] ?? stats.feature, '']] : []),
                ].map(([k, v, unit]) => (
                  <div key={k} className="bg-val-deep p-4 md:p-5">
                    <dt className="text-[10px] tracking-[0.25em] text-val-red uppercase">{k}</dt>
                    <dd className="mt-1 font-display text-3xl break-words text-val-cream">{v}</dd>
                    {unit && <p className="text-[10px] text-val-cream/35">{unit}</p>}
                  </div>
                ))}
              </dl>

              {stats.damageRanges.length > 0 && (
                <div className="mt-12">
                  <Eyebrow className="mb-6">Damage by range</Eyebrow>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {stats.damageRanges.map((r) => {
                      const parts = [
                        { k: 'Head', v: r.headDamage, color: '#ff4654' },
                        { k: 'Body', v: r.bodyDamage, color: '#ece8e1' },
                        { k: 'Legs', v: r.legDamage, color: '#3fe3c6' },
                      ]
                      const top = Math.max(...stats.damageRanges.map((d) => d.headDamage), 1)
                      return (
                        <div key={`${r.rangeStartMeters}-${r.rangeEndMeters}`} className="val-panel p-5">
                          <p className="font-display text-2xl text-val-cream">
                            {r.rangeStartMeters}–{r.rangeEndMeters}
                            <span className="ml-1 text-sm text-val-cream/40">m</span>
                          </p>
                          <div className="mt-4 space-y-3">
                            {parts.map((p) => (
                              <div key={p.k} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 text-sm">
                                <span className="text-[11px] tracking-wider text-val-cream/50 uppercase">{p.k}</span>
                                <span className="h-2 bg-white/5">
                                  <span className="block h-full" style={{ width: `${(p.v / top) * 100}%`, background: p.color }} />
                                </span>
                                <span className="w-24 text-right font-mono text-val-cream/85">
                                  {Math.round(p.v)}
                                  <span className="ml-2 text-[10px] text-val-cream/40">{Math.ceil(HP / Math.max(p.v, 1))} shots</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 font-thai text-xs text-val-cream/40">* จำนวนนัดที่ต้องใช้คำนวณจากเป้าหมาย {HP} HP (100 HP + เกราะหนัก 50)</p>
                </div>
              )}
            </Container>
          </section>
        )}
      </SkinExplorer>
    </>
  )
}
