import type { PublicEvent } from '../../api/types'
import { accraDateParts, accraShortMonth } from '../../lib/dates'
import { EventBody } from './EventBody'
import { EventPoster } from './EventPoster'
import { RAIL_GRID } from './rail'

/**
 * One stop on the rail. The date sits on the rule; the poster and the facts hang off it. Deliberately
 * thin — the story is the order, and the description belongs to the detail page.
 */
export function RailEvent({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const { day } = accraDateParts(event.startsAt)
  const reversed = index % 2 === 1

  return (
    <li
      className={`${RAIL_GRID} items-start py-6 animate-rise-in md:py-7`}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="flex flex-col items-center bg-surface py-1">
        <span className="font-display text-lg leading-none font-black text-heading tabular-nums md:text-2xl">
          {Number(day)}
        </span>
        <span className="label-mono mt-1 text-[9px] text-body">
          {accraShortMonth(event.startsAt)}
        </span>
      </div>

      <div
        className={`flex min-w-0 items-start gap-4 md:gap-6 ${
          reversed ? 'md:flex-row-reverse' : ''
        }`}
      >
        <div className="w-20 shrink-0 md:w-36">
          <EventPoster event={event} />
        </div>
        <EventBody event={event} />
      </div>
    </li>
  )
}
