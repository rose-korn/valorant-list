export default function Loading() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center gap-3">
      <span className="flex h-14 w-14 animate-wiggle items-center justify-center rounded-xl border-2 border-ink bg-red font-display text-2xl font-bold text-white shadow-[3px_4px_0_var(--color-ink)]">
        V
      </span>
      <p className="hand text-xl">รอแป๊บนะ กำลังโหลด...</p>
    </div>
  )
}
