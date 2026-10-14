interface Props {
  spotsLeft: number
  capacity: number
}

/**
 * How full an event is, as a bar plus a sentence. The bar is decoration: the sentence carries the
 * meaning, so colour is never the only signal.
 */
export function CapacityMeter({ spotsLeft, capacity }: Props) {
  if (capacity <= 0) return null

  const taken = Math.min(capacity, Math.max(0, capacity - spotsLeft))
  const percent = Math.round((taken / capacity) * 100)
  const limited = spotsLeft > 0 && spotsLeft <= Math.max(5, Math.ceil(capacity * 0.15))

  const label =
    spotsLeft <= 0
      ? 'Sold out'
      : limited
        ? `Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`
        : `${spotsLeft} of ${capacity} spots left`

  const colour =
    spotsLeft <= 0 ? 'bg-danger' : limited ? 'bg-warning' : 'bg-brand'
  const textColour =
    spotsLeft <= 0 ? 'text-danger' : limited ? 'text-warning' : 'text-body'

  return (
    <p className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-surface-inset"
      >
        <span className={`block h-full rounded-full ${colour}`} style={{ width: `${percent}%` }} />
      </span>
      <span className={`text-xs font-bold ${textColour}`}>{label}</span>
    </p>
  )
}
