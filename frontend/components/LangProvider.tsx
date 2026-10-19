'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useTransition } from 'react'
import { type Lang, LANG_KEY, dict, stripLang } from '@/lib/i18n'

const LangContext = createContext<Lang>('th')

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useI18n() {
  const lang = useContext(LangContext)
  return { lang, t: dict[lang] }
}

/** path ปัจจุบันแบบตัดภาษาออกแล้ว เช่น /th/agents → /agents */
export function useBarePath() {
  return stripLang(usePathname())
}

function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // private mode — ไม่เป็นไร
  }
}

/** ปุ่มสลับ TH / EN — ไปหน้าเดียวกันของอีกภาษา (/th/... ↔ /en/...) แต่ละภาษา build ไว้แยกกันทั้งหน้า */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n()
  const router = useRouter()
  const bare = useBarePath()
  const [pending, startTransition] = useTransition()

  const set = (next: Lang) => {
    if (next === lang) return
    saveLang(next)
    const target = `/${next}${bare === '/' ? '' : bare}${window.location.search}${window.location.hash}`
    startTransition(() => router.push(target, { scroll: false }))
  }

  return (
    <div
      role="group"
      aria-label={t.nav.switchTo}
      className={`flex overflow-hidden rounded-full border-2 border-ink bg-card text-sm font-semibold ${pending ? 'opacity-60' : ''} ${className}`}
    >
      {(['th', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 font-display transition-colors ${lang === l ? 'bg-ink text-paper' : 'hover:bg-mustard/50'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
