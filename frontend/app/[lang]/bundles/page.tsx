import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getBundles } from '@/lib/api'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { getI18n } from '@/lib/i18n-server'
import { BUILT_AT, firstSeen } from '@/lib/first-seen'
import BundlesClient from './BundlesClient'

export async function generateMetadata({ params }: PageProps<'/[lang]/bundles'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/bundles', { title: seoTitles[lang].bundles, description: seoDescriptions[lang].bundles })
}

export default async function BundlesPage({ params }: PageProps<'/[lang]/bundles'>) {
  const { lang, t } = await getI18n(params)
  // ส่งตามลำดับ API (เก่า → ใหม่) ให้ client เป็นคนเรียง
  const bundles = await getBundles(lang)
  // ส่งเฉพาะบันเดิลที่มีวันที่เห็นครั้งแรก (ของเก่าเป็น 0 ไม่ต้องส่ง)
  const seen = Object.fromEntries(bundles.map((b) => [b.uuid, firstSeen('bundles', b.uuid)]).filter(([, d]) => d))

  return (
    <>
      <PageHero
        en="Bundles"
        title={t.bundles.title}
        description={t.bundles.desc}
        facts={[{ label: t.bundles.unit, value: bundles.length }]}
        note={t.bundles.note}
      />
      <Container className="py-10 md:py-14">{bundles.length ? <BundlesClient bundles={bundles} seen={seen} builtAt={BUILT_AT} /> : <EmptyState text={t.common.empty} />}</Container>
    </>
  )
}
