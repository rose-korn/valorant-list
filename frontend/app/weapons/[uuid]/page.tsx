import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink, Container, SectionHeading } from '@/components/ui'
import { WALL_PEN, categoryLabel, getContentTiers, getWeapon, getWeapons, isRealSkin, rgbaHex, skinImage } from '@/lib/valorant'
import SkinExplorer, { type SkinItem, type TierInfo } from './SkinExplorer'

export async function generateStaticParams() {
  const weapons = await getWeapons()
  return weapons.map((w) => ({ uuid: w.uuid }))
}

export async function generateMetadata({ params }: PageProps<'/weapons/[uuid]'>): Promise<Metadata> {
  const { uuid } = await params
  const weapon = await getWeapon(uuid)
  return { title: weapon ? `${weapon.displayName} — สกินและสเตตัส` : 'ปืน' }
}

const HP = 150
const WALL_PEN_TH: Record<string, string> = { Low: 'ต่ำ', Medium: 'กลาง', High: 'สูง' }

export default async function WeaponPage({ params }: PageProps<'/weapons/[uuid]'>) {
  const { uuid } = await params
  const [weapon, tiers] = await Promise.all([getWeapon(uuid), getContentTiers()])
  if (!weapon) notFound()

  const tierMap: Record<string, TierInfo> = Object.fromEntries(
    tiers.map((t) => [t.uuid, { uuid: t.uuid, name: t.devName ?? t.displayName, icon: t.displayIcon, color: rgbaHex(t.highlightColor), rank: t.rank }]),
  )

  const skins: SkinItem[] = [
    { uuid: 'default', displayName: `${weapon.displayName} ธรรมดา`, tier: null, image: weapon.displayIcon, wallpaper: null, chromas: [], levels: [] },
    ...weapon.skins
      .filter(isRealSkin)
      .map((s) => ({
        uuid: s.uuid,
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
    .filter((t) => skins.some((s) => s.tier === t.uuid))
    .sort((a, b) => b.rank - a.rank)
  const wallPen = stats ? WALL_PEN[stats.wallPenetration] : undefined

  return (
    <>
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="pt-8 pb-6">
          <BackLink href="/weapons" label="ปืนทั้งหมด" />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-ink-soft">{weapon.shopData?.categoryText ?? categoryLabel(weapon.category)}</p>
              <h1 className="animate-fade-up text-6xl font-bold sm:text-7xl">{weapon.displayName}</h1>
            </div>
            <div className="flex gap-2">
              {weapon.shopData?.cost != null && <span className="chip text-base">💰 {weapon.shopData.cost.toLocaleString()} เครดิต</span>}
              <span className="chip text-base">🎨 {skins.length - 1} สกิน</span>
            </div>
          </div>
        </Container>
      </section>

      <SkinExplorer weaponName={weapon.displayName} skins={skins} tiers={usedTiers}>
        {stats && (
          <section className="border-y-2 border-ink bg-paper-2 py-12 md:py-16">
            <Container>
              <SectionHeading title="สเตตัส" note="ตัวเลขจาก API ของเกมตรง ๆ" />
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  ['ยิงต่อวินาที', `${stats.fireRate}`],
                  ['กระสุนต่อแม็ก', `${stats.magazineSize} นัด`],
                  ['รีโหลด', `${stats.reloadTimeSeconds} วิ`],
                  ['ชักปืน', `${stats.equipTimeSeconds} วิ`],
                  ['ความเร็ววิ่ง', `${Math.round(stats.runSpeedMultiplier * 100)}%`],
                  ['ยิงทะลุกำแพง', wallPen ? WALL_PEN_TH[wallPen] ?? wallPen : '—'],
                  ['ความแม่นนัดแรก', `${stats.firstBulletAccuracy}°`],
                  ...(stats.shotgunPelletCount > 1 ? [['เม็ดลูกปราย', `${stats.shotgunPelletCount}`]] : []),
                  ...(stats.adsStats ? [['ซูม', `${stats.adsStats.zoomMultiplier}x`]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="card !shadow-[2px_3px_0_var(--color-ink)] px-4 py-3">
                    <dt className="text-sm text-ink-soft">{k}</dt>
                    <dd className="font-display text-2xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>

              {stats.damageRanges.length > 0 && (
                <>
                  <h3 className="mt-12 mb-1 text-2xl font-bold">ดาเมจตามระยะ</h3>
                  <p className="hand mb-5 text-lg">ตัวเลขหลังขีดคือยิงกี่นัดตาย (เทียบศัตรู 100 HP + เกราะ 50)</p>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {stats.damageRanges.map((r) => {
                      const top = Math.max(...stats.damageRanges.map((d) => d.headDamage), 1)
                      return (
                        <div key={`${r.rangeStartMeters}-${r.rangeEndMeters}`} className="card p-5">
                          <p className="font-display text-xl font-bold">
                            {r.rangeStartMeters}–{r.rangeEndMeters} เมตร
                          </p>
                          <div className="mt-3 space-y-2.5">
                            {[
                              { k: 'หัว', v: r.headDamage, c: 'var(--color-red)' },
                              { k: 'ตัว', v: r.bodyDamage, c: 'var(--color-mustard)' },
                              { k: 'ขา', v: r.legDamage, c: 'var(--color-teal)' },
                            ].map((p) => (
                              <div key={p.k} className="grid grid-cols-[32px_1fr_92px] items-center gap-2">
                                <span className="text-ink-soft">{p.k}</span>
                                <span className="h-3 overflow-hidden rounded-full bg-paper-2">
                                  <span className="block h-full rounded-full" style={{ width: `${(p.v / top) * 100}%`, background: p.c }} />
                                </span>
                                <span className="text-right">
                                  <b className="font-display">{Math.round(p.v)}</b>
                                  <span className="text-sm text-ink-soft"> — {Math.ceil(HP / Math.max(p.v, 1))} นัด</span>
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
