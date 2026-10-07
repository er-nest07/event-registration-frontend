export interface PublicEvent {
  id: string
  title: string
  description: string
  venue: string
  startsAt: string
  endsAt: string
  bannerUrl: string | null
  spotsLeft: number
  hasEnded: boolean
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface EventListResponse {
  data: PublicEvent[]
  meta: PageMeta
}

export interface TicketEvent {
  id: string
  title: string
  venue: string
  startsAt: string
  endsAt: string
  hasEnded: boolean
}

export type TicketStatus = 'CONFIRMED' | 'CANCELLED'

export interface Ticket {
  fullName: string
  status: TicketStatus
  checkedInAt: string | null
  qrUrl: string | null
  event: TicketEvent
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone?: string
}

export interface RegisterResponse {
  ticketCode: string
}

export interface ResendResponse {
  message: string
}

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
