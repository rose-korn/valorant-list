import Link from 'next/link'
import { getVersion } from '@/lib/api'
import { dateLocale } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'
import { FUN_LINKS, NAV_LINKS } from './brand'
import { FxToggle } from './FunLayer'

export default async function Footer() {
  const [version, { lang, t }] = await Promise.all([getVersion(), getI18n()])

  return (
    <footer className="mt-10 border-t-2 border-ink bg-night text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">
            valo<span className="text-red">list</span>
          </p>
          <p className="mt-3 max-w-sm text-paper/75">{t.footer.about}</p>
          <p className="hand mt-4 -rotate-2 text-lg !text-mustard">{t.footer.gg}</p>
          <div className="mt-4">
            <FxToggle />
          </div>
        </div>

        <div>
          <p className="mb-3 font-display font-semibold text-paper/60">{t.footer.goTo}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[...NAV_LINKS, ...FUN_LINKS].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/85 underline-offset-4 hover:text-red hover:underline">
                  {t.nav[l.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display font-semibold text-paper/60">{t.footer.version}</p>
          {version ? (
            <div className="inline-block rounded-xl border-2 border-paper/20 px-4 py-3">
              <p className="font-display text-2xl font-bold text-mustard">{version.version.split('.').slice(0, 2).join('.')}</p>
              <p className="text-sm text-paper/60">
                {t.footer.updated} {new Date(version.buildDate).toLocaleDateString(dateLocale(lang), { dateStyle: 'medium' })}
              </p>
            </div>
          ) : (
            <p className="text-paper/60">—</p>
          )}
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-paper/55 sm:px-6">
          {/* ข้อความที่นโยบาย fan content ของ Riot กำหนดให้ใส่ */}
          <p>{t.footer.legal}</p>
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer" className="hover:text-red">
            {t.footer.data}
          </a>
        </div>
      </div>
    </footer>
  )
}
