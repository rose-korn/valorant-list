import type { Metadata } from 'next'
import { Container, EmptyState, PageHero, SectionHeading } from '@/components/ui'
import { getGear, getWeapons } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { WEAPON_CATEGORIES, isRealSkin } from '@/lib/valorant'
import ArsenalClient, { type WeaponCard } from './ArsenalClient'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.weapons.title }
}

export default async function WeaponsPage() {
  const [weapons, gear, { lang, t }] = await Promise.all([getWeapons(), getGear(), getI18n()])

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
        title={t.weapons.title}
        description={t.weapons.desc}
        facts={[
          { label: t.weapons.unit, value: weapons.length },
          { label: t.weapons.skins, value: totalSkins.toLocaleString() },
        ]}
        note={t.weapons.note}
      />
      <Container className="py-10 md:py-14">
        {cards.length ? (
          <ArsenalClient
            weapons={cards}
            categories={WEAPON_CATEGORIES.filter((c) => cards.some((w) => w.category === c.key)).map((c) => ({
              key: c.key,
              label: lang === 'th' ? c.th : c.label,
              sub: lang === 'th' ? c.label : '',
            }))}
          />
        ) : (
          <EmptyState text={t.common.empty} />
        )}
      </Container>

      {gear.length > 0 && (
        <section className="border-t-2 border-ink bg-paper-2 py-12 md:py-16">
          <Container>
            <SectionHeading title={t.weapons.armorTitle} note={t.weapons.armorNote} />
            <div className="grid gap-5 md:grid-cols-2">
              {gear.map((g) => (
                <div key={g.uuid} className="card flex gap-4 p-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink">
                    <img src={g.displayIcon} alt="" className="h-10 w-10 object-contain" loading="lazy" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-2xl font-bold">{g.displayName}</h3>
                      {g.shopData?.cost != null && <span className="font-display font-bold text-red-ink">{g.shopData.cost} {t.common.credits}</span>}
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
