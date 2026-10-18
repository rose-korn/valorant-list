import Link from 'next/link'

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] tracking-[0.35em] text-val-red uppercase ${className}`}>
      <span className="h-px w-8 bg-val-red" />
      {children}
    </div>
  )
}

export function SectionHeading({
  index,
  title,
  th,
  href,
  linkLabel = 'ดูทั้งหมด',
  light = false,
}: {
  index?: string
  title: string
  th?: string
  href?: string
  linkLabel?: string
  light?: boolean
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <div>
        {index && <Eyebrow className="mb-3">{index}</Eyebrow>}
        <h2
          className={`font-display text-5xl leading-[0.9] tracking-tight uppercase sm:text-6xl lg:text-7xl ${
            light ? 'text-val-ink' : 'text-val-cream'
          }`}
        >
          {title}
        </h2>
        {th && <p className={`mt-2 font-thai text-sm font-light ${light ? 'text-val-ink/60' : 'text-val-cream/50'}`}>{th}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`group flex items-center gap-3 font-display text-sm tracking-[0.2em] uppercase ${
            light ? 'text-val-ink' : 'text-val-cream'
          }`}
        >
          <span className="font-thai tracking-normal">{linkLabel}</span>
          <span className="flex h-10 w-10 items-center justify-center border border-current transition-colors group-hover:border-val-red group-hover:bg-val-red group-hover:text-white">
            →
          </span>
        </Link>
      )}
    </div>
  )
}

/** หัวหน้าเพจแบบใหญ่ ใช้ทุกหน้า list */
export function PageHero({
  eyebrow,
  title,
  th,
  description,
  image,
  stats,
  children,
}: {
  eyebrow: string
  title: string
  th?: string
  description?: string
  image?: string | null
  stats?: { label: string; value: string | number }[]
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="val-grid-bg absolute inset-0 opacity-70" />
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-val-ink via-val-ink/80 to-val-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-val-ink to-transparent" />
        </div>
      )}
      <div
        aria-hidden
        className="val-outline-text pointer-events-none absolute -right-4 bottom-0 font-display text-[28vw] leading-[0.75] uppercase select-none md:text-[16vw]"
      >
        {title}
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 pt-14 pb-12 sm:px-6 md:pt-20 md:pb-16 lg:px-10">
        <Eyebrow className="animate-fade-up">{eyebrow}</Eyebrow>
        <h1 className="mt-4 animate-fade-up font-display text-6xl leading-[0.85] tracking-tight text-val-cream uppercase [animation-delay:80ms] sm:text-7xl md:text-8xl lg:text-9xl">
          {title}
        </h1>
        {th && <p className="mt-3 animate-fade-up font-thai text-lg text-val-red [animation-delay:140ms]">{th}</p>}
        {description && (
          <p className="mt-4 max-w-xl animate-fade-up font-thai text-sm leading-relaxed font-light text-val-cream/60 [animation-delay:200ms] md:text-base">
            {description}
          </p>
        )}
        {stats && stats.length > 0 && (
          <dl className="mt-8 flex animate-fade-up flex-wrap gap-x-10 gap-y-4 [animation-delay:260ms]">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-val-red pl-4">
                <dd className="font-display text-3xl text-val-cream md:text-4xl">{s.value}</dd>
                <dt className="text-[10px] tracking-[0.3em] text-val-cream/40 uppercase">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
        {children}
      </div>
    </section>
  )
}

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>
}

export function EmptyState({ text = 'ไม่สามารถโหลดข้อมูลจาก API ได้ในขณะนี้' }: { text?: string }) {
  return (
    <div className="val-panel flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="font-display text-5xl text-val-red">!</span>
      <p className="font-thai text-val-cream/60">{text}</p>
    </div>
  )
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-xs tracking-[0.25em] text-val-cream/60 uppercase transition-colors hover:text-val-red"
    >
      <span className="transition-transform group-hover:-translate-x-1">←</span>
      {label}
    </Link>
  )
}
