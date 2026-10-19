import { Bone, HeroSkeleton } from '@/components/Skeleton'
import { Container } from '@/components/ui'

export default function Loading() {
  return (
    <div role="status" aria-label="loading" aria-busy="true">
      <HeroSkeleton />
      <Container className="py-8 md:py-12">
        <Bone className="mx-auto h-8 max-w-5xl" />
        <div className="skeleton-dark mx-auto mt-3 aspect-[16/9] max-w-5xl rounded-[18px] border-2 border-ink" />
      </Container>
    </div>
  )
}
