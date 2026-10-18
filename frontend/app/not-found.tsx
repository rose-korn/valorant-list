import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-4 text-center">
      <div className="val-grid-bg absolute inset-0 opacity-60" />
      <div aria-hidden className="val-outline-text pointer-events-none absolute font-display text-[45vw] leading-none select-none">
        404
      </div>
      <div className="relative">
        <p className="text-[11px] tracking-[0.35em] text-val-red uppercase">{'// Spike not found'}</p>
        <h1 className="mt-3 font-display text-7xl text-val-cream uppercase md:text-9xl">Lost Signal</h1>
        <p className="mt-4 font-thai text-val-cream/60">ไม่พบหน้าที่คุณกำลังหา — อาจถูก defuse ไปแล้ว</p>
        <Link href="/" className="val-btn mt-8">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  )
}
