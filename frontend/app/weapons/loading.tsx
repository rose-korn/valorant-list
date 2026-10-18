import { GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return <GridSkeleton count={8} cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aspect="aspect-[2/1]" lines={3} />
}
