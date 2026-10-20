import { motion, useReducedMotion } from 'motion/react'
import logoImg from '../../visuals/css_logo.svg'
import { Bot } from './Bot'

interface Props {
  /** True when the bot has turned up further down the page: he leaves the hero. */
  botAway?: boolean
}

export function LogoHero({ botAway = false }: Props) {
  const reduced = useReducedMotion()

  return (
    <section className="flex min-h-[calc(100svh-16.5rem)] items-center justify-center overflow-x-clip">
      <motion.div
        className="relative inline-flex flex-col items-center"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative">
          <div
            className={`absolute bottom-0 left-0 z-0 w-[84px] transition-all duration-400 ease-out sm:w-[140px] lg:w-[180px] ${
              botAway ? 'pointer-events-none translate-x-[28%] opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            <Bot color="var(--brand)" />
          </div>
          <img
            src={logoImg}
            alt="KNUST Computer Science Society"
            className="relative z-10 h-32 w-auto bg-surface sm:h-52 lg:h-60"
          />
        </div>
        <p className="mt-3 ps-[0.38em] font-display text-3xl font-light tracking-[0.38em] text-black sm:text-4xl">
          EVENTS
        </p>
      </motion.div>
    </section>
  )
}
