import type { Metadata } from 'next'
import { Container, EmptyState, PageHero } from '@/components/ui'
import { getLevelBorders, getPlayerCards } from '@/lib/api'
import { pageMeta, seoDescriptions, seoTitles } from '@/lib/seo'
import { getI18n } from '@/lib/i18n-server'
import LevelPicker from './LevelPicker'

export async function generateMetadata({ params }: PageProps<'/[lang]/levels'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return pageMeta(lang, '/levels', { title: seoTitles[lang].levels, description: seoDescriptions[lang].levels })
}

export default async function LevelsPage({ params }: PageProps<'/[lang]/levels'>) {
  const { lang, t } = await getI18n(params)
  const [borders, cards] = await Promise.all([getLevelBorders(lang), getPlayerCards(lang)])
  // การ์ดตัวอย่างที่ใส่ไว้หลังกรอบ: ใช้การ์ดเริ่มต้นของเกม (ชื่อ VALORANT Card) ถ้าไม่เจอใช้ใบแรก
  const card = cards.find((c) => /^valorant card$/i.test(c.displayName)) ?? cards[0]
  const max = borders.at(-1)?.startingLevel ?? 0

  return (
    <>
      <PageHero
        en="Level borders"
        title={t.levels.title}
        description={t.levels.desc}
        facts={[{ label: t.levels.borders, value: borders.length }]}
        note={t.levels.note}
      />
      <Container className="py-10 md:py-14">
        {borders.length > 0 && <p className="mb-6 max-w-3xl text-sm text-ink-soft">{t.levels.summary(borders.length, max)}</p>}
        {borders.length ? (
          <LevelPicker
            borders={borders.map((b) => ({ uuid: b.uuid, from: b.startingLevel, plate: b.levelNumberAppearance, frame: b.smallPlayerCardAppearance }))}
            card={card?.smallArt ?? null}
          />
        ) : (
          <EmptyState text={t.common.empty} />
        )}
      </Container>
    </>
  )
}
