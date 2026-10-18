import Link from 'next/link'
import { getVersion } from '@/lib/valorant'
import { NAV_LINKS } from './brand'

export default async function Footer() {
  const version = await getVersion()

  return (
    <footer className="mt-10 border-t-2 border-ink bg-night text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">
            valo<span className="text-red">list</span>
          </p>
          <p className="mt-3 max-w-sm text-paper/75">
            เว็บเล็ก ๆ ที่ทำไว้ดูข้อมูล Valorant กับเพื่อน ๆ ในคอมมู ถ้าชอบก็แชร์ต่อได้เลย 🙌
          </p>
          <p className="hand mt-4 -rotate-2 text-lg !text-mustard">gg wp ทุกคน!</p>
        </div>

        <div>
          <p className="mb-3 font-display font-semibold text-paper/60">ไปที่</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/85 underline-offset-4 hover:text-red hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display font-semibold text-paper/60">เวอร์ชันเกมตอนนี้</p>
          {version ? (
            <div className="inline-block rounded-xl border-2 border-paper/20 px-4 py-3">
              <p className="font-display text-2xl font-bold text-mustard">{version.version.split('.').slice(0, 2).join('.')}</p>
              <p className="text-sm text-paper/60">
                อัปเดตเมื่อ {new Date(version.buildDate).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
              </p>
            </div>
          ) : (
            <p className="text-paper/60">—</p>
          )}
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm text-paper/55 sm:flex-row sm:justify-between sm:px-6">
          <span>แฟนไซต์ ไม่ได้เกี่ยวข้องกับ Riot Games</span>
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer" className="hover:text-red">
            ข้อมูลจาก valorant-api.com
          </a>
        </div>
      </div>
    </footer>
  )
}
