import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { absoluteUrl } from '../api/client'
import { cancelTicket, getTicket } from '../api/tickets'
import type { Ticket } from '../api/types'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { CheckIcon, DownloadIcon, MailIcon, PrinterIcon, TicketIcon } from '../components/ui/icons'
import { formatAccra, formatAccraClock } from '../lib/dates'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notFound' }
  | { status: 'ready'; ticket: Ticket }

export function TicketPage() {
  const { code = '' } = useParams()
  const location = useLocation()
  const fromRegistration = Boolean((location.state as { fromRegistration?: boolean } | null)?.fromRegistration)

  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    const result = await getTicket(code)
    if (result.ok) setState({ status: 'ready', ticket: result.data })
    else if (result.code === 'NOT_FOUND') setState({ status: 'notFound' })
    else setState({ status: 'error' })
  }, [code])

  useEffect(() => {
    void load()
  }, [load, attempt])

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  async function onConfirmCancel() {
    setCancelling(true)
    setCancelError(null)
    const result = await cancelTicket(code)
    setCancelling(false)

    if (result.ok) {
      setDialogOpen(false)
      await load()
      return
    }
    if (result.code === 'ALREADY_CHECKED_IN') {
      setDialogOpen(false)
      setCancelError("This ticket has already been used and can't be cancelled.")
      await load()
      return
    }
    setCancelError('Something went wrong. Please try again.')
  }

  async function onDownloadQr() {
    if (state.status !== 'ready') return
    const qr = state.ticket.qrUrl
    if (!qr) return
    setDownloadError(null)
    try {
      const res = await fetch(absoluteUrl(qr))
      if (!res.ok) throw new Error('bad response')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ticket-qr.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError("Couldn't download the QR code. Try a screenshot instead.")
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="mt-6 rounded-3xl border p-6">
          <Skeleton className="mx-auto aspect-square w-56" />
          <Skeleton className="mx-auto mt-5 h-5 w-40" />
          <Skeleton className="mt-6 h-5 w-full" />
          <Skeleton className="mt-3 h-5 w-3/4" />
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <ErrorState
          message="We couldn't load your ticket. Check your connection and try again."
          onRetry={() => setAttempt((a) => a + 1)}
        />
      </div>
    )
  }

  if (state.status === 'notFound') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-inset text-body">
          <TicketIcon />
        </span>
        <h1 className="mt-5 text-2xl">We couldn't find this ticket.</h1>
        <p className="mt-3 text-body">
          The link may be wrong, or the ticket was replaced by a new registration.
        </p>
        <Link to="/resend" className="mt-6 inline-block">
          <Button>Resend my ticket</Button>
        </Link>
      </div>
    )
  }

  const { ticket } = state
  const checkedIn = Boolean(ticket.checkedInAt)
  const cancelled = ticket.status === 'CANCELLED'
  const ended = ticket.event.hasEnded

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      {fromRegistration && !cancelled && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green/30 bg-green-soft px-4 py-3 text-sm font-semibold text-green">
          <MailIcon width={18} height={18} className="mt-0.5 shrink-0" />
          Check your email for your ticket. It may take a minute to arrive.
        </div>
      )}

      <div id="print-area" className="rounded-3xl border bg-surface-raised p-6 shadow-card sm:p-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-brand">Your ticket</p>
          <h1 className="mt-2 text-2xl sm:text-3xl">{ticket.fullName}</h1>
          <p className="mt-1 font-heading text-lg font-black text-heading">{ticket.event.title}</p>
        </div>

        <div className="mt-5 space-y-1.5 text-center text-sm text-body">
          <p>{formatAccra(ticket.event.startsAt)}</p>
          <p>{ticket.event.venue}</p>
        </div>

        {cancelled ? (
          <div className="mt-6 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-6 text-center">
            <p className="font-heading text-lg font-black text-danger">This ticket was cancelled.</p>
            <Link
              to={`/events/${ticket.event.id}`}
              className="mt-3 inline-block text-sm font-bold text-brand hover:underline"
            >
              View the event
            </Link>
          </div>
        ) : checkedIn ? (
          <div className="mt-6 rounded-2xl border border-green/30 bg-green-soft px-4 py-6 text-center">
            <p className="flex items-center justify-center gap-2 font-heading text-lg font-black text-green">
              <CheckIcon width={20} height={20} />
              Checked in
            </p>
            <p className="mt-1 text-sm text-green">at {formatAccraClock(ticket.checkedInAt!)}</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            {ticket.qrUrl && (
              <img
                src={absoluteUrl(ticket.qrUrl)}
                alt="Ticket QR code"
                className={`aspect-square w-56 rounded-2xl border bg-white p-2 ${ended ? 'opacity-40' : ''}`}
                width={224}
                height={224}
              />
            )}
            <p className="mt-3 font-mono text-lg font-bold tracking-widest text-heading">{code}</p>
            <p className="mt-1 text-xs text-soft">Show this code or the QR at the door.</p>
          </div>
        )}

        {ended && !cancelled && (
          <div className="mt-5 rounded-2xl bg-surface-inset px-4 py-3 text-center text-sm font-bold text-body">
            This event has ended
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-soft">
        Keep this page private — anyone with this link can use your ticket.
      </p>

      {!cancelled && !checkedIn && (
        <div className="no-print mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={() => window.print()}>
            <PrinterIcon width={16} height={16} />
            Print / save as PDF
          </Button>
          <Button variant="secondary" onClick={() => void onDownloadQr()} disabled={!ticket.qrUrl}>
            <DownloadIcon width={16} height={16} />
            Download QR
          </Button>
        </div>
      )}

      {downloadError && (
        <p role="alert" className="no-print mt-3 text-center text-sm font-semibold text-danger">
          {downloadError}
        </p>
      )}

      {cancelError && (
        <p role="alert" className="no-print mt-3 text-center text-sm font-semibold text-danger">
          {cancelError}
        </p>
      )}

      {!cancelled && !checkedIn && (
        <div className="no-print mt-8 border-t pt-6 text-center">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="text-sm font-bold text-danger transition-opacity hover:opacity-70"
          >
            Cancel my ticket
          </button>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        title="Cancel your ticket?"
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep my ticket"
        busy={cancelling}
        onConfirm={() => void onConfirmCancel()}
        onCancel={() => setDialogOpen(false)}
      >
        This frees your spot and the QR code stops working. You can register again, but you will get
        a new ticket.
      </Dialog>
    </div>
  )
}
