import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { PublicEvent } from '../../api/types'
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons'
import { EventCard } from './EventCard'

const GAP_PX = 16

function RailButton({
  side,
  label,
  disabled,
  onClick,
}: {
  side: 'left' | 'right'
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised text-heading shadow-card transition-opacity duration-200 hover:text-heading disabled:pointer-events-none disabled:opacity-0 sm:flex ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {side === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  )
}

export function ExhibitionRow({ events }: { events: PublicEvent[] }) {
  const reduced = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    syncEdges()
    el.addEventListener('scroll', syncEdges, { passive: true })
    const observer = new ResizeObserver(syncEdges)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', syncEdges)
      observer.disconnect()
    }
  }, [syncEdges])

  const step = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const first = el.firstElementChild as HTMLElement | null
    const distance = first ? first.offsetWidth + GAP_PX : el.clientWidth * 0.8
    el.scrollBy({ left: direction * distance, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (events.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Upcoming events"
        tabIndex={0}
        className="flex snap-x snap-proximity gap-4 overflow-x-auto pt-2 pb-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-heading [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <div key={event.id} className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-[30%]">
            <EventCard event={event} />
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-surface to-transparent transition-opacity duration-200 ${
          atStart ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 ${
          atEnd ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {events.length > 1 && (
        <>
          <RailButton
            side="left"
            label="Previous events"
            disabled={atStart}
            onClick={() => step(-1)}
          />
          <RailButton
            side="right"
            label="Next events"
            disabled={atEnd}
            onClick={() => step(1)}
          />
        </>
      )}
    </div>
  )
}
