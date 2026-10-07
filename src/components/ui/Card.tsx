import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border bg-surface-raised shadow-card ${className}`}>{children}</div>
  )
}
