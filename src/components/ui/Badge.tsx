import type { ReactNode } from 'react'

type Tone = 'green' | 'warning' | 'danger' | 'brand' | 'neutral'

const tones: Record<Tone, string> = {
  green: 'bg-green-soft text-green',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  brand: 'bg-surface-inset text-heading',
  neutral: 'bg-surface-inset text-body',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  )
}
