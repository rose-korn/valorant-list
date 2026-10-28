// รันต่อจาก `next build` (postbuild): เขียน out/build-version.json บอกว่าเว็บที่ build นี้ใช้ข้อมูลเกมเวอร์ชันไหน
// workflow rebuild.yml เอาไฟล์นี้ไปเทียบกับ valorant-api ว่ามี patch ใหม่หรือยัง ถ้ายังก็ไม่ต้อง build
import { writeFile } from 'node:fs/promises'

const API_BASE = process.env.VALORANT_API_BASE ?? 'https://valorant-api.com/v1'
const res = await fetch(`${API_BASE}/version`)
if (!res.ok) throw new Error(`valorant-api /version failed: HTTP ${res.status}`)
const { data } = await res.json()

await writeFile(
  new URL('../out/build-version.json', import.meta.url),
  JSON.stringify({ version: data.version, buildDate: data.buildDate, builtAt: new Date().toISOString() }, null, 2) + '\n',
)
console.log(`build-version.json: ${data.version}`)
