import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { PublicEvent } from '../../api/types'
import { EventCard } from './EventCard'

const ROTATE_MS = 4500
const SIDE_TILT = 14

export function ExhibitionRow({ events }: { events: PublicEvent[] }) {
  const reduced = useReducedMotion()
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)

  const count = events.length

  useEffect(() => {
    if (reduced || paused || count < 2) return
    const id = setInterval(() => setOffset((o) => o + 1), ROTATE_MS)
    return () => clearInterval(id)
  }, [reduced, paused, count])

  if (count === 0) return null

  const visible = Array.from(
    { length: Math.min(5, count) },
    (_, i) => events[(offset + i) % count],
  )
  const focusIndex = visible.length === 1 ? 0 : Math.floor(visible.length / 2)

  const duration = (ms: number) => (reduced ? 0 : ms)

  return (
    <div
      className="relative flex items-center justify-center gap-4 sm:gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((event, i) => {
          const dist = Math.abs(i - focusIndex)
          const focus = dist === 0
          const outer = dist >= 2
          const isLeft = i < focusIndex
          const tilt = focus
            ? 0
            : (isLeft ? -1 : 1) * (outer ? SIDE_TILT + 8 : SIDE_TILT)
          const index = (offset + i) % count
          const visit = Math.ceil((offset - index) / count)

          return (
            <motion.div
              key={`${index}:${visit}`}
              layout
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
              animate={{
                scale: focus ? 1 : outer ? 0.85 : 0.9,
                opacity: focus ? 1 : outer ? 0.75 : 0.9,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                filter: 'blur(8px)',
                transition: { duration: duration(0.45), ease: 'easeIn' },
              }}
              transition={{
                layout: { duration: duration(0.6), ease: 'easeInOut' },
                scale: { duration: duration(0.55), ease: 'easeOut' },
                opacity: { duration: duration(0.55) },
                filter: { duration: duration(0.55) },
              }}
              style={{ zIndex: focus ? 30 : outer ? 5 : 10 }}
              className={
                focus
                  ? 'flex w-full flex-col shadow-[0_24px_48px_-16px_rgb(17_24_39_/_0.3)] sm:basis-[48%]'
                  : outer
                    ? `hidden flex-col lg:flex lg:basis-[20%] ${
                        isLeft ? 'lg:-mr-6' : 'lg:-ml-6'
                      }`
                    : `hidden flex-col sm:flex sm:basis-[45%] ${
                        isLeft ? 'sm:-mr-5' : 'sm:-ml-5'
                      }`
              }
            >
              <div
                className="h-full"
                style={{
                  transform: `perspective(1400px) rotateY(${tilt}deg)`,
                  transition: reduced ? undefined : 'transform 700ms ease',
                }}
              >
                <EventCard event={event} variant={focus ? 'focus' : 'compact'} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
