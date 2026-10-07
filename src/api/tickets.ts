import { request } from './client'
import type { RegisterRequest, RegisterResponse, ResendResponse, Ticket } from './types'

export function register(id: string, body: RegisterRequest) {
  return request<RegisterResponse>(`/api/events/${id}/register`, { method: 'POST', body })
}

export function getTicket(code: string) {
  return request<Ticket>(`/api/tickets/${code}`)
}

export function cancelTicket(code: string) {
  return request<void>(`/api/tickets/${code}`, { method: 'DELETE' })
}

export function resendTicket(id: string, email: string) {
  return request<ResendResponse>(`/api/events/${id}/resend`, { method: 'POST', body: { email } })
}
