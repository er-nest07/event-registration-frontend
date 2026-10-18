import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listEvents } from '../api/events'
import { resendTicket } from '../api/tickets'
import type { PublicEvent } from '../api/types'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { MailIcon } from '../components/ui/icons'
import { isValidEmail } from '../lib/phone'
import { formatWait, useCountdown } from '../lib/useCountdown'

export function ResendPage() {
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('event')

  const [events, setEvents] = useState<PublicEvent[] | null>(null)
  const [eventsError, setEventsError] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(eventId ?? '')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [limitedUntil, setLimitedUntil] = useState<number | undefined>(undefined)

  const wait = useCountdown(limitedUntil)

  useEffect(() => {
    if (limitedUntil && wait === 0) {
      setLimitedUntil(undefined)
      setFormError(null)
    }
  }, [wait, limitedUntil])

  useEffect(() => {
    if (eventId) return
    let cancelled = false
    setEventsError(false)
    listEvents()
      .then((result) => {
        if (cancelled) return
        if (result.ok) setEvents(result.data)
        else setEventsError(true)
      })
      .catch(() => {
        if (!cancelled) setEventsError(true)
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (wait > 0) return

    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError(null)
    setFormError(null)

    if (!selectedEvent) {
      setFormError('Choose the event your ticket is for.')
      return
    }

    setSubmitting(true)
    const result = await resendTicket(selectedEvent, trimmed)
    setSubmitting(false)

    if (result.ok) {
      setMessage(result.data.message)
      return
    }

    if (result.code === 'RATE_LIMITED') {
      const seconds = result.retryAfterSeconds ?? 60
      setLimitedUntil(Date.now() + seconds * 1000)
      setFormError(`Too many requests. Please wait ${formatWait(seconds)} and try again.`)
      return
    }

    if (result.code === 'VALIDATION_ERROR') {
      setEmailError('Please enter a valid email address.')
      return
    }

    setFormError('Something went wrong. Please try again.')
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-inset text-heading">
        <MailIcon />
      </span>
      <h1 className="mt-5 text-3xl">Resend my ticket</h1>
      <p className="mt-2 text-body">
        Enter the email you registered with and we’ll send your ticket again. It may take a minute.
      </p>

      {message ? (
        <div
          role="status"
          className="mt-8 rounded-3xl border border-green/30 bg-green-soft px-5 py-6 text-sm font-semibold text-green"
        >
          {message}
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
          {formError && (
            <div
              role="alert"
              className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
            >
              {wait > 0 ? `Too many requests. Please wait ${formatWait(wait)} and try again.` : formError}
            </div>
          )}

          {!eventId && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-select" className="text-sm font-bold text-heading">
                Event
              </label>
              {events === null && !eventsError ? (
                <Skeleton className="h-12 w-full" />
              ) : eventsError ? (
                <ErrorState
                  message="We couldn't load the events. Please try again."
                  onRetry={() => window.location.reload()}
                />
              ) : (
                <select
                  id="event-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
                >
                  <option value="">Choose an event…</option>
                  {events?.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onValueChange={(value) => {
              setEmail(value)
              if (emailError) setEmailError(null)
            }}
            error={emailError ?? undefined}
            required
          />

          <Button type="submit" size="lg" disabled={submitting || wait > 0}>
            {submitting
              ? 'Sending…'
              : wait > 0
                ? `Try again in ${formatWait(wait)}`
                : 'Resend my ticket'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-body">
        Looking for an event instead?{' '}
        <Link to="/events" className="font-bold text-heading hover:underline">
          Browse events
        </Link>
      </p>

      <section className="mt-10 border-t pt-6">
        <p className="label-mono text-[11px] text-body">Questions</p>
        <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-heading">
          Before you ask
        </h2>
        <div className="mt-4 divide-y">
          {[
            {
              q: 'Can I resend a ticket for someone else?',
              a: "The link only reaches the address you give us — the ticket code stays with whoever registered. If someone else needs a copy, they should forward it.",
            },
            {
              q: 'How long does the email take?',
              a: 'Usually seconds, occasionally a minute. Check spam if it doesn\u2019t arrive.',
            },
            {
              q: 'I re-registered with a new email — which ticket works?',
              a: 'The newest one. Old codes stop working the moment you cancel or re-register.',
            },
            {
              q: 'Lost the code but still have the QR?',
              a: 'The QR carries the same code. Scan it or contact the organiser.',
            },
          ].map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-heading text-base font-bold text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="text-heading transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-body">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
