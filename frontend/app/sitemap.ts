import type { MetadataRoute } from 'next'
import { getAgents, getContracts, getMaps, getWeapons } from '@/lib/api'
import { KINDS } from './[lang]/collection/data'
import { SITE_URL } from '@/lib/seo'

// static export: สร้างเป็นไฟล์ out/sitemap.xml ตอน build — รายการหน้าทั้งหมดให้ Google
// ใช้ uuid จาก API ชุดเดียวกับ generateStaticParams ของแต่ละหน้า (uuid เหมือนกันทั้ง 2 ภาษา)
export const dynamic = 'force-static'

const STATIC_PATHS = [
  '',
  '/agents',
  '/random',
  '/maps',
  '/weapons',
  '/ranks',
  '/bundles',
  '/battlepass',
  '/collection',
  '/modes',
  '/share',
  '/play',
  '/play/beat',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [agents, maps, weapons, contracts] = await Promise.all([getAgents('th'), getMaps('th'), getWeapons('th'), getContracts('th')])
  const paths = [
    ...STATIC_PATHS,
    ...agents.map((a) => `/agents/${a.uuid}`),
    ...maps.map((m) => `/maps/${m.uuid}`),
    ...weapons.map((w) => `/weapons/${w.uuid}`),
    ...contracts
      .filter((c) => c.content.relationType === 'Season' || c.content.relationType === 'Event')
      .map((c) => `/battlepass/${c.uuid}`),
    ...KINDS.map((k) => `/collection/${k}`),
  ]
  const now = new Date()
  // ใส่ทั้ง /th และ /en พร้อมบอกว่าเป็นหน้าคู่กัน (hreflang ใน sitemap)
  return paths.flatMap((p) =>
    (['th', 'en'] as const).map((lang) => ({
      url: `${SITE_URL}/${lang}${p}`,
      lastModified: now,
      priority: p === '' ? 1 : p.split('/').length === 2 ? 0.8 : 0.6,
      alternates: { languages: { th: `${SITE_URL}/th${p}`, en: `${SITE_URL}/en${p}` } },
    })),
  )
}
