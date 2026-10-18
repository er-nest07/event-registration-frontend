import type { ReactNode } from 'react'

export interface Fact {
  /** The mono label above the value, e.g. "Spots left". */
  label: string
  /** The fact itself. Keep it short — it is set in display type. */
  value: ReactNode
  /** One line of context under the value. Optional. */
  note?: ReactNode
}

/**
 * The facts someone decides on, in one band: a mono label, a display value and a line of context
 * each. A definition list, because that is what it is.
 *
 * Deliberately not the sidebar's job: the detail page keeps the poster treatment for the date and
 * the pass for registering, and this carries the summary that can be read in one glance.
 */
export function FactBand({ facts, className = '' }: { facts: Fact[]; className?: string }) {
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3 ${className}`}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0 bg-surface-raised px-5 py-5 sm:px-6 sm:py-6">
          <dt className="label-mono text-[11px] text-soft">{fact.label}</dt>
          <dd className="mt-2.5 font-display text-xl leading-tight font-black tracking-tight text-heading sm:text-2xl">
            {fact.value}
            {fact.note ? (
              <span className="mt-2 block font-body text-xs leading-snug font-medium tracking-normal text-body">
                {fact.note}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
