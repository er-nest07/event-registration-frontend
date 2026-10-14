import { request } from './client'
import type {
  EndpointErrorCodes,
  RegisterRequest,
  RegisterResult,
  ResendResult,
  Ticket,
} from './types'

export function register(id: string, body: RegisterRequest) {
  return request<RegisterResult, EndpointErrorCodes['register']>('POST', `/api/events/${id}/register`, {
    body,
  })
}

export function getTicket(code: string) {
  return request<Ticket, EndpointErrorCodes['getTicket']>(
    'GET',
    `/api/tickets/${encodeURIComponent(code)}`,
  )
}

export function cancelTicket(code: string) {
  return request<void, EndpointErrorCodes['cancelTicket']>(
    'DELETE',
    `/api/tickets/${encodeURIComponent(code)}`,
  )
}

export function resendTicket(id: string, email: string) {
  return request<ResendResult, EndpointErrorCodes['resend']>('POST', `/api/events/${id}/resend`, {
    body: { email },
  })
}
