import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useIntro } from '../intro/IntroProvider'
import learningImg from '../../visuals/learning.webp'
import hackathonImg from '../../visuals/learning1_hackathon.webp'
import learning6Img from '../../visuals/learning6.webp'
import captainJusticeImg from '../../visuals/sports10_captainJustice.webp'
import trophyLiftImg from '../../visuals/sports2_trophylift.webp'
import trophyImg from '../../visuals/sports8_trophy.webp'

const STATIC_WORDS = [
  { text: 'Something', gradient: false },
  { text: 'big', gradient: true },
  { text: 'is', gradient: false },
]
const FLIP_WORDS = ['coming', 'here!']
const GRADIENT = 'bg-gradient-to-r from-brand to-cyan bg-clip-text text-transparent'
const CLIP_HIDDEN = 'inset(0% 100% 0% 0%)'
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

const TYPE_START_MS = 150
const CHAR_MS = 55
const GAP_MS = 60

const TYPING = (() => {
  let t = TYPE_START_MS
  const words = STATIC_WORDS.map((word) => {
    const start = t
    const dur = word.text.length * CHAR_MS
    t += dur + GAP_MS
    return { ...word, start, dur }
  })
  const comingStart = t
  const comingDur = FLIP_WORDS[0].length * CHAR_MS
  t += comingDur
  return { words, comingStart, comingDur, end: t }
})()

const IMAGES_ON_MS = TYPING.end + 120
const TOUR_START_MS = IMAGES_ON_MS + 150

interface TypedWord {
  text: string
  gradient: boolean
  start: number
  dur: number
}

function Tword({ word, reduced }: { word: TypedWord; reduced: boolean | null }) {
  const gradientClass = word.gradient ? GRADIENT : ''
  if (reduced) {
    return <span className={gradientClass}>{word.text}</span>
  }
  return (
    <motion.span
      className={`inline-block ${gradientClass}`}
      initial={{ clipPath: CLIP_HIDDEN }}
      animate={{ clipPath: CLIP_SHOWN }}
      transition={{
        duration: word.dur / 1000,
        delay: word.start / 1000,
        ease: 'linear',
      }}
    >
      {word.text}
    </motion.span>
  )
}

/* ---------------------------------------------------------------------------
   The reveal.

   The collage sits behind the headline. A soft oval mask uncovers it, fitted to
   one photo at a time: the oval takes its radii from the photo's measured box,
   so it is always as big as the photo it is showing, and the photos are visited
   in the order below, so a given photo always reveals in the same place, at the
   same size, at the same point in the sequence.
--------------------------------------------------------------------------- */

interface Reveal {
  src: string
  pos: string
  size: string
}

// Clockwise from the top-left. This order is the reveal order.
const REVEALS: Reveal[] = [
  { src: learning6Img, pos: 'top-0 left-0', size: 'h-56 sm:h-80' },
  { src: learningImg, pos: 'top-0 left-1/2 -translate-x-1/2', size: 'h-64 sm:h-96' },
  { src: hackathonImg, pos: 'top-0 right-0', size: 'h-56 sm:h-80' },
  { src: captainJusticeImg, pos: 'right-0 bottom-10', size: 'h-56 sm:h-80' },
  { src: trophyImg, pos: 'left-[14%] bottom-[16%]', size: 'h-48 sm:h-64' },
  { src: trophyLiftImg, pos: 'left-0 top-[22%]', size: 'h-48 sm:h-64' },
]

const CURSOR_RADIUS = 220 // pointer reveal: a plain circle, nothing to fit
const MIN_RADIUS = 6 // never a zero radius — a degenerate gradient would not mask
const REVEAL_PAD = 1.28 // the oval rim sits this far past the photo's half-extent
const REVEAL_MIN_PAD = 16 // px, keeps a soft rim around the smallest photos

const MASK =
  'radial-gradient(ellipse var(--rx) var(--ry) at var(--mx) var(--my), #000 0%, #000 68%, transparent 100%)'

const REVEAL_STYLE = {
  '--mx': '-999px',
  '--my': '-999px',
  '--rx': `${CURSOR_RADIUS}px`,
  '--ry': `${CURSOR_RADIUS}px`,
  maskImage: MASK,
  WebkitMaskImage: MASK,
} as CSSProperties

// A wash of the page colour under the headline: invisible where no photo shows,
// and where one does it keeps the headline readable on top of it.
const SCRIM =
  'radial-gradient(ellipse 62% 44% at 50% 50%, var(--surface) 0%, var(--surface) 34%, transparent 100%)'

const TRAVEL_MS = 360
const FIRST_DWELL_MS = 260
const DWELL_MS = 120
const EXIT_MS = 360

const REVEAL_MS =
  TRAVEL_MS + FIRST_DWELL_MS + (REVEALS.length - 1) * (TRAVEL_MS + DWELL_MS) + EXIT_MS
const REVEAL_END_MS = TOUR_START_MS + REVEAL_MS
const INTRO_DONE_MS = REVEAL_END_MS + 500

interface Fitted {
  x: number
  y: number
  rx: number
  ry: number
}

const IDLE: Fitted = { x: -999, y: -999, rx: CURSOR_RADIUS, ry: CURSOR_RADIUS }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export function HeroSection() {
  const reduced = useReducedMotion()
  const { completeIntro } = useIntro()
  const spotRef = useRef<HTMLDivElement>(null)
  const [imagesOn, setImagesOn] = useState(false)
  const [flipped, setFlipped] = useState(Boolean(reduced))
  const touringRef = useRef(false)
  const runRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  const apply = useCallback((f: Fitted) => {
    const el = spotRef.current
    if (!el) return
    el.style.setProperty('--mx', `${f.x}px`)
    el.style.setProperty('--my', `${f.y}px`)
    el.style.setProperty('--rx', `${f.rx}px`)
    el.style.setProperty('--ry', `${f.ry}px`)
  }, [])

  const stopTour = useCallback(() => {
    if (!touringRef.current) return
    touringRef.current = false
    runRef.current += 1
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const leave = useCallback(() => {
    stopTour()
    apply(IDLE)
  }, [stopTour, apply])

  const startTour = useCallback(() => {
    const layer = spotRef.current
    if (!layer || touringRef.current) return

    const layerRect = layer.getBoundingClientRect()
    const targets: Fitted[] = []
    for (const img of Array.from(layer.querySelectorAll('img'))) {
      const r = img.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue // not painted yet, nothing to fit to
      targets.push({
        x: r.left - layerRect.left + r.width / 2,
        y: r.top - layerRect.top + r.height / 2,
        rx: (r.width / 2) * REVEAL_PAD + REVEAL_MIN_PAD,
        ry: (r.height / 2) * REVEAL_PAD + REVEAL_MIN_PAD,
      })
    }
    if (targets.length === 0) return

    touringRef.current = true
    runRef.current += 1
    const run = runRef.current

    const cur: Fitted = {
      x: layerRect.width / 2,
      y: layerRect.height / 2,
      rx: MIN_RADIUS,
      ry: MIN_RADIUS,
    }
    apply(cur)

    let index = 0
    let phase: 'travel' | 'dwell' | 'exit' = 'travel'
    let phaseAt = performance.now()
    let from: Fitted = { ...cur }
    let to: Fitted = targets[0]

    const frame = (now: number) => {
      if (runRef.current !== run) return

      if (phase === 'dwell') {
        if (now - phaseAt >= (index === 0 ? FIRST_DWELL_MS : DWELL_MS)) {
          index += 1
          phaseAt = now
          from = { ...cur }
          if (index >= targets.length) {
            phase = 'exit'
            to = { ...cur, rx: MIN_RADIUS, ry: MIN_RADIUS }
          } else {
            phase = 'travel'
            to = targets[index]
          }
        }
      } else {
        const span = phase === 'exit' ? EXIT_MS : TRAVEL_MS
        const t = Math.min(1, (now - phaseAt) / span)
        const e = easeInOut(t)
        cur.x = from.x + (to.x - from.x) * e
        cur.y = from.y + (to.y - from.y) * e
        cur.rx = from.rx + (to.rx - from.rx) * e
        cur.ry = from.ry + (to.ry - from.ry) * e
        apply(cur)

        if (t >= 1) {
          if (phase === 'exit') {
            apply(IDLE)
            touringRef.current = false
            frameRef.current = null
            return
          }
          phase = 'dwell'
          phaseAt = now
        }
      }

      frameRef.current = requestAnimationFrame(frame)
    }

    frameRef.current = requestAnimationFrame(frame)
  }, [apply])

  useEffect(() => {
    if (reduced) {
      setImagesOn(true)
      completeIntro()
      return
    }

    const imagesTimer = window.setTimeout(() => setImagesOn(true), IMAGES_ON_MS)
    const introTimer = window.setTimeout(completeIntro, INTRO_DONE_MS)

    return () => {
      window.clearTimeout(imagesTimer)
      window.clearTimeout(introTimer)
      stopTour()
    }
  }, [reduced, stopTour, completeIntro])

  useEffect(() => {
    if (reduced || !imagesOn) return
    let cancelled = false

    const wait = Math.max(0, TOUR_START_MS - IMAGES_ON_MS)
    const timer = window.setTimeout(() => {
      const layer = spotRef.current
      if (cancelled || !layer) return

      // The oval is fitted to each photo's real box, so wait for the ones still loading.
      const pending = Array.from(layer.querySelectorAll('img')).filter((img) => !img.complete)
      if (pending.length === 0) {
        startTour()
        return
      }

      let left = pending.length
      const done = () => {
        left -= 1
        if (left === 0 && !cancelled) startTour()
      }
      for (const img of pending) {
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      }
    }, wait)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      stopTour()
    }
  }, [reduced, imagesOn, startTour, stopTour])

  useEffect(() => {
    if (reduced) return
    const flipTimer = window.setTimeout(() => setFlipped(true), REVEAL_END_MS)
    return () => clearTimeout(flipTimer)
  }, [reduced])

  const move = (e: ReactMouseEvent<HTMLElement>) => {
    stopTour()
    const el = spotRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    apply({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      rx: CURSOR_RADIUS,
      ry: CURSOR_RADIUS,
    })
  }

  return (
    <section
      onMouseMove={move}
      onMouseLeave={leave}
      className="relative z-10 flex min-h-[calc(100svh-16.5rem)] items-center justify-center overflow-hidden"
    >
      {imagesOn && (
        <>
          <div
            ref={spotRef}
            className="pointer-events-none absolute inset-0"
            style={REVEAL_STYLE}
            aria-hidden="true"
          >
            {REVEALS.map((image) => (
              <img
                key={`spot-${image.src}`}
                src={image.src}
                alt=""
                className={`absolute ${image.pos} ${image.size} w-auto object-contain shadow-2xl`}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: SCRIM }}
            aria-hidden="true"
          />
        </>
      )}

      <h1 className="relative z-10 flex w-fit flex-col items-center font-display text-[clamp(2.4rem,12vw,4.5rem)] leading-[0.95] font-extrabold tracking-tight text-heading md:text-[clamp(2.1rem,9vw,7.5rem)]">
        <span className="block whitespace-nowrap text-center">
          <span className="mr-[0.18em] inline-block">
            <Tword word={TYPING.words[0]} reduced={reduced} />
          </span>
          <span className="mr-[0.18em] inline-block">
            <Tword word={TYPING.words[1]} reduced={reduced} />
          </span>
          <span className="mr-[0.18em] hidden md:inline-block">
            <Tword word={TYPING.words[2]} reduced={reduced} />
          </span>
        </span>

        <span className="block whitespace-nowrap text-center">
          <span className="mr-[0.18em] inline-block md:hidden">
            <Tword word={TYPING.words[2]} reduced={reduced} />
          </span>
          <span className="relative inline-grid place-items-center">
            {FLIP_WORDS.map((word) => (
              <span key={`sizer-${word}`} aria-hidden className="invisible col-start-1 row-start-1">
                {word}
              </span>
            ))}
            <AnimatePresence mode="wait">
              {flipped ? (
                <motion.span
                  key="here"
                  className={`col-start-1 row-start-1 inline-block ${GRADIENT}`}
                  initial={reduced ? false : { opacity: 0, y: '0.35em', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: '-0.35em', filter: 'blur(8px)' }}
                  transition={{ duration: 0.45 }}
                >
                  {FLIP_WORDS[1]}
                </motion.span>
              ) : (
                <motion.span
                  key="coming"
                  className={`col-start-1 row-start-1 inline-block ${GRADIENT}`}
                  initial={reduced ? false : { clipPath: CLIP_HIDDEN }}
                  animate={{ clipPath: CLIP_SHOWN }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, filter: 'blur(8px)', transition: { duration: 0.35 } }
                  }
                  transition={{
                    duration: TYPING.comingDur / 1000,
                    delay: TYPING.comingStart / 1000,
                    ease: 'linear',
                  }}
                >
                  {FLIP_WORDS[0]}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      </h1>
    </section>
  )
}
