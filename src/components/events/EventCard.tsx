import { useState } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl } from '../../api/client'
import type { PublicEvent } from '../../api/types'
import { formatAccraShort, isHappeningNow } from '../../lib/dates'
import { Badge } from '../ui/Badge'
import { MapPinIcon } from '../ui/icons'
import { SpotsBadge } from './SpotsBadge'

type Variant = 'compact' | 'focus'

export function EventCard({
  event,
  variant = 'compact',
}: {
  event: PublicEvent
  variant?: Variant
}) {
  const live = isHappeningNow(event.startsAt, event.endsAt)
  const focus = variant === 'focus'
  const registerable = !event.hasEnded && event.spotsLeft > 0
  const [failed, setFailed] = useState(false)
  const showImage = event.bannerUrl && !failed

  return (
    <div className="group relative aspect-[3/4] h-full overflow-hidden rounded-3xl border bg-surface-inset shadow-card transition-transform duration-200 hover:-translate-y-1">
      <Link
        to={`/events/${event.id}`}
        className="absolute inset-0 block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-heading"
      >
        {showImage ? (
          <img
            src={absoluteUrl(event.bannerUrl!)}
            alt={`Banner for ${event.title}`}
            onError={() => setFailed(true)}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-end bg-gradient-to-br from-black via-neutral-800 to-neutral-600 p-4"
            aria-hidden="true"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-white/90">
              <MapPinIcon width={16} height={16} />
              No photo for this event
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pt-16 pb-4 transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
          <h3
            className={`font-heading leading-snug font-black text-white ${
              focus ? 'text-xl sm:text-2xl' : 'text-lg'
            }`}
          >
            {event.title}
          </h3>
          <p
            className={`mt-1 text-white/85 ${
              focus ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            }`}
          >
            {formatAccraShort(event.startsAt)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/85 sm:text-sm">
            <MapPinIcon width={14} height={14} className="shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>
      </Link>

      <div className="pointer-events-none absolute top-4 left-4 z-30 flex flex-wrap gap-2">
        {live && (
          <Badge
            tone="brand-tint"
            icon={<span className="h-1.5 w-1.5 rounded-full bg-brand" />}
          >
            Happening now
          </Badge>
        )}
        <SpotsBadge spotsLeft={event.spotsLeft} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-5 pt-2 pb-14 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        {registerable && (
          <Link
            to={`/events/${event.id}/register`}
            className={`mb-4 hidden rounded-full bg-black font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] pointer-events-auto group-hover:inline-flex group-focus-within:inline-flex hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              focus ? 'px-7 py-3 text-base' : 'px-6 py-2.5 text-sm'
            }`}
          >
            Register free
          </Link>
        )}
        <p
          className={`text-white ${
            focus ? 'line-clamp-4 text-base sm:text-lg' : 'line-clamp-3 text-sm'
          }`}
        >
          {event.description}
        </p>
      </div>
    </div>
  )
}
