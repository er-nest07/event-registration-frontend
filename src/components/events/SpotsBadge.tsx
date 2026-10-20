import { AlertIcon, CheckIcon } from '../ui/icons'

export function SpotsBadge({ spotsLeft }: { spotsLeft: number }) {
  if (spotsLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
        <AlertIcon width={14} height={14} />
        Sold out
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
      <CheckIcon width={14} height={14} />
      {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
    </span>
  )
}
