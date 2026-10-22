import { GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return <GridSkeleton count={6} cols="sm:grid-cols-2 xl:grid-cols-3" aspect="aspect-video" filters={false} />
}
