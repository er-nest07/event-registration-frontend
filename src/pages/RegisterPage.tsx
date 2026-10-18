import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEvent } from '../api/events'
import { register } from '../api/tickets'
import { fieldErrors, type ApiResult } from '../api/client'
import type { PublicEvent, RegisterResult } from '../api/types'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { ArrowLeftIcon } from '../components/ui/icons'
import { isValidEmail, isValidGhanaPhone, normalizePhone } from '../lib/phone'
import { formatAccra } from '../lib/dates'
import { useCountdown, formatWait } from '../lib/useCountdown'

type EventState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; event: PublicEvent }

const FRIENDLY: Record<string, string> = {
  fullName: 'Please enter your full name (2–100 characters).',
  email: 'Please enter a valid email address.',
}

export function RegisterPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [eventState, setEventState] = useState<EventState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fieldErrorsState, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
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
    let cancelled = false
    setEventState({ status: 'loading' })
    getEvent(id).then((result: ApiResult<PublicEvent>) => {
      if (cancelled) return
      if (result.ok) setEventState({ status: 'ready', event: result.data })
      else if (result.code === 'NOT_FOUND' || result.code === 'VALIDATION_ERROR')
        setEventState({ status: 'notFound' })
      else setEventState({ status: 'error' })
    })
    return () => {
      cancelled = true
    }
  }, [id, attempt])

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.fullName = FRIENDLY.fullName
    }
    if (!isValidEmail(email.trim())) errors.email = FRIENDLY.email
    if (normalizePhone(phone) !== '' && !isValidGhanaPhone(phone)) {
      errors.phone = 'Please enter a valid Ghanaian mobile number, e.g. 024 123 4567.'
    }
    setFieldErrors(errors)
    setFormError(null)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (wait > 0) return
    if (!validate()) return

    setSubmitting(true)
    const body = {
      fullName: fullName.trim(),
      email: email.trim(),
      ...(normalizePhone(phone) !== '' ? { phone: normalizePhone(phone) } : {}),
    }
    const result = await register(id, body)
    setSubmitting(false)

    if (result.ok) {
      const res: RegisterResult = result.data
      navigate(`/tickets/${res.ticketCode}`, { replace: true, state: { fromRegistration: true } })
      return
    }

    if (result.code === 'VALIDATION_ERROR') {
      const errors: Record<string, string> = {}
      let bodyMessage: string | null = null
      for (const detail of fieldErrors(result as Extract<ApiResult<unknown>, { ok: false }>)) {
        if (!detail.path) bodyMessage = detail.message
        else errors[detail.path] = detail.path === 'phone' ? detail.message : (FRIENDLY[detail.path] ?? detail.message)
      }
      setFieldErrors(errors)
      setFormError(bodyMessage)
      return
    }

    if (result.code === 'RATE_LIMITED') {
      const seconds = result.retryAfterSeconds ?? 60
      setLimitedUntil(Date.now() + seconds * 1000)
      setFormError(`Too many requests. Please wait ${formatWait(seconds)} and try again.`)
      return
    }

    if (result.code === 'EVENT_FULL' || result.code === 'EVENT_ENDED') {
      setFormError(
        result.code === 'EVENT_FULL'
          ? 'Sorry, this event is full.'
          : 'This event has already ended.',
      )
      setAttempt((a) => a + 1)
      return
    }

    if (result.code === 'ALREADY_REGISTERED') {
      setFormError('This email is already registered for this event.')
      return
    }

    setFormError('Something went wrong. Please try again.')
  }

  if (eventState.status === 'loading') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-14 w-full" />
        <Skeleton className="mt-4 h-14 w-full" />
        <Skeleton className="mt-4 h-14 w-full" />
      </div>
    )
  }

  if (eventState.status === 'notFound') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl">Event not found</h1>
        <Link to="/events" className="mt-6 inline-block">
          <Button variant="secondary">Back to all events</Button>
        </Link>
      </div>
    )
  }

  if (eventState.status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <ErrorState message="Something went wrong. Please try again." onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    )
  }

  const { event } = eventState
  const closed = event.spotsLeft <= 0 || event.hasEnded

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Link
        to={`/events/${event.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-body transition-colors hover:text-heading"
      >
        <ArrowLeftIcon width={16} height={16} />
        {event.title}
      </Link>

      <h1 className="mt-4 text-3xl">Register for {event.title}</h1>
      <p className="mt-2 text-sm text-body">
        {formatAccra(event.startsAt)} · {event.venue}
      </p>

      {closed ? (
        <div className="mt-6 rounded-3xl border bg-surface-raised p-6 text-center">
          <p className="font-heading text-lg font-black text-heading">
            {event.spotsLeft <= 0 ? 'Sorry, this event is full.' : 'This event has already ended.'}
          </p>
          <Link to="/events" className="mt-4 inline-block">
            <Button variant="secondary">See other events</Button>
          </Link>
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

          <Input
            label="Full name"
            name="fullName"
            autoComplete="name"
            placeholder="Ama Mensah"
            value={fullName}
            onValueChange={setFullName}
            error={fieldErrorsState.fullName}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            hint="Your ticket will be sent here."
            value={email}
            onValueChange={setEmail}
            error={fieldErrorsState.email}
            required
          />
          <Input
            label="Phone (optional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="024 123 4567"
            hint="Ghanaian mobile number, e.g. 024 123 4567"
            value={phone}
            onValueChange={setPhone}
            error={fieldErrorsState.phone}
          />

          <Button type="submit" size="lg" disabled={submitting || wait > 0}>
            {submitting
              ? 'Registering…'
              : wait > 0
                ? `Try again in ${formatWait(wait)}`
                : 'Get my ticket'}
          </Button>

          <p className="text-center text-xs text-soft">
            No account needed. We only use your details for this event’s ticket.
          </p>
        </form>
      )}
    </div>
  )
}
