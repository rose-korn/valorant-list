import Link from 'next/link'
import type { ResolvedReward } from '@/lib/rewards'

/** การ์ดรางวัลใน Battle Pass / สัญญาเอเจนท์ — ใช้ได้ทั้ง server และ client */
export default function RewardCard({
  reward,
  label,
  typeLabel,
  free = false,
  freeLabel,
  highlightLabel,
  fallbackName,
}: {
  reward: ResolvedReward
  /** เช่น "ระดับ 12" */
  label?: string
  typeLabel: string
  free?: boolean
  freeLabel?: string
  highlightLabel?: string
  fallbackName: string
}) {
  const name = reward.name || (reward.amount > 1 ? `${reward.amount}` : fallbackName)
  const body = (
    <>
      <span
        className={`relative flex items-center justify-center overflow-hidden rounded-md ${
          reward.type === 'Title' ? 'h-20 bg-paper-2 px-2' : reward.type === 'PlayerCard' ? 'skeleton-dark h-20' : reward.tall ? 'skeleton-dark aspect-[3/4]' : 'skeleton-dark h-20 px-2'
        }`}
      >
        {reward.type === 'Title' ? (
          <span className="line-clamp-2 text-center font-display text-sm font-bold uppercase">{name}</span>
        ) : reward.image ? (
          <img
            src={reward.image}
            alt={name}
            loading="lazy"
            className={reward.tall || reward.type === 'PlayerCard' ? 'h-full w-full object-cover' : 'max-h-[80%] max-w-full object-contain'}
          />
        ) : (
          <span className="text-2xl">🎁</span>
        )}
        {reward.type === 'Currency' && reward.amount > 1 && (
          <span className="absolute right-1 bottom-1 rounded-md bg-ink px-1.5 font-display text-xs font-bold text-paper">×{reward.amount}</span>
        )}
      </span>
      <span className="mt-1.5 flex flex-wrap items-center gap-1 px-0.5">
        {label && <span className="font-display text-xs font-bold text-red-ink">{label}</span>}
        <span className="text-[11px] text-ink-soft">{typeLabel}</span>
      </span>
      <span className="line-clamp-2 px-0.5 text-sm leading-snug font-medium">{reward.type === 'Title' ? `“${name}”` : name}</span>
      {(free || reward.isHighlighted) && (
        <span className="absolute -top-2 -right-2 flex gap-1">
          {free && <span className="rounded-full border-2 border-ink bg-teal px-1.5 text-[10px] font-bold text-ink">{freeLabel}</span>}
          {reward.isHighlighted && <span className="rounded-full border-2 border-ink bg-mustard px-1.5 text-[10px] font-bold text-ink">★ {highlightLabel}</span>}
        </span>
      )}
    </>
  )

  const cls = `card relative flex h-full flex-col p-2 ${reward.isHighlighted ? '!bg-[#fff4dc]' : ''}`
  return reward.href ? (
    <Link href={reward.href} className={`${cls} card-hover`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
