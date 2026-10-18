import { useState } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl } from '../../api/client'
import type { PublicEvent } from '../../api/types'
import { formatAccraShort } from '../../lib/dates'

/**
 * A "door" into a month chapter: full-bleed poster, scrim, and the chapter's headliner.
 * Falls back to the brand ramp when the event has no banner, so a missing image never reads as
 * a broken layout. It's an explicit overture above the rail, not a replacement for the stops.
 */
export function MonthDoor({
  chapterHeading,
  event,
}: {
  chapterHeading: string
  event: PublicEvent
}) {
  const [failed, setFailed] = useState(false)
  const showImage = event.bannerUrl && !failed

  return (
    <div className="group relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-[16/9]">
      {showImage ? (
        <img
          src={absoluteUrl(event.bannerUrl!)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="relative h-full w-full overflow-hidden bg-gradient-to-br from-black via-neutral-800 to-neutral-600"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
            }}
          />
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-1 px-4 py-4 sm:px-6 sm:py-5">
        <p className="label-mono text-[11px] text-white/75">{chapterHeading}</p>
        <Link
          to={`/events/${event.id}`}
          className="text-balance font-display text-3xl leading-none font-black tracking-tight text-white transition-colors hover:text-white sm:text-4xl"
        >
          {event.title}
        </Link>
        <p className="text-sm font-semibold text-white/85 sm:text-[15px]">
          {formatAccraShort(event.startsAt)} · {event.venue}
        </p>
      </div>
    </div>
  )
}
