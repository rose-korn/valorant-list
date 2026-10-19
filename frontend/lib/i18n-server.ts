import { notFound } from 'next/navigation'
import { type Lang, LANGS, dict } from './i18n'

/** ภาษามาจาก URL (/th/... หรือ /en/...) — ค่าอื่นถือว่าไม่มีหน้านี้ */
export function toLang(raw: string): Lang {
  if (!(LANGS as readonly string[]).includes(raw)) notFound()
  return raw as Lang
}

export async function getI18n(params: Promise<{ lang: string }>) {
  const lang = toLang((await params).lang)
  return { lang, t: dict[lang] }
}

/** ใช้ใน generateStaticParams ของทุกหน้า: build ไว้ทั้งสองภาษา */
export const langParams = () => LANGS.map((lang) => ({ lang }))
