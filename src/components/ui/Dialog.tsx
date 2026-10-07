import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

export function Dialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Keep my ticket',
  onConfirm,
  onCancel,
  busy = false,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-3xl border bg-surface p-6 shadow-card"
      >
        <h3 className="text-xl font-black">{title}</h3>
        <div className="mt-3 text-sm leading-relaxed text-body">{children}</div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Cancelling…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
