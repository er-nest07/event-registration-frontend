import { request } from './client'
import type { CheckInResult, EndpointErrorCodes } from './types'

/**
 * Door check-in. The check-in key is a separate secret from the admin key and
 * must only ever live in memory on the scanner page. Never log it.
 */
export function checkIn(eventId: string, ticketCode: string, checkInKey: string) {
  return request<CheckInResult, EndpointErrorCodes['checkIn']>(
    'POST',
    `/api/admin/events/${eventId}/check-in`,
    { body: { ticketCode }, headers: { 'x-api-key': checkInKey } },
  )
}
