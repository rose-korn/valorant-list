'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useTransition } from 'react'
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

/** เครื่องนี้น่าจะเป็นคนไทยไหม — เบราว์เซอร์ตั้งภาษาไทย หรืออยู่โซนเวลาไทย (กติกาเดียวกับ lib/lang-redirect.ts) */
function looksThai() {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language ?? '']
  if (langs.some((l) => /^th\b/i.test(l))) return true
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Bangkok'
  } catch {
    return false
  }
}

/**
 * แถบเล็ก ๆ มุมล่าง: คนต่างประเทศที่เข้าหน้า /th (เช่นเพื่อนคนไทยแชร์ลิงก์มา) → ชวนไปอ่านหน้าเดียวกันฉบับอังกฤษ
 * โชว์เฉพาะคนที่ยังไม่เคยเลือกภาษา และเครื่องไม่ได้ดูเป็นคนไทย กดอะไรก็ได้ก็จำไว้ ไม่โผล่อีก
 * ข้อความเป็นอังกฤษล้วน เพราะคนที่เห็นอ่านไทยไม่ออก
 */
export function EnglishHint() {
  const { lang } = useI18n()
  const router = useRouter()
  const bare = useBarePath()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (lang !== 'th') return
    let saved: string | null = null
    try {
      saved = localStorage.getItem(LANG_KEY)
    } catch {
      // อ่านไม่ได้ ถือว่ายังไม่เคยเลือก
    }
    // อ่าน localStorage / navigator ได้แค่ฝั่งเบราว์เซอร์ เลยต้อง setState หลัง mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!saved && !looksThai()) setShow(true)
  }, [lang])

  if (!show || lang !== 'th') return null

  const choose = (next: Lang) => {
    saveLang(next)
    setShow(false)
    if (next === 'en') router.push(`/en${bare === '/' ? '' : bare}${window.location.search}${window.location.hash}`, { scroll: false })
  }

  return (
    <div lang="en" role="dialog" aria-label="Language" className="fixed inset-x-3 bottom-3 z-50 sm:right-auto sm:left-4 sm:max-w-sm">
      <div className="card flex items-center gap-3 p-3 text-sm shadow-lg">
        <p className="flex-1 leading-snug">This page is in Thai. Read it in English?</p>
        <button onClick={() => choose('en')} className="btn shrink-0 px-3 py-1.5 text-sm">
          English
        </button>
        <button onClick={() => choose('th')} aria-label="Stay in Thai" className="shrink-0 px-1 text-lg leading-none text-ink-soft hover:text-ink">
          ✕
        </button>
      </div>
    </div>
  )
}
