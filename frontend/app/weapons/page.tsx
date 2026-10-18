import type { Metadata } from 'next'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { WEAPON_CATEGORIES, getGear, getWeapons, isRealSkin } from '@/lib/valorant'
import ArsenalClient, { type WeaponCard } from './ArsenalClient'

export const metadata: Metadata = { title: 'Arsenal' }

export default async function WeaponsPage() {
  const [weapons, gear] = await Promise.all([getWeapons(), getGear()])

  const order = (c: string) => {
    const i = WEAPON_CATEGORIES.findIndex((x) => x.key === c)
    return i === -1 ? 99 : i
  }

  const cards: WeaponCard[] = weapons
    .map((w) => ({
      uuid: w.uuid,
      displayName: w.displayName,
      category: w.category,
      displayIcon: w.displayIcon,
      cost: w.shopData?.cost ?? 0,
      fireRate: w.weaponStats?.fireRate ?? 0,
      magazine: w.weaponStats?.magazineSize ?? 0,
      head: w.weaponStats?.damageRanges?.[0]?.headDamage ?? 0,
      body: w.weaponStats?.damageRanges?.[0]?.bodyDamage ?? 0,
      wallPen: w.weaponStats?.wallPenetration ?? null,
      skins: w.skins.filter(isRealSkin).length,
    }))
    .sort((a, b) => order(a.category) - order(b.category) || a.cost - b.cost)

  const totalSkins = cards.reduce((n, w) => n + w.skins, 0)

  return (
    <>
      <PageHero
        eyebrow="Arsenal"
        title="Arsenal"
        th="อาวุธ & สกิน"
        description="สเตตัสทุกกระบอก ดาเมจตามระยะ และสกินทั้งหมดพร้อม chroma และวิดีโอ — หมุนดูแบบ 3D ได้ทุกลาย"
        stats={[
          { label: 'Weapons', value: weapons.length },
          { label: 'Skins', value: totalSkins.toLocaleString() },
          { label: 'Categories', value: new Set(weapons.map((w) => w.category)).size },
        ]}
      />
      <Container className="py-10 md:py-14">
        {cards.length ? (
          <ArsenalClient weapons={cards} categories={WEAPON_CATEGORIES.filter((c) => cards.some((w) => w.category === c.key))} />
        ) : (
          <EmptyState />
        )}
      </Container>

      {gear.length > 0 && (
        <section className="border-t border-white/5 bg-val-deep py-14 md:py-20">
          <Container>
            <SectionHeading index="Gear" title="Armor" th="เกราะที่ซื้อได้ในแต่ละรอบ" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gear.map((g) => (
                <div key={g.uuid} className="val-panel val-corners flex gap-5 p-6">
                  <img src={g.displayIcon} alt="" className="h-16 w-16 shrink-0 object-contain" loading="lazy" />
                  <div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-2xl text-val-cream uppercase">{g.displayName}</h3>
                      {g.shopData?.cost != null && <span className="font-display text-lg text-val-red">¤ {g.shopData.cost}</span>}
                    </div>
                    <p className="mt-1 font-thai text-sm leading-relaxed font-light text-val-cream/60">{g.description}</p>
                    {g.details && g.details.length > 0 && (
                      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                        {g.details.map((d) => (
                          <div key={d.name} className="text-xs">
                            <dt className="inline text-val-cream/40">{d.name}: </dt>
                            <dd className="inline text-val-cream/80">{d.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
