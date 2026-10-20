import type { Ref } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Bot } from '../hero/Bot'
import type { BotLook } from '../hero/Bot'

interface Props {
  look: BotLook
  /** True once the heading has scrolled into view: the bot rises out of it. */
  revealed: boolean
  ref?: Ref<HTMLDivElement>
}

export function UpcomingHeadline({ look, revealed, ref }: Props) {
  const reduced = useReducedMotion()
  const up = reduced || revealed

  return (
    <div ref={ref} className="relative mb-8">
      {/* Window that ends on the heading's top edge: the bot rises out of it and
          keeps its lower half hidden, so it reads as standing behind the words. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-[104px] overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-4 flex justify-center"
          initial={false}
          animate={{ y: up ? '0%' : '100%' }}
          transition={
            reduced ? { duration: 0 } : { type: 'spring', stiffness: 130, damping: 16, mass: 0.9 }
          }
        >
          <div className="w-[112px] sm:w-[128px] lg:w-[144px]">
            <Bot look={look} decorative className="bot-watch" />
          </div>
        </motion.div>
      </div>

      <h2 className="text-center font-display text-3xl font-black text-brand sm:text-4xl">
        Upcoming events
      </h2>
    </div>
  )
}
