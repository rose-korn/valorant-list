import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getContentTiers, getWeapons } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { isRealSkin, skinImage } from '@/lib/valorant'
import MyLocker, { type LockerData } from './MyLocker'

export async function generateMetadata({ params }: PageProps<'/[lang]/my'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/my', { title: seoTitles[lang].my, description: seoDescriptions[lang].my })
}

export default async function MyPage({ params }: PageProps<'/[lang]/my'>) {
  const { lang, t } = await getI18n(params)
  const [weapons, tiers] = await Promise.all([getWeapons(lang), getContentTiers(lang)])
  const tierList = [...tiers].sort((a, b) => a.rank - b.rank)

  // ส่งไปฝั่ง client แบบกะทัดรัด (สกินเกือบ 1,400 ตัว): [uuid, ชื่อ, index ปืน, รูป (null = รูปตามแบบปกติของ API), index ระดับ]
  const data: LockerData = {
    weapons: weapons.map((w) => ({ uuid: w.uuid, name: w.displayName })),
    tiers: tierList.map((x) => x.displayIcon),
    skins: weapons.flatMap((w, wi) =>
      w.skins.filter(isRealSkin).flatMap((s) => {
        const img = skinImage(s)
        if (!img) return []
        const plain = img === `https://media.valorant-api.com/weaponskins/${s.uuid}/displayicon.png`
        return [[s.uuid, s.displayName, wi, plain ? null : img, tierList.findIndex((x) => x.uuid === s.contentTierUuid)] as LockerData['skins'][number]]
      }),
    ),
  }

  return (
    <>
      <PageHero en="My locker" title={t.my.title} description={t.my.desc} note={t.my.note} />
      <Container className="py-8 md:py-12">{data.skins.length ? <MyLocker data={data} /> : <EmptyState text={t.common.empty} />}</Container>
    </>
  )
}
