import { GridSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return <GridSkeleton count={16} cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" aspect="aspect-[1/1.6]" lines={0} filters={false} />
}
