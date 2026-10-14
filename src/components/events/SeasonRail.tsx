import type { PublicEvent } from '../../api/types'
import type { Chapter } from './chapters'
import { NowMarker } from './NowMarker'
import { RailEvent } from './RailEvent'
import { RAIL_GRID, RAIL_LINE } from './rail'

/**
 * The page's body once you are not searching: one rule down the left, a marker for today, and the
 * events hung off it in month chapters.
 */
export function SeasonRail({ chapters, next }: { chapters: Chapter[]; next?: PublicEvent }) {
  return (
    <div className="relative isolate">
      <span className={RAIL_LINE} aria-hidden="true" />
      <NowMarker next={next} />

      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="scroll-mt-48">
          <h2 className={`${RAIL_GRID} items-center pt-7 pb-2`}>
            <span className="col-start-2 flex items-center gap-3">
              <span className="text-[11px] font-black tracking-[0.2em] text-soft uppercase">
                {chapter.heading}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </span>
          </h2>

          <ul>
            {chapter.events.map((event) => (
              <RailEvent key={event.id} event={event} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
