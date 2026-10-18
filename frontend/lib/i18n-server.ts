import { cookies } from 'next/headers'
import { type Lang, LANG_COOKIE, dict } from './i18n'

/** ภาษาที่ผู้ใช้เลือก (เก็บใน cookie) ค่าเริ่มต้นเป็นไทย */
export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value
  return value === 'en' ? 'en' : 'th'
}

export async function getI18n() {
  const lang = await getLang()
  return { lang, t: dict[lang] }
}
