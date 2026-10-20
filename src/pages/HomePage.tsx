import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { Link } from 'react-router-dom'
import { listEvents } from '../api/events'
import type { PublicEvent } from '../api/types'
import { ExhibitionRow } from '../components/events/ExhibitionRow'
import type { RailLook } from '../components/events/ExhibitionRow'
import { HeroSection } from '../components/hero/HeroSection'
import { LogoHero } from '../components/hero/LogoHero'
import { HowItWorks } from '../components/home/HowItWorks'
import { UpcomingHeadline } from '../components/home/UpcomingHeadline'
import { useIntro } from '../components/intro/IntroProvider'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { uiMessage } from '../lib/errorMessage'
import type { BotLook } from '../components/hero/Bot'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'ready'; events: PublicEvent[] }

const GAZE: Record<RailLook, BotLook> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0.3 },
  right: { x: 1, y: 0.3 },
}

function ExhibitionSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden pt-2 pb-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[74%] shrink-0 overflow-hidden rounded-3xl border sm:w-[44%] lg:w-[30%]"
        >
          <Skeleton className="aspect-[3/4] rounded-none" />
        </div>
      ))}
    </div>
  )
}

export function HomePage() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [look, setLook] = useState<RailLook>('down')
  const { introDone } = useIntro()

  // One trigger for both bots: the moment the heading arrives, the bot leaves the
  // hero and rises out of the words, so it reads as the same bot moving down the page.
  const headingRef = useRef<HTMLDivElement>(null)
  const botHere = useInView(headingRef, { amount: 1, margin: '0px 0px -28% 0px' })

  const handleLook = useCallback((next: RailLook) => setLook(next), [])

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
        <AnimatePresence mode="wait">
          {introDone ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <LogoHero botAway={botHere} />
            </motion.div>
          ) : (
            <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HeroSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section
        inert={!introDone}
        aria-hidden={!introDone}
        className={`relative border-t border-border transition-opacity duration-700 ease-out ${
          introDone ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6">
          <UpcomingHeadline ref={headingRef} look={GAZE[look]} revealed={botHere} />

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
              <ExhibitionRow events={state.events} onLook={handleLook} />
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
