import type { PublicEvent } from '../../api/types'
import type { Chapter } from './chapters'
import { NowMarker } from './NowMarker'
import { RailEvent } from './RailEvent'
import { RAIL_GRID, RAIL_LINE } from './rail'
import { MonthDoor } from './MonthDoor'

/**
 * The page's body once you are not searching: one rule down the left, a marker for today, and the
 * events hung off it in month chapters.
 */
export function SeasonRail({ chapters, next }: { chapters: Chapter[]; next?: PublicEvent }) {
  return (
    <div className="relative isolate">
      <span className={RAIL_LINE} aria-hidden="true" />
      <NowMarker next={next} />

      {chapters.map((chapter, chapterIndex) => {
        const globalOffset = chapters
          .slice(0, chapterIndex)
          .reduce((sum, c) => sum + c.events.length, 0)
        return (
          <section key={chapter.id} id={chapter.id} className="scroll-mt-48">
            <h2 className={`${RAIL_GRID} items-baseline border-l-2 border-brand/30 pl-3 pt-7 pb-3`}>
              <span className="col-start-2 flex items-baseline gap-3">
                {/* The number is decoration on top of the month it labels, so it stays out of the
                    heading's readable name. */}
                <span className="label-mono text-[11px] text-soft opacity-70" aria-hidden="true">
                  {String(chapterIndex + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-3xl leading-none font-black tracking-tight text-heading sm:text-4xl">
                  {chapter.heading}
                </span>
                <span className="label-mono text-[11px] text-body">
                  {chapter.events.length} event{chapter.events.length === 1 ? '' : 's'}
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </span>
            </h2>

            {chapter.events[0] && (
              <MonthDoor chapterHeading={chapter.heading} event={chapter.events[0]} />
            )}

            <ul>
              {chapter.events.map((event, eventIndex) => (
                <RailEvent key={event.id} event={event} index={globalOffset + eventIndex} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
