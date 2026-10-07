import { Link } from 'react-router-dom'
import type { PublicEvent } from '../../api/types'
import { formatAccraShort, isHappeningNow } from '../../lib/dates'
import { Badge } from '../ui/Badge'
import { MapPinIcon } from '../ui/icons'
import { EventBanner } from './EventBanner'
import { SpotsBadge } from './SpotsBadge'

export function EventCard({ event }: { event: PublicEvent }) {
  const live = isHappeningNow(event.startsAt, event.endsAt)

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border bg-surface-raised shadow-card transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <EventBanner bannerUrl={event.bannerUrl} title={event.title} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {live && (
            <Badge tone="green" icon={<span className="h-1.5 w-1.5 rounded-full bg-green" />}>
              Happening now
            </Badge>
          )}
          <SpotsBadge spotsLeft={event.spotsLeft} />
        </div>
        <h3 className="font-heading text-lg font-black leading-snug text-heading transition-colors group-hover:text-brand">
          {event.title}
        </h3>
        <p className="text-sm text-body">{formatAccraShort(event.startsAt)}</p>
        <p className="mt-auto flex items-center gap-1.5 text-sm text-soft">
          <MapPinIcon width={16} height={16} className="shrink-0" />
          {event.venue}
        </p>
      </div>
    </Link>
  )
}
