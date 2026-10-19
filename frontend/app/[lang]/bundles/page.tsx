import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getBundles } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import BundlesClient from './BundlesClient'

export async function generateMetadata({ params }: PageProps<'/[lang]/bundles'>): Promise<Metadata> {
  const { t } = await getI18n(params)
  return { title: t.bundles.title }
}

export default async function BundlesPage({ params }: PageProps<'/[lang]/bundles'>) {
  const { lang, t } = await getI18n(params)
  // ส่งตามลำดับ API (เก่า → ใหม่) ให้ client เป็นคนเรียง
  const bundles = await getBundles(lang)

  return (
    <>
      <PageHero
        en="Bundles"
        title={t.bundles.title}
        description={t.bundles.desc}
        facts={[{ label: t.bundles.unit, value: bundles.length }]}
        note={t.bundles.note}
      />
      <Container className="py-10 md:py-14">{bundles.length ? <BundlesClient bundles={bundles} /> : <EmptyState text={t.common.empty} />}</Container>
    </>
  )
}
