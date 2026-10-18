import { CardSkeleton, HeroSkeleton } from '@/components/Skeleton'
import { Container } from '@/components/ui'

export default function Loading() {
  return (
    <div role="status" aria-label="loading" aria-busy="true">
      <HeroSkeleton />
      <Container className="grid grid-cols-2 gap-4 py-14 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} aspect="aspect-[4/3]" lines={2} />
        ))}
      </Container>
    </div>
  )
}
