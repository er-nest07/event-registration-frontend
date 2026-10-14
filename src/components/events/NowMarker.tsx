import type { PublicEvent } from '../../api/types'
import { accraTodayLabel, isHappeningNow, untilInWords } from '../../lib/dates'
import { useMinuteTick } from '../../lib/useMinuteTick'
import { RAIL_GRID } from './rail'

/**
 * Where "now" sits on the rail. It borrows the brand-to-cyan gradient the rest of the site already
 * uses for "coming up", and it is the only thing on the page that moves on its own.
 */
export function NowMarker({ next }: { next?: PublicEvent }) {
  useMinuteTick()

  const live = next ? isHappeningNow(next.startsAt, next.endsAt) : false

  return (
    <div className={`${RAIL_GRID} items-start pt-1 pb-6`}>
      <div className="flex justify-center pt-1.5">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-full bg-gradient-to-r from-brand to-cyan ring-4 ring-surface"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black tracking-[0.2em] text-brand uppercase">Today</p>
        <p className="mt-1 text-sm text-body">{accraTodayLabel()}</p>
        {next ? (
          <p className="mt-0.5 truncate text-sm text-soft">
            {live ? 'Happening now · ' : `Next · ${untilInWords(next.startsAt)} · `}
            <span className="font-semibold text-heading">{next.title}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-soft">Nothing on the calendar yet.</p>
        )}
      </div>
    </div>
  )
}
