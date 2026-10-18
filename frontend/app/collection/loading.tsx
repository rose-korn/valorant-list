import { GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return <GridSkeleton count={4} cols="md:grid-cols-2" aspect="aspect-[3/1]" lines={2} filters={false} />
}
