import type { PublicEvent } from '../../api/types'
import { EventBody } from './EventBody'
import { EventPoster } from './EventPoster'

/**
 * One result while searching. Same facts as a rail stop, minus the date column and the rule: once
 * you type, the page stops telling a story and starts answering a question.
 */
export function EventResult({ event }: { event: PublicEvent }) {
  return (
    <li className="border-t py-5 first:border-t-0">
      <div className="flex items-start gap-4 md:gap-5">
        <div className="w-16 shrink-0 md:w-20">
          <EventPoster event={event} />
        </div>
        <EventBody event={event} />
      </div>
    </li>
  )
}
