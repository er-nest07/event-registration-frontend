import { useState } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl } from '../../api/client'
import type { PublicEvent } from '../../api/types'
import { MapPinIcon } from '../ui/icons'

export function EventPoster({ event }: { event: PublicEvent }) {
  const [failed, setFailed] = useState(false)
  const showImage = event.bannerUrl && !failed

  return (
    <Link
      to={`/events/${event.id}`}
      aria-label={`View ${event.title}`}
      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border bg-surface-inset shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
    >
      {showImage ? (
        <img
          src={absoluteUrl(event.bannerUrl!)}
          alt=""
          onError={() => setFailed(true)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        View event →
      </span>
    </Link>
  )
}