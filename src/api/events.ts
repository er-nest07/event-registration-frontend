import { request } from './client'
import type { EndpointErrorCodes, PublicEvent } from './types'

export function listEvents(page = 1, limit = 20, q?: string) {
  const search = q ? `&q=${encodeURIComponent(q)}` : ''
  return request<PublicEvent[], EndpointErrorCodes['listEvents']>(
    'GET',
    `/api/events?page=${page}&limit=${limit}${search}`,
  )
}

export function getEvent(id: string) {
  return request<PublicEvent, EndpointErrorCodes['getEvent']>('GET', `/api/events/${id}`)
}
