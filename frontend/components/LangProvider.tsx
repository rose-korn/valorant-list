'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useTransition } from 'react'
import { type Lang, LANG_COOKIE, dict } from '@/lib/i18n'

const LangContext = createContext<Lang>('th')

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useI18n() {
  const lang = useContext(LangContext)
  return { lang, t: dict[lang] }
}

function saveLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
}

/** ปุ่มสลับ TH / EN — เก็บค่าใน cookie แล้วให้ server render ใหม่ (ข้อมูลจาก API ก็เปลี่ยนภาษาตาม) */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const set = (next: Lang) => {
    if (next === lang) return
    saveLang(next)
    startTransition(() => router.refresh())
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
