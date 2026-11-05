import type { Metadata } from 'next'
import type { Lang } from './i18n'

// ข้อมูลสำหรับ Google / การแชร์ลิงก์ (title, description, canonical, hreflang, Open Graph)

/** โดเมนจริงของเว็บ ใช้ทำ URL เต็มใน canonical / hreflang / sitemap (Google ต้องการ URL เต็ม) */
export const SITE_URL = 'https://valo-thai.rosekorn.com'
export const SITE_NAME = 'Valorant List'
/** รูปพรีวิวตอนแชร์ลิงก์ (LINE / FB / X) — ไฟล์อยู่ที่ public/og.png */
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'Valorant List' }

/**
 * ปีที่ใส่ใน title / description ให้ Google กับคนค้นเห็นว่าข้อมูลใหม่ (คนชอบพิมพ์ "valorant 2026")
 * คิดตอน build — build ใหม่ปีหน้าก็เปลี่ยนเป็นปีใหม่เอง ไม่ต้องมาแก้มือ
 */
const BUILD_DATE = new Date()
export const SEO_YEAR = BUILD_DATE.getFullYear()
/** "พ.ย. 2026" / "Nov 2026" — เดือนที่ build ล่าสุด ใช้ในคำอธิบายหน้าแรก */
export const SEO_UPDATED = {
  th: BUILD_DATE.toLocaleDateString('th-TH-u-ca-gregory', { month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }),
  en: BUILD_DATE.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }),
}
const Y = SEO_YEAR

/**
 * title ของแต่ละหน้าแบบที่คนพิมพ์ค้นจริง (มีคำว่า Valorant + คำค้นภาษาไทยที่คนใช้บ่อย เช่น ตัวละคร, โค้ดเป้า, ฝึกเอม)
 * ต่อท้ายด้วย "· Valorant List" อัตโนมัติจาก template ใน layout
 * พยายามให้คำสำคัญอยู่ต้น title เพราะ Google ตัดท้ายเมื่อยาวเกิน ~60 ตัวอักษร
 */
export const seoTitles = {
  th: {
    home: `Valorant List — ข้อมูล Valorant ภาษาไทย ${Y} ตัวละคร สกิล แมพ สกินปืน`,
    agents: `ตัวละคร Valorant ทั้งหมด ${Y} รวมเอเจนท์และสกิลทุกตัว`,
    agent: (name: string) => `สกิล ${name} Valorant ครบทุกท่า อัปเดต ${Y}`,
    maps: `แมพ Valorant ทั้งหมด ${Y} พร้อม callout ทุกจุด`,
    map: (name: string) => `แมพ ${name} Valorant: callout ทุกจุด และแผนที่ 3D`,
    weapons: `ปืน Valorant ทุกกระบอก ${Y}: ดาเมจ และสกินปืนทั้งหมด`,
    weapon: (name: string) => `${name} Valorant: ดาเมจ และสกินทุกลาย ${Y}`,
    ranks: `แรงค์ Valorant ${Y} เรียงทุกขั้น จาก Iron ถึง Radiant`,
    bundles: `บันเดิลสกิน Valorant ทุกชุด อัปเดต ${Y}`,
    collection: 'ของสะสม Valorant: การ์ด สเปรย์ พวงกุญแจ ฉายา',
    collectionKind: (kind: string) => `${kind} Valorant ทั้งหมด`,
    modes: 'โหมดเกม Valorant ทุกโหมด เล่นยังไง',
    battlepass: `Battle Pass Valorant ${Y} ของรางวัลทุก Act`,
    pass: (name: string) => `${name}: ของรางวัลทุกระดับ`,
    random: 'สุ่มตัวละคร Valorant วงล้อสุ่มเอเจนท์',
    crosshair: `โค้ดเป้า Valorant (Crosshair) พรีวิวและปรับเอง ${Y}`,
    share: 'ทำการ์ดเมนหลัก Valorant แชร์ลงสตอรี่',
    play: 'ฝึกเอม Valorant ออนไลน์ฟรี: Aim Rush 30 วินาที',
    beat: 'Spike Beat มินิเกมวาง Spike ตามจังหวะ',
  },
  en: {
    home: `Valorant List — Valorant agents, abilities, maps & skins (${Y})`,
    agents: `Valorant agents list ${Y}: every agent & ability`,
    agent: (name: string) => `${name} abilities & ultimate guide — Valorant ${Y}`,
    maps: `Valorant maps ${Y}: every map & callouts`,
    map: (name: string) => `${name} map callouts & 3D view — Valorant`,
    weapons: `Valorant weapons ${Y}: damage stats & every skin`,
    weapon: (name: string) => `${name} damage stats & all skins — Valorant ${Y}`,
    ranks: `Valorant ranks in order (${Y}): Iron to Radiant`,
    bundles: `Every Valorant skin bundle (${Y})`,
    collection: 'Valorant player cards, sprays, gun buddies & titles',
    collectionKind: (kind: string) => `All Valorant ${kind.toLowerCase()}`,
    modes: 'Valorant game modes explained',
    battlepass: `Valorant Battle Pass ${Y}: rewards for every act`,
    pass: (name: string) => `${name}: all rewards`,
    random: 'Valorant random agent picker wheel',
    crosshair: `Valorant crosshair codes ${Y}: preview, tweak & copy`,
    share: 'Valorant main card maker',
    play: 'Valorant aim trainer online — free 30-second Aim Rush',
    beat: 'Spike Beat — spike plant rhythm mini-game',
  },
} satisfies Record<Lang, unknown>

/**
 * description สำหรับผลค้นหา (แยกจากคำโปรยบนหน้า) — ใส่คำที่คนค้นบ่อยแบบอ่านเป็นประโยค ไม่ยัดคำ
 * ไม่เกิน ~160 ตัวอักษร ไม่งั้น Google ตัด
 */
export const seoDescriptions = {
  th: {
    agents: `รายชื่อตัวละคร Valorant ทุกตัว ${Y} รวมเอเจนท์ใหม่ล่าสุด แยกตามบทบาท Duelist, Initiator, Controller, Sentinel กดเข้าไปดูสกิลทุกท่าได้เลย`,
    maps: `แมพ Valorant ทุกสนาม ${Y} ทั้งแมพแรงค์และแมพโหมดอื่น มีชื่อ callout ทุกจุด และแผนที่ 3D หมุนดูได้ ใช้คุยกับทีมได้เลย`,
    weapons: `ปืน Valorant ทุกกระบอก ${Y}: ดาเมจตามระยะ ยิงหัวกี่นัดตาย อัตรายิง ราคา และสกินปืนทุกลาย ทั้ง Vandal, Phantom, Operator ดูแบบ 3D ได้`,
    ranks: `แรงค์ Valorant ${Y} เรียงจากต่ำไปสูง Iron, Bronze, Silver, Gold, Platinum, Diamond, Ascendant, Immortal จนถึง Radiant ดูตราแรงค์ทุกขั้นแบบ 3D`,
    bundles: `บันเดิลสกิน Valorant ทุกชุด อัปเดต ${Y} เรียงจากชุดใหม่ล่าสุดในร้านค้าไปชุดเก่า กดดูภาพโปรโมทเต็ม ๆ ได้`,
    battlepass: `Battle Pass Valorant ${Y} และย้อนหลังทุก Act ดูของรางวัลแต่ละระดับ อันไหนฟรี อันไหนต้องซื้อ รวม Event Pass`,
    crosshair: `โค้ดเป้า Valorant (crosshair code): วางโค้ดจากเกมแล้วดูหน้าตาจริงบนแมพ ปรับสี ขนาด เส้น จุดกลาง แล้ว copy โค้ดกลับไปใส่ในเกม`,
    random: 'สุ่มตัวละคร Valorant ด้วยวงล้อ เลือกบทบาท ตัดตัวที่ไม่อยากเล่นออก แล้วหมุน ใช้ตัดสินใจตอนเลือกตัวหรือเล่นชาเลนจ์กับเพื่อน',
    play: 'เกมฝึกเอม Valorant เล่นบนเว็บได้ฟรี ไม่ต้องโหลด ยิงเป้า 30 วินาที ยิงกลางเป้านับเป็นเฮดช็อต วอร์มมือก่อนลงแรงค์',
  },
  en: {
    agents: `Every Valorant agent in ${Y}, including the newest, grouped by role: Duelist, Initiator, Controller and Sentinel. Open any agent for their abilities and ultimate.`,
    maps: `All Valorant maps in ${Y}, competitive pool and the rest, with every callout name and a 3D tactical map you can spin.`,
    weapons: `Every Valorant gun in ${Y}: damage by range, shots to kill, fire rate, price and every skin — Vandal, Phantom, Operator and more, in 3D.`,
    ranks: `Valorant ranks in order for ${Y}: Iron, Bronze, Silver, Gold, Platinum, Diamond, Ascendant, Immortal and Radiant, with every rank badge in 3D.`,
    bundles: `Every Valorant skin bundle, updated ${Y}, newest first, with the full promo art for each store bundle.`,
    battlepass: `Valorant Battle Pass rewards for ${Y} and every past act: what each tier gives, what's free and what's premium, plus event passes.`,
    crosshair: 'Paste a Valorant crosshair code to preview it on a real map, tweak colour, lines and centre dot, then copy the code back into the game.',
    random: "Valorant random agent picker wheel: choose roles, remove agents you don't want, and spin. Good for agent select or challenges with friends.",
    play: 'Free Valorant aim trainer in your browser, no download: 30 seconds of targets, centre hits count as headshots. Warm up before ranked.',
  },
} satisfies Record<Lang, unknown>

/** meta keywords (Google ไม่ใช้แล้ว แต่ Bing / Naver / Yandex ยังอ่าน) */
export const seoKeywords = {
  th: ['Valorant', 'วาโลแรนท์', 'วาโล', 'ตัวละคร Valorant', 'เอเจนท์ Valorant', 'สกิล Valorant', 'แมพ Valorant', 'callout Valorant', 'ปืน Valorant', 'สกินปืน Valorant', 'แรงค์ Valorant', 'โค้ดเป้า Valorant', 'crosshair Valorant', 'ฝึกเอม', `Valorant ${Y}`],
  en: ['Valorant', 'Valorant agents', 'Valorant abilities', 'Valorant maps', 'Valorant callouts', 'Valorant weapons', 'Valorant skins', 'Valorant ranks', 'Valorant crosshair codes', 'Valorant aim trainer', `Valorant ${Y}`],
} satisfies Record<Lang, string[]>

type PageSeo = {
  title: string
  description?: string
  /** รูปเฉพาะหน้า (URL เต็ม) — ไม่ใส่ = ใช้ og.png กลาง */
  image?: string
  /** คำค้นเฉพาะหน้า (ต่อจาก seoKeywords กลาง) */
  keywords?: string[]
  /** true = ไม่ต่อท้าย "· Valorant List" (ใช้กับหน้าแรกที่มีชื่อเว็บอยู่แล้ว) */
  absoluteTitle?: boolean
}

/**
 * metadata ของหน้า: path คือ path แบบไม่มีภาษา ('' = หน้าแรก, '/agents/xxx')
 * - canonical ชี้ตัวเอง
 * - hreflang ชี้หน้าเดียวกันอีกภาษา (ไม่ใช่หน้าแรก) + x-default = ภาษาไทย
 */
export function pageMeta(lang: Lang, path: string, { title, description, image, keywords, absoluteTitle }: PageSeo): Metadata {
  const url = `/${lang}${path}`
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...(keywords ?? []), ...seoKeywords[lang]],
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


/*
 * ประโยคสรุปสั้น ๆ บนหน้า (ตัวหนังสือธรรมดา คนเห็นจริง) ตอบคำถามที่คนค้นบ่อยตรง ๆ
 * ให้ Google / AI Overview ยกไปตอบได้ — ใช้แค่ข้อมูลจาก API ไม่แต่งอะไรเพิ่ม
 */
const joinList = (items: string[], lang: Lang) => {
  if (items.length < 2) return items.join('')
  const last = items[items.length - 1]
  const head = items.slice(0, -1).join(', ')
  return lang === 'en' ? `${head} and ${last}` : `${head} และ ${last}`
}

export function agentSummary(
  lang: Lang,
  name: string,
  role: string | undefined,
  abilities: { name: string; key: string; ultimate: boolean; passive: boolean }[],
) {
  const active = abilities.filter((a) => !a.passive)
  const passive = abilities.find((a) => a.passive)
  const parts = active.map((a) =>
    a.ultimate ? (lang === 'en' ? `the ultimate ${a.name} (${a.key})` : `อัลติ ${a.name} (${a.key})`) : `${a.name} (${a.key})`,
  )
  if (lang === 'en') {
    return `${name} is ${role ? `a ${role} agent` : 'an agent'} in Valorant with ${active.length} abilities: ${joinList(parts, lang)}.${passive ? ` ${name} also has the passive ${passive.name}.` : ''}`
  }
  return `${name} เป็นเอเจนท์${role ? `สาย ${role} ` : ''}ใน Valorant มีสกิล ${active.length} ท่า คือ ${joinList(parts, lang)}${passive ? ` ส่วนพาสซีฟคือ ${passive.name}` : ''}`
}

const ZONE_TH: Record<string, string> = { AttackerSide: 'ฝั่งบุก', 'Attacker Side': 'ฝั่งบุก', DefenderSide: 'ฝั่งรับ', 'Defender Side': 'ฝั่งรับ' }

export function mapSummary(lang: Lang, name: string, calloutCount: number, rawZones: string[]) {
  if (!calloutCount) return null
  // ชื่อโซนจาก API บางอันติดกัน (AttackerSide) — แยกคำ / แปลเป็นไทย
  const zones = rawZones.map((z) => (lang === 'th' ? ZONE_TH[z] : undefined) ?? z.replace(/([a-z])([A-Z])/g, '$1 $2'))
  return lang === 'en'
    ? `${name} has ${calloutCount} callouts across ${zones.length} areas: ${joinList(zones, lang)}.`
    : `แมพ ${name} มีชื่อ callout ทั้งหมด ${calloutCount} จุด แบ่งเป็น ${zones.length} โซน คือ ${joinList(zones, lang)}`
}

export function ranksSummary(lang: Lang, divisions: { name: string; count: number }[]) {
  if (!divisions.length) return null
  // API ให้ชื่อเป็นตัวใหญ่หมด (IRON) — ทำเป็น Iron ให้อ่านง่าย
  const nice = (n: string) => n.charAt(0) + n.slice(1).toLowerCase()
  divisions = divisions.map((d) => ({ ...d, name: nice(d.name) }))
  const names = joinList(divisions.map((d) => d.name), lang)
  const top = divisions[divisions.length - 1]
  const rest = divisions.slice(0, -1)
  const split = rest.length && rest.every((d) => d.count === rest[0].count) ? rest[0].count : 0
  if (lang === 'en') {
    return `Valorant has ${divisions.length} ranks, from lowest to highest: ${names}.${split ? ` Each rank has ${split} tiers, except ${top.name}${top.count === 1 ? ', which has just one' : ''}.` : ''}`
  }
  return `แรงค์ Valorant มี ${divisions.length} ขั้น เรียงจากต่ำไปสูงคือ ${names}${split ? ` แต่ละขั้นแบ่งเป็น ${split} ระดับ ยกเว้น ${top.name}${top.count === 1 ? ' ที่มีระดับเดียว' : ''}` : ''}`
}
