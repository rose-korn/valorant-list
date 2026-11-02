// ดึงคำอธิบายสกิลทุกตัวทั้งไทยและอังกฤษจาก valorant-api มาวางคู่กัน ไว้ตรวจคำแปล
// แล้วบอกว่าคำแปลที่เขียนเองใน lib/th-abilities.ts ตัวไหนตกรุ่น (Riot แก้สกิลไปแล้ว)
//
//   node scripts/dump-abilities.mjs            → พิมพ์ markdown ออกทาง stdout
//   node scripts/dump-abilities.mjs --json     → พิมพ์ JSON (ไว้ป้อนเครื่องมืออื่น)
//
// ต้องใช้ Node 22.18+ (อ่านไฟล์ .ts ได้เลยโดยไม่ต้อง build)

import { TH_ABILITY_OVERRIDES } from '../lib/th-abilities.ts'

const API = process.env.VALORANT_API_BASE ?? 'https://valorant-api.com/v1'
const get = async (lang) => {
  const res = await fetch(`${API}/agents?isPlayableCharacter=true&language=${lang}`)
  if (!res.ok) throw new Error(`${lang}: HTTP ${res.status}`)
  return (await res.json()).data
}
const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

const [th, en] = await Promise.all([get('th-TH'), get('en-US')])
const enBy = new Map(en.map((a) => [a.uuid, a]))
const rows = []
for (const a of [...th].sort((x, y) => x.displayName.localeCompare(y.displayName))) {
  for (const ab of a.abilities) {
    const e = enBy.get(a.uuid)?.abilities.find((x) => x.slot === ab.slot)
    const fix = TH_ABILITY_OVERRIDES[a.uuid]?.[ab.slot]
    const status = !fix ? 'api' : norm(fix.en) === norm(e?.description) ? 'override' : 'STALE'
    rows.push({ agent: a.displayName, uuid: a.uuid, slot: ab.slot, name: ab.displayName, enName: e?.displayName, th: ab.description, en: e?.description, status })
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  let cur = ''
  for (const r of rows) {
    if (r.agent !== cur) console.log(`\n## ${(cur = r.agent)} (${r.uuid})\n`)
    console.log(`### ${r.slot} · ${r.name}${r.enName && r.enName !== r.name ? ` / ${r.enName}` : ''} [${r.status}]\n`)
    console.log(`- EN: ${norm(r.en)}\n- TH: ${norm(r.th)}\n`)
  }
  const stale = rows.filter((r) => r.status === 'STALE')
  if (stale.length) console.error(`\n${stale.length} override(s) are STALE: ${stale.map((r) => `${r.agent} ${r.slot}`).join(', ')}`)
}
