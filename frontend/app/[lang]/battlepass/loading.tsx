import { GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return <GridSkeleton count={6} cols="sm:grid-cols-2 lg:grid-cols-3" aspect="aspect-video" lines={2} filters={false} />
}
