import type { PublicEvent } from '../../api/types'
import { Badge } from '../ui/Badge'
import { AlertIcon } from '../ui/icons'

export type StatusTone = 'green' | 'warning' | 'danger' | 'neutral'

export interface EventStatus {
  tone: StatusTone
  label: string
}

/**
 * The one status a stop is allowed to shout about, in priority order. Never recomputes `hasEnded`
 * from the browser clock: the server owns that.
 */
export function statusFor(event: PublicEvent, live: boolean): EventStatus | null {
  if (event.hasEnded) return { tone: 'neutral', label: 'Event ended' }
  if (event.spotsLeft <= 0) return { tone: 'danger', label: 'Sold out' }
  if (live) return { tone: 'green', label: 'Happening now' }
  const limited =
    event.capacity > 0 && event.spotsLeft <= Math.max(5, Math.ceil(event.capacity * 0.15))
  if (limited) return { tone: 'warning', label: 'Almost full' }
  return null
}

/** Status as colour + words + shape, never colour alone. Falls back to the free-entry kicker. */
export function StatusBadge({ status }: { status: EventStatus | null }) {
  if (!status) return <Badge tone="brand">Free entry</Badge>

  return (
    <Badge
      tone={status.tone}
      icon={
        status.tone === 'green' ? (
          <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden="true" />
        ) : status.tone === 'neutral' ? undefined : (
          <AlertIcon width={12} height={12} />
        )
      }
    >
      {status.label}
    </Badge>
  )
}
