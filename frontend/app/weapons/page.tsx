import type { Metadata } from 'next'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { WEAPON_CATEGORIES, getGear, getWeapons, isRealSkin } from '@/lib/valorant'
import ArsenalClient, { type WeaponCard } from './ArsenalClient'

export const metadata: Metadata = { title: 'ปืน & สกิน' }

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
      skins: w.skins.filter(isRealSkin).length,
    }))
    .sort((a, b) => order(a.category) - order(b.category) || a.cost - b.cost)

  const totalSkins = cards.reduce((n, w) => n + w.skins, 0)

  return (
    <>
      <PageHero
        en="Arsenal"
        title="ปืน & สกิน"
        description="ดูค่าสเตตัส ดาเมจตามระยะ ว่ายิงกี่นัดตาย แล้วก็สกินทุกลายพร้อมสีและวิดีโอ หมุนดูแบบ 3D ได้ทุกอัน"
        facts={[
          { label: 'กระบอก', value: weapons.length },
          { label: 'สกิน', value: totalSkins.toLocaleString() },
        ]}
        note="ปืนที่ซื้อบ่อยสุดก็ Vandal กับ Phantom นั่นแหละ"
      />
      <Container className="py-10 md:py-14">
        {cards.length ? (
          <ArsenalClient weapons={cards} categories={WEAPON_CATEGORIES.filter((c) => cards.some((w) => w.category === c.key))} />
        ) : (
          <EmptyState />
        )}
      </Container>

      {gear.length > 0 && (
        <section className="border-t-2 border-ink bg-paper-2 py-12 md:py-16">
          <Container>
            <SectionHeading title="เกราะ" note="อย่าลืมซื้อทุกรอบนะ!" />
            <div className="grid gap-5 md:grid-cols-2">
              {gear.map((g) => (
                <div key={g.uuid} className="card flex gap-4 p-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink">
                    <img src={g.displayIcon} alt="" className="h-10 w-10 object-contain" loading="lazy" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-2xl font-bold">{g.displayName}</h3>
                      {g.shopData?.cost != null && <span className="font-display font-bold text-red-ink">{g.shopData.cost} เครดิต</span>}
                    </div>
                    <p className="mt-1 text-ink-soft">{g.description}</p>
                    {g.details && g.details.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {g.details.map((d) => (
                          <span key={d.name} className="chip !bg-paper-2 text-sm">
                            {d.name}: <b>{d.value}</b>
                          </span>
                        ))}
                      </div>
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
