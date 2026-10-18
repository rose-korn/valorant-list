import Link from 'next/link'
import { Arrow, Scribble, Star } from './brand'

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
}

/** หัวข้อ section: ภาษาคน + โน้ตลายมือเล็ก ๆ */
export function SectionHeading({
  title,
  note,
  href,
  linkLabel = 'ดูทั้งหมด',
  dark = false,
}: {
  title: string
  note?: string
  href?: string
  linkLabel?: string
  dark?: boolean
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className={`font-display text-3xl font-bold sm:text-4xl ${dark ? 'text-paper' : 'text-ink'}`}>{title}</h2>
        {note && <p className={`hand mt-1 -rotate-1 text-lg ${dark ? '!text-mustard' : ''}`}>{note}</p>}
      </div>
      {href && (
        <Link href={href} className={`btn ${dark ? '' : 'btn-paper'} !py-2 text-sm`}>
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

/** หัวเพจแบบสมุด: ชื่อใหญ่ ขีดเส้นใต้มือวาด โน้ตข้าง ๆ */
export function PageHero({
  title,
  en,
  description,
  note,
  facts,
  children,
}: {
  title: string
  en?: string
  description?: string
  note?: string
  facts?: { label: string; value: string | number }[]
  children?: React.ReactNode
}) {
  return (
    <section className="dotted-bg border-b-2 border-ink">
      <Container className="pt-10 pb-10 md:pt-14 md:pb-12">
        {en && <p className="font-display font-semibold text-ink-soft">{en}</p>}
        <div className="relative inline-block">
          <h1 className="animate-fade-up font-display text-5xl font-bold sm:text-6xl md:text-7xl">{title}</h1>
          <Scribble className="absolute -bottom-2 left-0 h-3 w-full" />
          <Star className="absolute -top-3 -right-8 h-7 w-7 animate-wiggle text-mustard" />
        </div>
        {description && <p className="mt-6 max-w-2xl text-lg text-ink-soft">{description}</p>}
        {(facts?.length || note) && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {facts?.map((f) => (
              <span key={f.label} className="chip">
                <b className="font-display">{f.value}</b> {f.label}
              </span>
            ))}
            {note && (
              <span className="hand ml-2 flex items-center gap-1 text-lg">
                <Arrow className="h-6 w-8 -scale-x-100 rotate-12" /> {note}
              </span>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}

export function EmptyState({ text = 'ดึงข้อมูลจาก API ไม่ได้ตอนนี้ ลองรีเฟรชใหม่อีกทีนะ' }: { text?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
      <span className="text-4xl">😵‍💫</span>
      <p className="text-ink-soft">{text}</p>
    </div>
  )
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 font-display font-semibold text-ink-soft hover:text-ink">
      <span className="transition-transform group-hover:-translate-x-1">←</span>
      {label}
    </Link>
  )
}
