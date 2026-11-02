// คำอธิบายสกิลภาษาไทยที่เขียนใหม่เอง แทนคำแปลจาก valorant-api ที่อ่านแล้วงง
// (เช่น EQUIP แปลเป็น "ติดตั้ง", ALT FIRE แปลเป็น "กดโหมดยิงเสริม")
//
// key ชั้นแรก = uuid ของเอเจนต์, ชั้นที่สอง = slot ของสกิล (Ability1, Ability2, Grenade, Ultimate, Passive)
// `en` = คำอธิบายภาษาอังกฤษตอนที่เราเขียนฉบับไทยนี้ ถ้า Riot แก้สกิล (ตัวเลขเปลี่ยน ฯลฯ)
// ข้อความอังกฤษจาก API จะไม่ตรงกับ `en` แล้วเว็บจะกลับไปใช้คำแปลจาก API เอง จะได้ไม่โชว์ข้อมูลเก่า
// ดูรายการที่ตกรุ่นได้จาก `node scripts/dump-abilities.mjs`
//
// แท็กอย่าง <whitebold>…</> และ <teal>…</> ใช้ได้เหมือนข้อความจาก API (components/RichText.tsx แปลงให้)
// ชื่อสกิลคงเป็นภาษาอังกฤษตามในเกม

import type { Agent } from './valorant'

export interface ThAbilityOverride {
  en: string
  th: string
}

export const TH_ABILITY_OVERRIDES: Record<string, Record<string, ThAbilityOverride>> = {}

const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

/** ใส่คำอธิบายไทยที่เขียนใหม่ลงใน agents ภาษาไทย เทียบกับ agents ภาษาอังกฤษว่ายังเป็นสกิลเวอร์ชันเดิมอยู่ */
export function applyThAbilityOverrides(th: Agent[], en: Agent[]): Agent[] {
  const enByUuid = new Map(en.map((a) => [a.uuid, a]))
  return th.map((agent) => {
    const fixes = TH_ABILITY_OVERRIDES[agent.uuid]
    const enAgent = enByUuid.get(agent.uuid)
    if (!fixes || !enAgent) return agent
    return {
      ...agent,
      abilities: agent.abilities.map((ab) => {
        const fix = fixes[ab.slot]
        const enAb = enAgent.abilities.find((x) => x.slot === ab.slot)
        if (!fix || !enAb || norm(enAb.description) !== norm(fix.en)) return ab
        return { ...ab, description: fix.th }
      }),
    }
  })
}
