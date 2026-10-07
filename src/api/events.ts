import { request } from './client'
import type { EventListResponse, PublicEvent } from './types'

export function listEvents(page = 1, limit = 20) {
  return request<EventListResponse>(`/api/events?page=${page}&limit=${limit}`)
}

export function getEvent(id: string) {
  return request<PublicEvent>(`/api/events/${id}`)
}
