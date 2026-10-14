import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { absoluteUrl } from '../api/client'
import { getEvent } from '../api/events'
import type { PublicEvent } from '../api/types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  MapPinIcon,
  TicketIcon,
} from '../components/ui/icons'
import { downloadIcs, googleCalendarUrl } from '../lib/calendar'
import { accraDateParts, formatAccraRange, formatAccraTime, isHappeningNow } from '../lib/dates'
import { uiMessage } from '../lib/errorMessage'

type State =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; message: string }
  | { status: 'ready'; event: PublicEvent }

type Tone = 'green' | 'warning' | 'danger' | 'brand' | 'neutral'

const EASE = [0.22, 1, 0.36, 1] as const
const TITLE_CLASS =
  'font-display text-[clamp(2.3rem,11vw,4rem)] leading-[0.92] font-black tracking-[-0.02em] text-heading lg:text-[clamp(3rem,6.2vw,5.5rem)]'

function statusFor(event: PublicEvent, live: boolean): { tone: Tone; label: string } {
  if (event.hasEnded) return { tone: 'neutral', label: 'Event ended' }
  if (event.spotsLeft <= 0) return { tone: 'danger', label: 'Sold out' }
  if (live) return { tone: 'green', label: 'Happening now' }
  const limited = event.capacity > 0 && event.spotsLeft <= Math.max(5, Math.ceil(event.capacity * 0.15))
  if (limited) return { tone: 'warning', label: 'Almost full' }
  return { tone: 'brand', label: 'Registration open' }
}

function humanizeDuration(ms: number): string {
  if (!(ms > 0)) return '—'
  const mins = Math.round(ms / 60000)
  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  if (hours >= 24) {
    const days = Math.round(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`
  if (hours > 0) return `${hours} hr`
  return `${minutes} min`
}

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

  if (state.status === 'loading') return <DetailSkeleton />
  if (state.status === 'notFound') return <NotFoundBlock />
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
  const status = statusFor(event, live)
  const parts = accraDateParts(event.startsAt)
  const reservedPct =
    event.capacity > 0
      ? Math.min(100, Math.max(0, Math.round(((event.capacity - event.spotsLeft) / event.capacity) * 100)))
      : 0
  const durationMs = new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()
  const description = event.description?.trim()
    ? event.description.trim()
    : 'The full programme will be shared with everyone who registers. Secure your spot and we will email you the details.'
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const [lead, ...rest] = paragraphs
  const timeline = [
    { label: 'Doors open', time: formatAccraTime(event.startsAt) },
    { label: 'Wrap up', time: formatAccraTime(event.endsAt) },
  ]

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Nameplate */}
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.18em] text-body uppercase transition-colors hover:text-brand"
          >
            <ArrowLeftIcon width={15} height={15} />
            All events
          </Link>
          <Badge tone={status.tone} icon={<span className="h-1.5 w-1.5 rounded-full bg-current" />}>
            {status.label}
          </Badge>
        </div>

        {/* Poster masthead */}
        <div className="grid gap-x-8 gap-y-8 pt-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <p className="text-[11px] font-black tracking-[0.22em] text-brand uppercase">
              KNUST Computer Science Society
            </p>
            <PosterTitle text={event.title} />
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-body">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon width={16} height={16} className="text-brand" />
                {event.venue}
              </span>
              <span className="text-soft">·</span>
              <span>{formatAccraTime(event.startsAt)}–{formatAccraTime(event.endsAt)} Accra</span>
            </p>

            <ImagePlate bannerUrl={event.bannerUrl} title={event.title} />
          </div>

          <div className="space-y-6 lg:col-span-4">
            <DateBlock event={event} day={parts.day} monthYear={parts.monthYear} weekday={parts.weekday} />
            <Reveal>
              <RegistrationPass
                event={event}
                soldOut={soldOut}
                ended={event.hasEnded}
                reservedPct={reservedPct}
                onRegister={() => navigate(`/events/${event.id}/register`)}
              />
            </Reveal>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <Ticker
        items={[
          status.label,
          'Free entry',
          `${parts.weekday} ${parts.day} ${parts.month}`,
          event.venue,
          'KNUST CS Society',
        ]}
      />

      {/* Programme */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7">
            <Reveal>
              <section>
                <SectionLabel>About</SectionLabel>
                {lead && (
                  <p className="mt-6 max-w-[58ch] text-pretty text-lg leading-8 font-semibold text-heading first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[3.5rem] first-letter:leading-[0.68] first-letter:font-black first-letter:text-brand sm:text-xl sm:leading-9">
                    {lead}
                  </p>
                )}
                {rest.map((paragraph, i) => (
                  <p key={i} className="mt-5 max-w-[58ch] text-[15px] leading-7 text-body">
                    {paragraph}
                  </p>
                ))}
              </section>
            </Reveal>
          </div>

          <div className="space-y-12 lg:col-span-5">
            <Reveal>
              <section>
                <div className="flex items-baseline justify-between gap-4">
                  <SectionLabel>The day</SectionLabel>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                    {humanizeDuration(durationMs)}
                  </span>
                </div>

                <ol className="mt-6">
                  {timeline.map((step, i) => (
                    <li key={step.label} className="grid grid-cols-[0.75rem_1fr] gap-5">
                      <span className="relative flex justify-center">
                        {i < timeline.length - 1 && (
                          <span className="absolute top-4 h-full w-px bg-border" aria-hidden="true" />
                        )}
                        <span
                          className="relative z-10 mt-2 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-surface"
                          aria-hidden="true"
                        />
                      </span>
                      <div className={i < timeline.length - 1 ? 'pb-8' : ''}>
                        <p className="text-[11px] font-black tracking-[0.2em] text-soft uppercase">
                          {step.label}
                        </p>
                        <p className="mt-1 font-display text-3xl tracking-tight text-heading">
                          {step.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className="mt-6 border-t pt-4 text-[11px] font-black tracking-[0.14em] text-soft uppercase">
                  {formatAccraRange(event.startsAt, event.endsAt)}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section>
                <SectionLabel>Good to know</SectionLabel>
                <dl className="mt-5 border-t">
                  <FactRow term="Tickets">
                    Emailed the moment you register, with a QR code you show at the door.
                  </FactRow>
                  <FactRow term="Check-in">
                    Staff scan your QR on arrival. Come a little early to skip the queue.
                  </FactRow>
                  <FactRow term="Cost">Completely free — nothing to pay, at any point.</FactRow>
                  <FactRow term="Who it&apos;s for">Open to all KNUST students.</FactRow>
                </dl>
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-8 shrink-0 bg-brand" aria-hidden="true" />
      <h2 className="font-display text-2xl font-black tracking-tight text-heading sm:text-3xl">
        {children}
      </h2>
    </div>
  )
}

function DateBlock({
  event,
  day,
  monthYear,
  weekday,
}: {
  event: PublicEvent
  day: string
  monthYear: string
  weekday: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="flex flex-col rounded-2xl border p-6"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex items-center justify-between text-[11px] font-black tracking-[0.18em] text-soft uppercase">
        <span>Date</span>
        <span className="text-brand">Free entry</span>
      </div>

      <div className="mt-6">
        <div className="font-display text-[clamp(3.5rem,10vw,5.5rem)] leading-[0.82] font-black text-brand">
          {day}
        </div>
        <div className="mt-3 font-heading text-xl font-black tracking-wide text-heading uppercase">
          {monthYear}
        </div>
        <div className="mt-1 text-sm text-body">{weekday}</div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t pt-4 text-sm font-semibold text-body">
        <ClockIcon width={16} height={16} className="text-brand" />
        <span>
          {formatAccraTime(event.startsAt)}–{formatAccraTime(event.endsAt)} · Accra GMT
        </span>
      </div>
    </motion.div>
  )
}

function PosterTitle({ text }: { text: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <h1 className={`mt-3 ${TITLE_CLASS}`}>{text}</h1>
  return (
    <motion.h1
      className={`mt-3 ${TITLE_CLASS}`}
      initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
      transition={{ duration: 0.95, ease: EASE, delay: 0.12 }}
    >
      {text}
    </motion.h1>
  )
}

function ImagePlate({ bannerUrl, title }: { bannerUrl: string | null; title: string }) {
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const show = bannerUrl && !failed

  return (
    <motion.div
      className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border bg-surface-inset"
      initial={reduced ? false : { opacity: 0, scale: 1.04, filter: 'blur(14px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1, ease: EASE, delay: 0.2 }}
    >
      {show ? (
        <img
          src={absoluteUrl(bannerUrl)}
          alt={`${title} banner`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="relative h-full w-full bg-gradient-to-br from-brand via-brand/80 to-cyan">
          <div className="iso-grid absolute inset-0 opacity-30" aria-hidden="true" />
        </div>
      )}
      <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        <TicketIcon width={14} height={14} />
        QR at the door
      </span>
    </motion.div>
  )
}

function Ticker({ items }: { items: string[] }) {
  const renderGroup = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className="flex items-center">
          <span className="px-6 text-sm font-black tracking-[0.2em] whitespace-nowrap uppercase">{item}</span>
          <span className="text-cyan" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="mt-10 overflow-hidden border-y border-black/10 bg-brand py-3 text-on-brand">
      <div className="flex w-max motion-safe:animate-marquee">
        {renderGroup('a')}
        {renderGroup('b')}
      </div>
    </div>
  )
}

function FactRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-b py-3.5 text-sm">
      <dt className="font-bold text-heading">{term}</dt>
      <dd className="text-body">{children}</dd>
    </div>
  )
}

function RegistrationPass({
  event,
  soldOut,
  ended,
  reservedPct,
  onRegister,
}: {
  event: PublicEvent
  soldOut: boolean
  ended: boolean
  reservedPct: number
  onRegister: () => void
}) {
  const disabled = soldOut || ended
  const label = soldOut ? 'Sold out' : ended ? 'Event ended' : 'Register for free'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-raised shadow-card">
      <div className="pointer-events-none absolute inset-0 rounded-2xl border" aria-hidden="true" />
      <div className="flex items-center justify-between px-6 pt-5 text-[11px] font-black tracking-[0.18em] uppercase">
        <span className="text-soft">Registration</span>
        <span className="text-brand">Free</span>
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-5xl leading-none font-black text-brand">FREE</p>
            <p className="mt-2 text-sm text-body">Open to all students · no account needed</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black tracking-[0.14em] text-soft uppercase">Seats left</p>
            <p className="font-heading text-xl font-black text-heading">
              {soldOut ? '0' : event.spotsLeft}
              <span className="text-soft">/{event.capacity}</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-heading">
              {ended ? 'Registration closed' : soldOut ? 'No seats left' : `${reservedPct}% reserved`}
            </span>
            <span className="text-soft">{soldOut ? 'Full' : `${event.spotsLeft} left`}</span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-inset"
            role="progressbar"
            aria-valuenow={reservedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Seats reserved"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${reservedPct}%` }}
            />
          </div>
        </div>

        <Button size="lg" className="mt-6 w-full" disabled={disabled} onClick={onRegister}>
          {label}
        </Button>
        <p className="mt-2.5 text-center text-xs text-soft">
          {ended ? 'Registration is closed for this event.' : 'About 30 seconds. No account needed.'}
        </p>
      </div>

      <div className="relative px-6">
        <span
          className="absolute top-1/2 left-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
          aria-hidden="true"
        />
        <span
          className="absolute top-1/2 right-0 h-5 w-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-surface"
          aria-hidden="true"
        />
        <div className="border-t border-dashed" />
      </div>

      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-soft uppercase">Add to calendar</p>
          <div className="mt-2 flex items-center gap-3 text-sm font-bold text-brand">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <CalendarIcon width={16} height={16} />
              Google
            </a>
            <span className="text-soft">·</span>
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <DownloadIcon width={16} height={16} />
              .ics
            </button>
          </div>
        </div>
        <TicketIcon width={36} height={36} className="shrink-0 text-brand/35" />
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <div className="grid gap-x-8 gap-y-8 pt-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Skeleton className="h-3 w-52" />
            <Skeleton className="mt-4 h-16 w-4/5" />
            <Skeleton className="mt-2 h-16 w-3/5" />
            <Skeleton className="mt-8 aspect-[16/9] w-full rounded-2xl" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-10 h-11 w-full rounded-none" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-8 lg:col-span-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </>
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
