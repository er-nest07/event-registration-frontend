import { Link } from 'react-router-dom'
import type { PublicEvent } from '../../api/types'
import { formatAccraShort, isHappeningNow } from '../../lib/dates'
import { MapPinIcon } from '../ui/icons'
import { CapacityMeter } from './CapacityMeter'
import { StatusBadge, statusFor } from './StatusBadge'

/**
 * The facts of an event, shared by the rail and by search results so one event reads the same in
 * both modes. The description stays on the detail page.
 */
export function EventBody({ event }: { event: PublicEvent }) {
  const live = isHappeningNow(event.startsAt, event.endsAt)
  const registerable = !event.hasEnded && event.spotsLeft > 0
  const status = statusFor(event, live)
  // Terminal states (+ the live one) get a badge and stay meter-free; the "plenty of room" /
  // "almost full" cases let the capacity ribbon carry the single signal.
  const showStatus = !!status && (status.tone === 'neutral' || status.tone === 'danger' || status.tone === 'green')

  return (
    <div className="min-w-0 flex-1">
      {showStatus && <StatusBadge status={status} />}

      <h3 className="mt-3 font-display text-xl leading-tight font-black tracking-tight text-heading sm:text-2xl">
        <Link
          to={`/events/${event.id}`}
          className="rounded transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {event.title}
        </Link>
      </h3>

      <p className="mt-2 font-mono text-xs font-semibold text-body">
        {formatAccraShort(event.startsAt)}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
        <MapPinIcon width={14} height={14} className="shrink-0" />
        <span className="truncate">{event.venue}</span>
      </p>

      {/* One signal per stop: when a status badge isn't speaking (plenty of room /
          "almost full"), the capacity ribbon carries it. */}
      {!showStatus && event.spotsLeft > 0 && (
        <div className="mt-3.5">
          <CapacityMeter spotsLeft={event.spotsLeft} capacity={event.capacity} />
        </div>
      )}

      <Link
        to={registerable ? `/events/${event.id}/register` : `/events/${event.id}`}
        className={`mt-3.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading ${
          registerable
            ? 'bg-black text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.4)] hover:bg-neutral-800'
            : 'text-brand hover:bg-brand-soft'
        }`}
      >
        {registerable ? 'Register free →' : 'See details →'}
      </Link>
    </div>
  )
}
