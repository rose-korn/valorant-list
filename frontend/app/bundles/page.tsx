import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getBundles } from '@/lib/valorant'
import BundlesClient from './BundlesClient'

export const metadata: Metadata = { title: 'บันเดิล' }

export default async function BundlesPage() {
  // API เรียงจากเก่า → ใหม่ กลับด้านให้ชุดล่าสุดขึ้นก่อน
  const bundles = (await getBundles()).slice().reverse()

  return (
    <>
      <PageHero
        en="Bundles"
        title="บันเดิลสกิน"
        description="รวมทุกชุดที่เคยขายในร้านค้า เรียงจากใหม่ไปเก่า กดดูภาพโปรโมทเต็ม ๆ ได้"
        facts={[{ label: 'ชุด', value: bundles.length }]}
        note="ชุดไหนที่คุณกดซื้อไปแล้วบ้าง?"
      />
      <Container className="py-10 md:py-14">{bundles.length ? <BundlesClient bundles={bundles} /> : <EmptyState />}</Container>
    </>
  )
}
