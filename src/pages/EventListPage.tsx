import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { listEvents } from '../api/events'
import type { PublicEvent } from '../api/types'
import { EventResult } from '../components/events/EventResult'
import { EventSearch } from '../components/events/EventSearch'
import { MonthStrip, type MonthEntry } from '../components/events/MonthStrip'
import { SeasonRail } from '../components/events/SeasonRail'
import { RAIL_GRID, RAIL_LINE } from '../components/events/rail'
import { buildChapters } from '../components/events/chapters'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { isHappeningNow } from '../lib/dates'
import { uiMessage } from '../lib/errorMessage'
import { formatWait, useCountdown } from '../lib/useCountdown'
import neonMark from '../visuals/css_neon_mark.svg'

const PAGE_SIZE = 50
const DEBOUNCE_MS = 280
const MIN_QUERY_LENGTH = 2

type State =
  | { status: 'loading' }
  | { status: 'error'; code: string; message: string }
  | { status: 'ready'; events: PublicEvent[]; total: number }

export function EventListPage() {
  const reduced = useReducedMotion()

  const [typed, setTyped] = useState('')
  const [term, setTerm] = useState('')
  const [state, setState] = useState<State>({ status: 'loading' })
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [activeMonth, setActiveMonth] = useState<string | undefined>()
  const [limitedUntil, setLimitedUntil] = useState<number | undefined>()
  const [showBackToTop, setShowBackToTop] = useState(false)

  const wait = useCountdown(limitedUntil)
  const requestId = useRef(0)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Search is debounced so one keystroke is one request, not one request per character.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(typed.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [typed])

  useEffect(() => {
    if (limitedUntil && wait === 0) setLimitedUntil(undefined)
  }, [wait, limitedUntil])

  const searching = term.length >= MIN_QUERY_LENGTH

  const load = useCallback(async () => {
    const id = ++requestId.current
    setState({ status: 'loading' })
    setPage(1)
    setMoreError(null)
    setActiveMonth(undefined)

    const result = await listEvents(1, PAGE_SIZE, term)
    if (id !== requestId.current) return

    if (!result.ok) {
      // A 429 is rendered with a live countdown, not with this message; the code is what matters.
      setState({ status: 'error', code: result.code, message: uiMessage(result.code) })
      if (result.code === 'RATE_LIMITED') {
        setLimitedUntil(Date.now() + (result.retryAfterSeconds ?? 60) * 1000)
      }
      return
    }

    setState({
      status: 'ready',
      events: result.data,
      total: result.meta?.total ?? result.data.length,
    })
  }, [term])

  useEffect(() => {
    void load()
  }, [load, attempt])

  const loadMore = useCallback(async () => {
    if (state.status !== 'ready') return

    const id = requestId.current
    const next = page + 1
    setMoreError(null)
    setLoadingMore(true)
    const result = await listEvents(next, PAGE_SIZE, term)
    setLoadingMore(false)
    if (id !== requestId.current) return

    if (!result.ok) {
      if (result.code === 'RATE_LIMITED') {
        setLimitedUntil(Date.now() + (result.retryAfterSeconds ?? 60) * 1000)
      }
      setMoreError(uiMessage(result.code))
      return
    }

    setState((previous) =>
      previous.status === 'ready'
        ? {
            ...previous,
            events: [...previous.events, ...result.data],
            total: result.meta?.total ?? previous.total,
          }
        : previous,
    )
    setPage(next)
  }, [page, state, term])

  // Memoised on `state` alone: the observer effect below depends on this, and rebuilding the array
  // on every render would re-connect the observer on every render (it fires on connect).
  const chapters = useMemo(
    () => buildChapters(state.status === 'ready' ? state.events : []),
    [state],
  )
  const months: MonthEntry[] = chapters.map((chapter) => ({
    id: chapter.id,
    label: chapter.label,
    count: chapter.events.length,
  }))

  useEffect(() => {
    if (searching || chapters.length === 0) return

    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => element !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveMonth(visible[0].target.id)
      },
      { rootMargin: '-160px 0px -60% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [chapters, searching])

  const jumpToMonth = useCallback(
    (id: string) => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced],
  )

  const ready = state.status === 'ready'
  const total = ready ? state.total : 0
  const events = ready ? state.events : []
  const liveCount = events.filter((event) => isHappeningNow(event.startsAt, event.endsAt)).length

  const stat = !ready
    ? searching
      ? `Searching for “${term}”…`
      : 'Loading events…'
    : searching
      ? `${total} ${total === 1 ? 'match' : 'matches'} for “${term}”.`
      : `${total} upcoming${liveCount ? ` · ${liveCount} happening now` : ''}`

  const remaining = ready ? Math.max(0, total - events.length) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex items-end justify-between gap-4 border-b pt-8 pb-4">
        <div>
          <p className="label-mono text-[11px] text-body">
            KNUST Computer Science Society
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-heading sm:text-5xl">
            What&apos;s on
          </h1>
        </div>
        <div className="hidden shrink-0 md:block">
          <img src={neonMark} alt="" className="h-24 w-24" />
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-4 mt-6 border-y border-border bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-4">
          <div className="w-full md:max-w-xs">
            <EventSearch value={typed} onValueChange={setTyped} />
          </div>
          {!searching && months.length > 0 && (
            <MonthStrip months={months} activeId={activeMonth} onPick={jumpToMonth} />
          )}
          <p role="status" aria-live="polite" aria-atomic="true" className="ml-auto hidden font-mono text-sm font-semibold text-body md:block">
            {stat}
          </p>
        </div>
      </div>

      <div className="mt-8 mb-16">
        {state.status === 'loading' && <ListSkeleton />}

        {state.status === 'error' &&
          (state.code === 'RATE_LIMITED' ? (
            <RateLimitNotice wait={wait} onRetry={() => setAttempt((value) => value + 1)} />
          ) : (
            <ErrorState
              message={state.message}
              onRetry={() => setAttempt((value) => value + 1)}
            />
          ))}

        {ready && events.length === 0 && (
          <div className="rounded-3xl border bg-surface-raised px-6 py-14 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-inset">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-soft">
                {searching ? (
                  <path d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                ) : (
                  <>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </>
                )}
              </svg>
            </div>
            <p className="font-heading text-xl font-black text-heading">
              {searching ? `Nothing matches “${term}”.` : 'No upcoming events right now.'}
            </p>
            <p className="mt-2 text-body">
              {searching ? 'Try a shorter word, or search by venue.' : 'Check back soon.'}
            </p>
            {searching && (
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => {
                  setTyped('')
                  setTerm('')
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {ready && events.length > 0 && (
          <>
            {searching ? (
              <ul id="event-list" className="border-t">
                {events.map((event) => (
                  <EventResult key={event.id} event={event} />
                ))}
              </ul>
            ) : (
              <SeasonRail chapters={chapters} next={events[0]} />
            )}

            {moreError && (
              <div
                role="alert"
                className="mx-auto mt-8 max-w-lg rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-center text-sm font-semibold text-danger"
              >
                {moreError}
              </div>
            )}

            {remaining > 0 && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="primary"
                  disabled={loadingMore || wait > 0}
                  onClick={() => void loadMore()}
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Loading…
                    </>
                  ) : wait > 0 ? (
                    `Try again in ${formatWait(wait)}`
                  ) : (
                    <>
                      Show {Math.min(PAGE_SIZE, remaining)} more events
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
          className="fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border bg-surface-raised text-heading shadow-card transition-all hover:bg-surface-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
          aria-label="Back to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

function RateLimitNotice({ wait, onRetry }: { wait: number; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-2xl rounded-3xl border border-warning/40 bg-warning-soft px-6 py-12 text-center"
    >
      <p className="text-sm font-semibold text-warning">
        {wait > 0
          ? `Too many requests. Please wait ${formatWait(wait)} and try again.`
          : 'Too many requests. You can try again now.'}
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-5"
        disabled={wait > 0}
        onClick={onRetry}
      >
        {wait > 0 ? `Try again in ${formatWait(wait)}` : 'Try again'}
      </Button>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="relative isolate" aria-hidden="true">
      <span className={RAIL_LINE} />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`${RAIL_GRID} items-start py-6`}>
          <div className="flex flex-col items-center gap-1.5 py-1">
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-2.5 w-6" />
          </div>
          <div className="flex min-w-0 items-start gap-4 md:gap-6">
            <div className="w-20 shrink-0 md:w-36">
              <Skeleton className="aspect-[3/4]" />
            </div>
            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
