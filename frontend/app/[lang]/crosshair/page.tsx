import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Bone } from '@/components/Skeleton'
import { Container, PageHero } from '@/components/ui'
import { getMaps } from '@/lib/api'
import { getI18n } from '@/lib/i18n-server'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { isCompetitiveMap } from '@/lib/valorant'
import CrosshairLab from './CrosshairLab'

export async function generateMetadata({ params }: PageProps<'/[lang]/crosshair'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/crosshair', { title: seoTitles[lang].crosshair, description: seoDescriptions[lang].crosshair })
}

export default async function CrosshairPage({ params }: PageProps<'/[lang]/crosshair'>) {
  const { lang, t } = await getI18n(params)
  // ฉากพื้นหลังใช้ภาพแผนที่แรงค์ (เห็นว่า crosshair ชัดแค่ไหนบนสีจริงของแต่ละแมพ)
  const backgrounds = (await getMaps(lang))
    .filter((m) => isCompetitiveMap(m) && m.splash)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((m) => ({ name: m.displayName, image: m.splash! }))

  return (
    <>
      <PageHero en="Crosshair" title={t.crosshair.title} description={t.crosshair.desc} note={t.crosshair.note} />
      <Container className="py-8 md:py-12">
        {/* ตัวทำ crosshair อ่านโค้ดจาก ?code= ฝั่ง browser — ระหว่างรอโชว์โครงจอไว้ */}
        <Suspense fallback={<Bone className="aspect-video w-full" />}>
          <CrosshairLab backgrounds={backgrounds} />
        </Suspense>
      </Container>
    </>
  )
}
