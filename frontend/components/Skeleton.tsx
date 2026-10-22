import { Container } from './ui'

// โครงหน้าตอนรอโหลด ใช้ใน loading.tsx ของแต่ละหน้า (server component ไม่มี state)

export function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function HeroSkeleton() {
  return (
    <section className="dotted-bg border-b-2 border-ink">
      <Container className="pt-10 pb-10 md:pt-14 md:pb-12">
        <Bone className="h-5 w-24" />
        <Bone className="mt-3 h-14 w-72 max-w-full md:h-20 md:w-[28rem]" />
        <Bone className="mt-6 h-5 w-full max-w-2xl" />
        <Bone className="mt-2 h-5 w-2/3 max-w-xl" />
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-8 w-24 !rounded-full" />
          ))}
        </div>
      </Container>
    </section>
  )
}

/** การ์ดว่าง ๆ แบบโพลารอยด์ */
export function CardSkeleton({ aspect = 'aspect-square', lines = 1 }: { aspect?: string; lines?: number }) {
  return (
    <div className="card p-2.5 !shadow-[3px_4px_0_var(--color-line)] !border-line">
      <div className={`skeleton rounded-md ${aspect}`} />
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className={`mt-2.5 h-4 ${i ? 'w-1/3' : 'w-2/3'}`} />
      ))}
    </div>
  )
}

export function GridSkeleton({
  count = 10,
  cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  aspect,
  lines,
  filters = true,
}: {
  count?: number
  cols?: string
  aspect?: string
  lines?: number
  filters?: boolean
}) {
  return (
    <div role="status" aria-label="loading" aria-busy="true">
      <HeroSkeleton />
      <Container className="py-10 md:py-14">
        {filters && (
          <div className="mb-8 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Bone key={i} className="h-10 w-24 !rounded-full" />
            ))}
          </div>
        )}
        <div className={`grid gap-5 ${cols}`}>
          {Array.from({ length: count }, (_, i) => (
            <CardSkeleton key={i} aspect={aspect} lines={lines} />
          ))}
        </div>
      </Container>
    </div>
  )
}

/** หน้ารายละเอียด: ข้อความซ้าย + จอ 3D ขวา */
export function DetailSkeleton({ screen = true }: { screen?: boolean }) {
  return (
    <div role="status" aria-label="loading" aria-busy="true">
      <section className="dotted-bg border-b-2 border-ink">
        <Container className="grid gap-10 py-8 md:py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <Bone className="h-5 w-32" />
            <div className="mt-5 flex gap-2">
              <Bone className="h-7 w-24 !rounded-full" />
              <Bone className="h-7 w-32 !rounded-full" />
            </div>
            <Bone className="mt-4 h-16 w-64 max-w-full" />
            <Bone className="mt-5 h-5 w-full max-w-xl" />
            <Bone className="mt-2 h-5 w-4/5 max-w-lg" />
            <div className="mt-7 flex gap-3">
              <Bone className="h-12 w-32 !rounded-xl" />
              <Bone className="h-12 w-36 !rounded-xl" />
            </div>
          </div>
          {screen && <div className="skeleton-dark order-1 h-[52svh] min-h-[320px] rounded-[18px] border-2 border-ink lg:order-2 lg:h-[64svh]" />}
        </Container>
      </section>
      <Container className="py-12">
        <Bone className="h-9 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Bone key={i} className="h-20 !rounded-[14px]" />
          ))}
        </div>
      </Container>
    </div>
  )
}
