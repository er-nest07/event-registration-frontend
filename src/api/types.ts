/**
 * Types copied from the backend reference (docs/frontend/types.ts in
 * CSS-Developers/event-registration, branch feat/backend-core). The backend is
 * the source of truth; keep these in sync with it rather than with this app.
 */

/** ISO 8601 date-time in UTC, e.g. "2026-10-21T18:00:00.000Z". */
export type IsoDateTime = string

/** A UUID. Event ids are UUIDs; a malformed id is a 400 VALIDATION_ERROR. */
export type EventId = string

/** 32 URL-safe characters. A secret credential: never log it. */
export type TicketCode = string

/** Success wrapper for a single object: { data }. */
export interface ApiResponse<T> {
  data: T
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Success wrapper for a list: { data, meta }. */
export interface ApiListResponse<T> {
  data: T[]
  meta: PageMeta
}

/** One entry of error.details on a 400 VALIDATION_ERROR. `path` is "" for a body-level problem. */
export interface FieldError {
  path: string
  message: string
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: FieldError[]
  }
}

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export type PublicErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'NOT_FOUND'
  | 'ALREADY_REGISTERED'
  | 'EVENT_FULL'
  | 'EVENT_ENDED'
  | 'ALREADY_CHECKED_IN'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export type ScannerErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'TICKET_NOT_FOUND'
  | 'WRONG_EVENT'
  | 'TICKET_CANCELLED'
  | 'ALREADY_CHECKED_IN'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export type ApiErrorCode = PublicErrorCode | ScannerErrorCode

// ---------------------------------------------------------------------------
// Events (public)
// ---------------------------------------------------------------------------

export interface PublicEvent {
  id: EventId
  title: string
  description: string
  /** null when absent; relative with the local driver, absolute with Cloudinary. */
  bannerUrl: string | null
  venue: string
  startsAt: IsoDateTime
  endsAt: IsoDateTime
  capacity: number
  /** Live count, never below 0. 0 means sold out. */
  spotsLeft: number
  /** Server-computed: true once endsAt is in the past. Never recompute locally. */
  hasEnded: boolean
}

export interface ListEventsQuery {
  page?: number
  limit?: number
  /** 1-100 characters. Case-insensitive match on title or venue. A blank value is ignored. */
  q?: string
}

export type ListEventsResponse = ApiListResponse<PublicEvent>
export type GetEventResponse = ApiResponse<PublicEvent>

/** Event fields repeated on tickets. */
export interface EventSummary {
  id: EventId
  title: string
  venue: string
  startsAt: IsoDateTime
  endsAt: IsoDateTime
  hasEnded: boolean
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  fullName: string
  email: string
  phone?: string
}

export type TicketStatus = 'CONFIRMED' | 'CANCELLED'

/** POST /api/events/:id/register -> 201. Contains the secret ticket code. */
export interface RegisterResult {
  ticketCode: TicketCode
  status: TicketStatus
  fullName: string
  email: string
  /** Relative: "/api/tickets/<code>/qr.png". Prefix with the API origin. */
  qrUrl: string
  event: EventSummary
}
export type RegisterResponse = ApiResponse<RegisterResult>

// ---------------------------------------------------------------------------
// Ticket
// ---------------------------------------------------------------------------

export interface Ticket {
  status: TicketStatus
  fullName: string
  checkedInAt: IsoDateTime | null
  /** null when status is "CANCELLED". */
  qrUrl: string | null
  event: EventSummary
}
export type GetTicketResponse = ApiResponse<Ticket>

export type CancelTicketResponse = undefined

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

export interface ResendRequest {
  email: string
}

export interface ResendResult {
  message: string
}
export type ResendResponse = ApiResponse<ResendResult>

// ---------------------------------------------------------------------------
// Door scanner
// ---------------------------------------------------------------------------

export interface CheckInRequest {
  ticketCode: string
}

export interface CheckInResult {
  fullName: string
  checkedInAt: IsoDateTime
}
export type CheckInResponse = ApiResponse<CheckInResult>

export interface AlreadyCheckedInDetails {
  fullName: string
  checkedInAt: IsoDateTime | null
}

// ---------------------------------------------------------------------------
// Error codes each call can return, for exhaustive handling.
// ---------------------------------------------------------------------------

export interface EndpointErrorCodes {
  listEvents: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  getEvent: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  register:
    | 'VALIDATION_ERROR'
    | 'INVALID_JSON'
    | 'PAYLOAD_TOO_LARGE'
    | 'NOT_FOUND'
    | 'EVENT_ENDED'
    | 'ALREADY_REGISTERED'
    | 'EVENT_FULL'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR'
  getTicket: 'NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  cancelTicket: 'NOT_FOUND' | 'ALREADY_CHECKED_IN' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  resend: 'VALIDATION_ERROR' | 'INVALID_JSON' | 'PAYLOAD_TOO_LARGE' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
  checkIn: ScannerErrorCode
}
