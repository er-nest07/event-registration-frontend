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

  return (
    <div className="min-w-0 flex-1">
      <StatusBadge status={statusFor(event, live)} />

      <h3 className="mt-3 font-display text-xl leading-tight font-black tracking-tight text-heading sm:text-2xl">
        <Link
          to={`/events/${event.id}`}
          className="rounded transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {event.title}
        </Link>
      </h3>

      <p className="mt-2 text-sm font-semibold text-body">{formatAccraShort(event.startsAt)}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
        <MapPinIcon width={14} height={14} className="shrink-0" />
        <span className="truncate">{event.venue}</span>
      </p>

      {/* The badge already says "Sold out"; a meter repeating it would be noise. */}
      {event.spotsLeft > 0 && (
        <div className="mt-3.5">
          <CapacityMeter spotsLeft={event.spotsLeft} capacity={event.capacity} />
        </div>
      )}

      <Link
        to={registerable ? `/events/${event.id}/register` : `/events/${event.id}`}
        className="mt-3.5 inline-flex items-center gap-1.5 rounded font-bold text-brand transition-colors hover:text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {registerable ? 'Register free →' : 'See details →'}
      </Link>
    </div>
  )
}
