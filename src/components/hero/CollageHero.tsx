import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import learningImg from '../../visuals/learning.webp'
import hackathonImg from '../../visuals/learning1_hackathon.webp'
import learning6Img from '../../visuals/learning6.webp'
import captainJusticeImg from '../../visuals/sports10_captainJustice.webp'
import trophyLiftImg from '../../visuals/sports2_trophylift.webp'
import trophyImg from '../../visuals/sports8_trophy.webp'

const PHOTOS = [
  learning6Img,
  learningImg,
  hackathonImg,
  captainJusticeImg,
  trophyImg,
  trophyLiftImg,
]

const TILT = [-2.5, 1.5, -1, 2, -1.5, 1]

export function CollageHero() {
  const reduced = useReducedMotion()

  return (
    <section className="flex min-h-[calc(100svh-16.5rem)] items-center py-6">
      <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <motion.div
          className="lg:col-span-5"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="label-mono text-xs text-brand">KNUST Computer Science Society</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,8vw,4.4rem)] leading-[1.02] font-black tracking-tight text-heading">
            Where CS at KNUST{' '}
            <span className="bg-gradient-to-r from-brand to-cyan-strong bg-clip-text text-transparent">
              shows up.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-body">
            Free workshops, hackathons and meetups — register in seconds and your ticket lands in
            your inbox.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/events">
              <Button size="lg">Browse all events</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">How it works</Button>
            </a>
          </div>
        </motion.div>

        <div className="lg:col-span-7">
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-x-5 lg:gap-y-8 lg:overflow-visible lg:px-0 lg:pb-0">
            {PHOTOS.map((src, i) => (
              <motion.div
                key={src}
                className="w-[68%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-surface-raised shadow-2xl sm:w-[52%] lg:w-auto"
                initial={reduced ? false : { opacity: 0, y: 32, rotate: TILT[i] * 2.5, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, rotate: TILT[i], scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                whileHover={reduced ? undefined : { y: -6, rotate: 0, transition: { duration: 0.25 } }}
              >
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
