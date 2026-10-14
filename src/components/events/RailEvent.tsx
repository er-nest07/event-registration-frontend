import type { PublicEvent } from '../../api/types'
import { accraDateParts, accraShortMonth } from '../../lib/dates'
import { EventBody } from './EventBody'
import { EventPoster } from './EventPoster'
import { RAIL_GRID } from './rail'

/**
 * One stop on the rail. The date sits on the rule; the poster and the facts hang off it. Deliberately
 * thin — the story is the order, and the description belongs to the detail page.
 */
export function RailEvent({ event }: { event: PublicEvent }) {
  const { day } = accraDateParts(event.startsAt)

  return (
    <li className={`${RAIL_GRID} items-start py-6 md:py-7`}>
      <div className="flex flex-col items-center bg-surface py-1">
        <span className="font-display text-lg leading-none font-black text-heading tabular-nums md:text-2xl">
          {Number(day)}
        </span>
        <span className="mt-1 text-[9px] font-black tracking-[0.14em] text-soft uppercase">
          {accraShortMonth(event.startsAt)}
        </span>
      </div>

      <div className="flex min-w-0 items-start gap-4 md:gap-6">
        <div className="w-20 shrink-0 md:w-36">
          <EventPoster event={event} />
        </div>
        <EventBody event={event} />
      </div>
    </li>
  )
}
