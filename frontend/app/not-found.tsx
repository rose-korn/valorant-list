import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="dotted-bg flex min-h-[75svh] items-center justify-center px-4 text-center">
      <div className="card max-w-md -rotate-1 p-8">
        <p className="text-6xl">🧭</p>
        <h1 className="mt-3 text-5xl font-bold">หลงทางแล้ว</h1>
        <p className="mt-3 text-ink-soft">หาหน้านี้ไม่เจอเลย อาจถูก defuse ไปแล้วก็ได้</p>
        <p className="hand mt-2 text-lg">(error 404)</p>
        <Link href="/" className="btn mt-6">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  )
}
