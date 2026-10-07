import type { ApiResult } from './client'
import { DEMO_TICKET_CODES, checkedInTicket, cancelledTicket, fakeEndedEvent, fakeEvents, fakeQrDataUrl, fakeTicket } from '../data/fake'
import { isValidEmail, isValidGhanaPhone, normalizePhone } from '../lib/phone'
import type { FieldError, PublicEvent, RegisterRequest, Ticket } from './types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const events: PublicEvent[] = [...fakeEvents, fakeEndedEvent]
const tickets = new Map<string, Ticket>([
  [DEMO_TICKET_CODES.valid, fakeTicket],
  [DEMO_TICKET_CODES.checkedIn, checkedInTicket],
  [DEMO_TICKET_CODES.cancelled, cancelledTicket],
])
const registeredEmails = new Map<string, Set<string>>()

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data }
}

function fail(
  status: number,
  code: string,
  message: string,
  extra: { details?: FieldError[]; retryAfterSeconds?: number } = {},
): ApiResult<never> {
  void status
  return { ok: false, code, message, ...extra }
}

function randomCode(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function validateRegistration(body: unknown): { errors: FieldError[]; value: RegisterRequest } {
  const value = (body ?? {}) as Partial<RegisterRequest>
  const errors: FieldError[] = []

  const fullName = (value.fullName ?? '').trim()
  if (fullName.length < 2 || fullName.length > 100) {
    errors.push({ path: 'fullName', message: 'Please enter your full name (2–100 characters).' })
  }

  const email = (value.email ?? '').trim()
  if (!isValidEmail(email)) {
    errors.push({ path: 'email', message: 'Please enter a valid email address.' })
  }

  const phone = value.phone
  if (phone !== undefined && phone !== null && normalizePhone(String(phone)) !== '' && !isValidGhanaPhone(String(phone))) {
    errors.push({ path: 'phone', message: 'Please enter a valid Ghanaian mobile number, e.g. 024 123 4567.' })
  }

  return { errors, value: { fullName, email, ...(phone ? { phone: String(phone) } : {}) } }
}

export async function handleMock<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  await delay()
  const url = new URL(path, 'http://mock.local')
  const segments = url.pathname.split('/').filter(Boolean)

  if (method === 'GET' && segments[0] === 'api' && segments[1] === 'events' && segments.length === 2) {
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
    const published = events.filter((e) => !e.hasEnded)
    const start = (page - 1) * limit
    return ok<T>({
      data: published.slice(start, start + limit),
      meta: { page, limit, total: published.length, totalPages: Math.max(1, Math.ceil(published.length / limit)) },
    } as T)
  }

  if (method === 'GET' && segments[0] === 'api' && segments[1] === 'events' && segments[2]) {
    const id = segments[2]
    if (!UUID_RE.test(id)) return fail(400, 'VALIDATION_ERROR', 'Invalid event id') as ApiResult<T>
    const event = events.find((e) => e.id === id)
    if (!event || event.title.includes('(Draft)')) return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>
    return ok<T>(event as T)
  }

  if (method === 'POST' && segments[0] === 'api' && segments[1] === 'events' && segments[3] === 'register') {
    const event = events.find((e) => e.id === segments[2])
    if (!event) return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>

    const { errors, value } = validateRegistration(body)
    if (errors.length > 0) {
      return fail(400, 'VALIDATION_ERROR', 'Validation failed', { details: errors }) as ApiResult<T>
    }

    if (value.email.toLowerCase().startsWith('limit@')) {
      return {
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        retryAfterSeconds: 30,
      } as ApiResult<T>
    }

    if (event.hasEnded) return fail(409, 'EVENT_ENDED', 'Event has ended') as ApiResult<T>
    if (event.spotsLeft <= 0) return fail(409, 'EVENT_FULL', 'Event is full') as ApiResult<T>

    const key = `${event.id}`
    const emails = registeredEmails.get(key) ?? new Set<string>()
    if (emails.has(value.email.toLowerCase())) {
      return fail(409, 'ALREADY_REGISTERED', 'Already registered') as ApiResult<T>
    }

    const code = randomCode()
    tickets.set(code, {
      fullName: value.fullName,
      status: 'CONFIRMED',
      checkedInAt: null,
      qrUrl: fakeQrDataUrl(code),
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        hasEnded: event.hasEnded,
      },
    })
    emails.add(value.email.toLowerCase())
    registeredEmails.set(key, emails)
    event.spotsLeft -= 1

    return ok<T>({ ticketCode: code } as T)
  }

  if (method === 'POST' && segments[0] === 'api' && segments[1] === 'events' && segments[3] === 'resend') {
    const event = events.find((e) => e.id === segments[2])
    if (!event) return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>
    const email = (body as { email?: string } | undefined)?.email ?? ''
    if (!isValidEmail(email)) {
      return fail(400, 'VALIDATION_ERROR', 'Validation failed', {
        details: [{ path: 'email', message: 'Please enter a valid email address.' }],
      }) as ApiResult<T>
    }
    if (email.toLowerCase().startsWith('limit@')) {
      return { ok: false, code: 'RATE_LIMITED', message: 'Too many requests', retryAfterSeconds: 30 } as ApiResult<T>
    }
    return ok<T>({
      message: 'If that address is registered for this event, a new ticket is on its way. It may take a minute.',
    } as T)
  }

  if (segments[0] === 'api' && segments[1] === 'tickets' && segments[2]) {
    const code = segments[2]
    if (method === 'GET') {
      const ticket = tickets.get(code)
      if (!ticket) return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>
      return ok<T>(ticket as T)
    }
    if (method === 'DELETE') {
      const ticket = tickets.get(code)
      if (!ticket) return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>
      if (ticket.checkedInAt) return fail(409, 'ALREADY_CHECKED_IN', 'Already checked in') as ApiResult<T>
      tickets.set(code, { ...ticket, status: 'CANCELLED', qrUrl: null })
      return ok<T>(undefined as T)
    }
  }

  return fail(404, 'NOT_FOUND', 'Not found') as ApiResult<T>
}
