import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getBundles } from '@/lib/valorant'
import BundlesClient from './BundlesClient'

export const metadata: Metadata = { title: 'Bundles' }

export default async function BundlesPage() {
  // API เรียงจากเก่า → ใหม่ กลับด้านให้ชุดล่าสุดขึ้นก่อน
  const bundles = (await getBundles()).slice().reverse()

  return (
    <>
      <PageHero
        eyebrow="Store"
        title="Bundles"
        th="บันเดิลสกิน"
        description="รวมบันเดิลทุกชุดที่เคยวางขายในร้านค้า กดเพื่อดูภาพโปรโมทและรายละเอียด"
        image={bundles[0]?.displayIcon}
        stats={[{ label: 'Bundles', value: bundles.length }]}
      />
      <Container className="py-10 md:py-14">{bundles.length ? <BundlesClient bundles={bundles} /> : <EmptyState />}</Container>
    </>
  )
}
