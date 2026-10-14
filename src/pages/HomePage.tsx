import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEvents } from '../api/events'
import type { PublicEvent } from '../api/types'
import { ExhibitionRow } from '../components/events/ExhibitionRow'
import { HeroSection } from '../components/hero/HeroSection'
import { HowItWorks } from '../components/home/HowItWorks'
import { useIntro } from '../components/intro/IntroProvider'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { uiMessage } from '../lib/errorMessage'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'ready'; events: PublicEvent[] }

function ExhibitionSkeleton() {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6" aria-hidden="true">
      <div className="hidden overflow-hidden rounded-3xl border lg:block lg:basis-[20%]">
        <Skeleton className="aspect-[3/4] rounded-none" />
      </div>
      <div className="hidden overflow-hidden rounded-3xl border sm:block sm:basis-[45%]">
        <Skeleton className="aspect-[3/4] rounded-none" />
      </div>
      <div className="w-full overflow-hidden rounded-3xl border sm:basis-[48%]">
        <Skeleton className="aspect-[3/4] rounded-none" />
      </div>
      <div className="hidden overflow-hidden rounded-3xl border sm:block sm:basis-[45%]">
        <Skeleton className="aspect-[3/4] rounded-none" />
      </div>
      <div className="hidden overflow-hidden rounded-3xl border lg:block lg:basis-[20%]">
        <Skeleton className="aspect-[3/4] rounded-none" />
      </div>
    </div>
  )
}

export function HomePage() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const { introDone } = useIntro()

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    const result = await listEvents(1, 6)

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

    setState({ status: 'ready', events: result.data })
  }, [])

  useEffect(() => {
    void load()
  }, [load, attempt])

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <HeroSection />
      </div>

      <section
        inert={!introDone}
        aria-hidden={!introDone}
        className={`relative border-t border-border transition-opacity duration-700 ease-out ${
          introDone ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6">
          <h2 className="mb-8 text-center font-display text-3xl font-black text-heading sm:text-4xl">
            Upcoming events
          </h2>

          {(state.status === 'loading' || (state.status === 'ready' && !introDone)) && (
            <ExhibitionSkeleton />
          )}

          {state.status === 'error' && (
            <ErrorState
              message={state.message}
              onRetry={state.retryable ? () => setAttempt((a) => a + 1) : undefined}
            />
          )}

          {state.status === 'ready' && introDone && state.events.length === 0 && (
            <div className="rounded-3xl border bg-surface-raised px-6 py-14 text-center">
              <p className="font-heading text-xl font-black text-heading">
                No upcoming events right now.
              </p>
              <p className="mt-2 text-body">Check back soon.</p>
            </div>
          )}

          {state.status === 'ready' && introDone && state.events.length > 0 && (
            <div className="animate-rise-in">
              <ExhibitionRow events={state.events} />
              <div className="mt-10 text-center">
                <Link
                  to="/events"
                  className="font-bold text-brand transition-colors hover:text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  View all events →
                </Link>
              </div>
            </div>
          )}

          {state.status === 'ready' && introDone && <HowItWorks />}
        </div>
      </section>
    </>
  )
}
