import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEvent } from '../api/events'
import type { PublicEvent } from '../api/types'
import { EventBanner } from '../components/events/EventBanner'
import { SpotsBadge } from '../components/events/SpotsBadge'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { ArrowLeftIcon, ClockIcon, MapPinIcon } from '../components/ui/icons'
import { formatAccra, isHappeningNow } from '../lib/dates'
import { uiMessage } from '../lib/errorMessage'

type State =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; message: string }
  | { status: 'ready'; event: PublicEvent }

export function EventDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    const result = await getEvent(id)
    if (result.ok) {
      setState({ status: 'ready', event: result.data })
    } else if (result.code === 'NOT_FOUND' || result.code === 'VALIDATION_ERROR') {
      setState({ status: 'notFound' })
    } else {
      setState({
        status: 'error',
        message:
          result.code === 'RATE_LIMITED'
            ? `Too many requests. Please wait ${result.retryAfterSeconds ?? 60} seconds and try again.`
            : uiMessage(result.code),
      })
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load, attempt])

  if (state.status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
        <Skeleton className="mt-6 h-9 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <Skeleton className="mt-8 h-24 w-full" />
      </div>
    )
  }

  if (state.status === 'notFound') {
    return (
      <NotFoundBlock />
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ErrorState message={state.message} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    )
  }

  const { event } = state
  const live = isHappeningNow(event.startsAt, event.endsAt)
  const soldOut = event.spotsLeft <= 0

  const buttonLabel = soldOut ? 'Sold out' : event.hasEnded ? 'This event has ended' : 'Register free'
  const disabled = soldOut || event.hasEnded

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-body transition-colors hover:text-brand"
      >
        <ArrowLeftIcon width={16} height={16} />
        All events
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border shadow-card">
        <EventBanner bannerUrl={event.bannerUrl} title={event.title} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {live && <span className="rounded-full bg-green-soft px-3 py-1 text-xs font-bold text-green">Happening now</span>}
        <SpotsBadge spotsLeft={event.spotsLeft} />
        {event.hasEnded && (
          <span className="rounded-full bg-surface-inset px-3 py-1 text-xs font-bold text-body">
            Ended
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl">{event.title}</h1>

      <div className="mt-4 grid gap-3 text-sm">
        <p className="flex items-start gap-2 text-body">
          <ClockIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand" />
          <span>
            {formatAccra(event.startsAt)}
            <br />
            until {formatAccra(event.endsAt)}
          </span>
        </p>
        <p className="flex items-start gap-2 text-body">
          <MapPinIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand" />
          {event.venue}
        </p>
      </div>

      <div className="mt-6 whitespace-pre-line leading-relaxed text-body">{event.description}</div>

      <div className="mt-8 rounded-3xl border bg-surface-raised p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-lg font-black text-heading">
              {soldOut ? 'No spots left' : event.hasEnded ? 'Registration is closed' : 'Ready to join?'}
            </p>
            <p className="mt-1 text-sm text-body">
              {soldOut
                ? 'This event is full. Check the list for other events.'
                : event.hasEnded
                  ? 'This event has already taken place.'
                  : 'It takes about 30 seconds. No account needed.'}
            </p>
          </div>
          <Button
            size="lg"
            disabled={disabled}
            onClick={() => navigate(`/events/${event.id}/register`)}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function NotFoundBlock() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl">Event not found</h1>
      <p className="mt-3 text-body">
        This event may have been unpublished, cancelled, or the link is wrong.
      </p>
      <Link to="/events" className="mt-6 inline-block">
        <Button variant="secondary">Back to all events</Button>
      </Link>
    </div>
  )
}
