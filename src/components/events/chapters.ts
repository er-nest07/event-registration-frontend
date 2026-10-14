import type { PublicEvent } from '../../api/types'
import { accraDateParts, accraShortMonthYear } from '../../lib/dates'

export interface Chapter {
  /** DOM id, used by the month index and as a scroll target. */
  id: string
  /** Full heading, e.g. "October 2026". */
  heading: string
  /** Compact label for the index, e.g. "Oct 26". */
  label: string
  events: PublicEvent[]
}

/**
 * Groups the list into month chapters. The server already returns events soonest-first, so
 * consecutive runs are enough: no sorting, no date maths, nothing to get out of step.
 */
export function buildChapters(events: PublicEvent[]): Chapter[] {
  const chapters: Chapter[] = []
  let current: Chapter | null = null

  for (const event of events) {
    const heading = accraDateParts(event.startsAt).monthYear
    if (!current || current.heading !== heading) {
      current = {
        id: `month-${chapters.length + 1}`,
        heading,
        label: accraShortMonthYear(event.startsAt),
        events: [],
      }
      chapters.push(current)
    }
    current.events.push(event)
  }

  return chapters
}
