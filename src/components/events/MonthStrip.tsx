export interface MonthEntry {
  /** DOM id of the chapter this jumps to. */
  id: string
  /** Compact label, e.g. "Oct 26". */
  label: string
  count: number
}

interface Props {
  months: MonthEntry[]
  /** The chapter currently under the reader, so the index doubles as a "you are here". */
  activeId?: string
  onPick: (id: string) => void
}

/**
 * A scroll-along index of the months on the page. It moves the page, it never filters it: filtering
 * is the search field's job, and mixing the two would make the counts lie.
 */
export function MonthStrip({ months, activeId, onPick }: Props) {
  return (
    <nav
      aria-label="Jump to a month"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {months.map((month) => {
        const active = month.id === activeId
        return (
          <button
            key={month.id}
            type="button"
            aria-current={active ? 'true' : undefined}
            onClick={() => onPick(month.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? 'border-brand bg-brand-soft text-brand'
                : 'bg-surface text-body hover:border-brand hover:text-brand'
            }`}
          >
            {month.label}
            <span className={active ? 'font-black' : 'font-black text-soft'}>{month.count}</span>
          </button>
        )
      })}
    </nav>
  )
}
