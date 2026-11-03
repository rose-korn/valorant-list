import type { Metadata } from 'next'
import type { Lang } from './i18n'

// ข้อมูลสำหรับ Google / การแชร์ลิงก์ (title, description, canonical, hreflang, Open Graph)

/** โดเมนจริงของเว็บ ใช้ทำ URL เต็มใน canonical / hreflang / sitemap (Google ต้องการ URL เต็ม) */
export const SITE_URL = 'https://valo-thai.rosekorn.com'
export const SITE_NAME = 'Valorant List'
/** รูปพรีวิวตอนแชร์ลิงก์ (LINE / FB / X) — ไฟล์อยู่ที่ public/og.png */
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'Valorant List' }

/**
 * title ของแต่ละหน้าแบบที่คนพิมพ์ค้นจริง (มีคำว่า Valorant + คำค้นภาษาไทย)
 * ต่อท้ายด้วย "· Valorant List" อัตโนมัติจาก template ใน layout
 */
export const seoTitles = {
  th: {
    home: 'Valorant List — ข้อมูล Valorant ภาษาไทย เอเจนท์ สกิล แผนที่ สกินปืน',
    agents: 'เอเจนท์ Valorant ทั้งหมด รวมสกิลทุกตัว',
    agent: (name: string) => `สกิล ${name} Valorant ครบทุกท่า`,
    maps: 'แผนที่ Valorant ทุกแมพ พร้อม callout',
    map: (name: string) => `แมพ ${name} Valorant: callout และแผนที่ 3D`,
    weapons: 'ปืน Valorant ทุกกระบอก ดาเมจ และสกินทั้งหมด',
    weapon: (name: string) => `${name} Valorant: ดาเมจ และสกินทุกลาย`,
    ranks: 'แรงค์ Valorant ทั้งหมด จาก Iron ถึง Radiant',
    bundles: 'บันเดิลสกิน Valorant ทุกชุด',
    collection: 'ของสะสม Valorant: การ์ด สเปรย์ พวงกุญแจ ฉายา',
    collectionKind: (kind: string) => `${kind} Valorant ทั้งหมด`,
    modes: 'โหมดเกม Valorant ทุกโหมด เล่นยังไง',
    battlepass: 'Battle Pass Valorant ทุก Act ย้อนหลัง',
    pass: (name: string) => `${name}: ของรางวัลทุกระดับ`,
    random: 'สุ่มเอเจนท์ Valorant วงล้อสุ่มตัวละคร',
    share: 'ทำการ์ดเมนหลัก Valorant แชร์ลงสตอรี่',
    play: 'Aim Rush เกมฝึกเล็ง Valorant 30 วินาที',
    beat: 'Spike Beat มินิเกมวาง Spike ตามจังหวะ',
  },
  en: {
    home: 'Valorant List — Valorant agents, abilities, maps & skins',
    agents: 'All Valorant agents & abilities',
    agent: (name: string) => `${name} abilities & ultimate — Valorant agent`,
    maps: 'Valorant maps & callouts',
    map: (name: string) => `${name} map callouts & 3D view — Valorant`,
    weapons: 'Valorant weapons: damage stats & every skin',
    weapon: (name: string) => `${name} damage stats & all skins — Valorant`,
    ranks: 'Valorant ranks: Iron to Radiant',
    bundles: 'Every Valorant skin bundle',
    collection: 'Valorant player cards, sprays, gun buddies & titles',
    collectionKind: (kind: string) => `All Valorant ${kind.toLowerCase()}`,
    modes: 'Valorant game modes explained',
    battlepass: 'Valorant Battle Pass rewards, every act',
    pass: (name: string) => `${name}: all rewards`,
    random: 'Valorant random agent picker wheel',
    share: 'Valorant main card maker',
    play: 'Aim Rush — 30-second Valorant aim trainer',
    beat: 'Spike Beat — spike plant rhythm mini-game',
  },
} satisfies Record<Lang, unknown>

type PageSeo = {
  title: string
  description?: string
  /** รูปเฉพาะหน้า (URL เต็ม) — ไม่ใส่ = ใช้ og.png กลาง */
  image?: string
  /** true = ไม่ต่อท้าย "· Valorant List" (ใช้กับหน้าแรกที่มีชื่อเว็บอยู่แล้ว) */
  absoluteTitle?: boolean
}

/**
 * metadata ของหน้า: path คือ path แบบไม่มีภาษา ('' = หน้าแรก, '/agents/xxx')
 * - canonical ชี้ตัวเอง
 * - hreflang ชี้หน้าเดียวกันอีกภาษา (ไม่ใช่หน้าแรก) + x-default = ภาษาไทย
 */
export function pageMeta(lang: Lang, path: string, { title, description, image, absoluteTitle }: PageSeo): Metadata {
  const url = `/${lang}${path}`
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: { th: `/th${path}`, en: `/en${path}`, 'x-default': `/th${path}` },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: lang === 'th' ? 'th_TH' : 'en_US',
      alternateLocale: lang === 'th' ? 'en_US' : 'th_TH',
      url,
      title: fullTitle,
      description,
      images: image ? [{ url: image, alt: title }] : [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: image ? [image] : [OG_IMAGE.url] },
  }
}

/** ตัดคำอธิบายยาว ๆ ให้พอดี snippet ของ Google (~160 ตัวอักษร) */
export function clip(text: string | null | undefined, max = 160) {
  const s = (text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s || undefined
}

/** BreadcrumbList (JSON-LD) ให้ Google โชว์ "หน้าแรก › เอเจนท์ › Sage" ในผลค้นหา */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE_URL + it.path })),
  }
}
