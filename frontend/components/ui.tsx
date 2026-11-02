import Link from '@/components/Link'
import { Arrow, Crosshair } from './brand'

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
}

/** หัวข้อ section: เส้นคู่แบบหัวคอลัมน์นิตยสาร + ชื่อหมวด + โน้ตสั้น ๆ */
export function SectionHeading({
  title,
  note,
  href,
  linkLabel,
  dark = false,
}: {
  title: string
  note?: string
  href?: string
  linkLabel?: string
  dark?: boolean
}) {
  return (
    <div className="mb-8">
      <div className={`rule-double mb-4 ${dark ? '[--color-blue:var(--color-sky)]' : ''}`} aria-hidden />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={`font-display text-3xl font-extrabold sm:text-4xl ${dark ? 'text-paper' : 'text-ink'}`}>{title}</h2>
          {note && <p className={`mt-1 font-mono text-sm ${dark ? 'text-sky' : 'text-blue'}`}>— {note}</p>}
        </div>
        {href && (
          <Link href={href} className={`btn ${dark ? '' : 'btn-paper'} !py-2 text-sm`}>
            {linkLabel} →
          </Link>
        )}
      </div>
    </div>
  )
}

/**
 * หัวเพจแบบหน้าเปิดนิตยสาร: เลขหมวดตัวพิมพ์ดีด ชื่อใหญ่พิมพ์เหลื่อม เม็ดสกรีนด้านหลัง
 * edition="fair" = ฉบับพิเศษงานวัด (ใช้คู่กับ wrapper .fair) — ซันเบิร์สต์ + ตัวอักษรแบบป้ายงานวัด
 */
export function PageHero({
  title,
  en,
  description,
  note,
  facts,
  edition,
  children,
}: {
  title: string
  en?: string
  description?: string
  note?: string
  facts?: { label: string; value: string | number }[]
  edition?: 'fair'
  children?: React.ReactNode
}) {
  const fair = edition === 'fair'
  return (
    <section className="relative overflow-hidden border-b-[1.5px] border-ink">
      {fair ? (
        <div aria-hidden className="sunburst pointer-events-none absolute inset-x-0 bottom-0 h-[160%]" />
      ) : (
        <div aria-hidden className="halftone pointer-events-none absolute top-6 -right-28 h-[24rem] w-[24rem] md:right-6" />
      )}
      <Container className="relative pt-8 pb-10 md:pt-10 md:pb-12">
        <div className={`flex items-center justify-between gap-3 border-b-[1.5px] pb-1.5 font-mono text-xs font-bold tracking-[0.18em] uppercase ${fair ? 'border-ink text-ink' : 'border-blue text-blue'}`}>
          <span>{fair ? '★ Fan-made fair ★' : 'Valolist · Fan-made'}</span>
          {en && <span>{en}</span>}
        </div>
        <div className={`relative mt-6 ${fair ? 'text-center' : ''}`}>
          {fair && (
            <span className="ticket mb-4 inline-block px-5 py-0.5 font-mono text-xs font-bold tracking-[0.25em] uppercase">Admit one</span>
          )}
          <h1
            className={`animate-fade-up text-5xl sm:text-6xl md:text-7xl ${fair ? 'fair-title' : 'riso font-display font-extrabold'}`}
          >
            {title}
          </h1>
        </div>
        {description && <p className={`mt-5 max-w-2xl text-lg text-ink-soft ${fair ? 'mx-auto text-center' : ''}`}>{description}</p>}
        {(facts?.length || note) && (
          <div className={`mt-6 flex flex-wrap items-center gap-2 ${fair ? 'justify-center' : ''}`}>
            {facts?.map((f) => (
              <span key={f.label} className="chip">
                <b className="font-display text-blue">{f.value}</b> {f.label}
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

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Crosshair className="h-12 w-12 text-ink-soft" />
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

/** ป้าย "ใหม่" สีแดงเอียง ๆ ใช้กับเอเจนท์/สกิน/บันเดิล/ของสะสมที่เพิ่งออก */
export function NewBadge({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span
      className={`-rotate-6 border-[1.5px] border-ink bg-red px-2 py-0.5 font-mono text-xs font-bold tracking-[0.15em] uppercase text-white shadow-[2px_2px_0_var(--color-blue)] ${className}`}
    >
      {label}
    </span>
  )
}
