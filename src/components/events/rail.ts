/**
 * The rail's geometry lives here so every stop, the now marker and the chapter headings share one
 * grid: the vertical rule is the centre of the first column, which keeps the line straight no matter
 * how tall a stop grows.
 */
export const RAIL_GRID = 'grid grid-cols-[2.5rem_1fr] gap-x-3 md:grid-cols-[4rem_1fr] md:gap-x-6'

/** The rule itself. Pair with a `relative isolate` ancestor so it sits behind every stop. */
export const RAIL_LINE = 'pointer-events-none absolute inset-y-0 left-5 -z-10 w-px bg-body/20 md:left-8'
