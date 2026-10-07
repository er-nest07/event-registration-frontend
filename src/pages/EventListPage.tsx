import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listEvents } from '../api/events'
import type { ApiResult } from '../api/client'
import type { PublicEvent } from '../api/types'
import { EventCard } from '../components/events/EventCard'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { uiMessage } from '../lib/errorMessage'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'ready'; events: PublicEvent[]; totalPages: number }

export function EventListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    const result: ApiResult<{ data: PublicEvent[]; meta: { totalPages: number } }> =
      await listEvents(page)

    if (!result.ok) {
      setState({
        status: 'error',
        message:
          result.code === 'RATE_LIMITED'
            ? `Too many requests. Please wait ${result.retryAfterSeconds ?? 60} seconds and try again.`
            : uiMessage(result.code),
        retryable: result.code !== 'RATE_LIMITED',
      })
      return
    }

    if (result.data.data.length === 0 && page > 1) {
      navigate('/events?page=1', { replace: true })
      return
    }

    setState({
      status: 'ready',
      events: result.data.data,
      totalPages: result.data.meta.totalPages,
    })
  }, [page, navigate])

  useEffect(() => {
    void load()
  }, [load, attempt])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-black uppercase tracking-widest text-brand">
          KNUST Computer Science Society
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Upcoming events</h1>
        <p className="mt-3 text-body">
          Free events, instant tickets. Register in seconds — your ticket appears on screen and
          arrives by email.
        </p>
      </div>

      <div className="mt-8">
        {state.status === 'loading' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border">
                <Skeleton className="aspect-[16/9] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <ErrorState
            message={state.message}
            onRetry={state.retryable ? () => setAttempt((a) => a + 1) : undefined}
          />
        )}

        {state.status === 'ready' && state.events.length === 0 && (
          <div className="rounded-3xl border bg-surface-raised px-6 py-14 text-center">
            <p className="font-heading text-xl font-black text-heading">
              No upcoming events right now.
            </p>
            <p className="mt-2 text-body">Check back soon.</p>
          </div>
        )}

        {state.status === 'ready' && state.events.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {state.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {state.totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Pagination"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setSearchParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <span className="text-sm font-bold text-body">
                  Page {page} of {state.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= state.totalPages}
                  onClick={() => setSearchParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
