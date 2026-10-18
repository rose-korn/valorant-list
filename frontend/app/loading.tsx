export default function Loading() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center gap-5">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-spin border-2 border-val-red border-t-transparent" />
        <span className="absolute inset-3 rotate-45 animate-pulse bg-val-red/70" />
      </div>
      <p className="font-display text-sm tracking-[0.4em] text-val-cream/50 uppercase">Loading</p>
    </div>
  )
}
