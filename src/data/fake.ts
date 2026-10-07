import type { PublicEvent, Ticket } from '../api/types'

export function fakeQrDataUrl(seed: string): string {
  let h = 2166136261
  for (const ch of seed) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  const next = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  const n = 21
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  let rects = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue
      if (next() > 0.55) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`
    }
  }
  const finder = (cx: number, cy: number) =>
    `<rect x="${cx}" y="${cy}" width="7" height="7" fill="none" stroke="#000" stroke-width="1"/><rect x="${cx + 2}" y="${cy + 2}" width="3" height="3"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><g fill="#000">${rects}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const now = Date.now()
const hour = 3_600_000

export const fakeEvents: PublicEvent[] = [
  {
    id: 'a1f1e5f0-0000-4000-8000-000000000001',
    title: 'Accra Developer Meetup',
    description:
      'An evening of lightning talks, demos and networking with developers from across Accra.\n\nBring your laptop, your questions and your business cards. Snacks and drinks provided.',
    venue: 'CSIR Conference Hall, Accra',
    startsAt: new Date(now + 5 * 24 * hour).toISOString(),
    endsAt: new Date(now + 5 * 24 * hour + 4 * hour).toISOString(),
    bannerUrl: null,
    spotsLeft: 42,
    hasEnded: false,
  },
  {
    id: 'a1f1e5f0-0000-4000-8000-000000000002',
    title: 'CSS Hackathon Kickoff',
    description:
      'We are live right now! Drop in, pick a team and start building.\n\nMentors, pizza and prizes on site all day.',
    venue: 'Ashesi Innovation Lab',
    startsAt: new Date(now - 1 * hour).toISOString(),
    endsAt: new Date(now + 7 * hour).toISOString(),
    bannerUrl: null,
    spotsLeft: 8,
    hasEnded: false,
  },
  {
    id: 'a1f1e5f0-0000-4000-8000-000000000003',
    title: 'Sold-Out Design Workshop',
    description:
      'A hands-on workshop on interface design fundamentals for developers.\n\nAll seats have been taken for this session.',
    venue: 'KNUST Senior Hall, Kumasi',
    startsAt: new Date(now + 12 * 24 * hour).toISOString(),
    endsAt: new Date(now + 12 * 24 * hour + 3 * hour).toISOString(),
    bannerUrl: null,
    spotsLeft: 0,
    hasEnded: false,
  },
]

export const fakeEndedEvent: PublicEvent = {
  id: 'a1f1e5f0-0000-4000-8000-000000000004',
  title: 'Algorithms Study Circle (past)',
  description: 'This session has already finished.',
  venue: 'University Library, Kumasi',
  startsAt: new Date(now - 10 * 24 * hour).toISOString(),
  endsAt: new Date(now - 10 * 24 * hour + 2 * hour).toISOString(),
  bannerUrl: null,
  spotsLeft: 0,
  hasEnded: true,
}

export const fakeTicket: Ticket = {
  fullName: 'Ama Mensah',
  status: 'CONFIRMED',
  checkedInAt: null,
  qrUrl: fakeQrDataUrl('demo-ticket-code'),
  event: {
    id: fakeEvents[0].id,
    title: fakeEvents[0].title,
    venue: fakeEvents[0].venue,
    startsAt: fakeEvents[0].startsAt,
    endsAt: fakeEvents[0].endsAt,
    hasEnded: false,
  },
}

export const checkedInTicket: Ticket = {
  ...fakeTicket,
  fullName: 'Kwesi Boateng',
  checkedInAt: new Date(now - 30 * 60_000).toISOString(),
}

export const cancelledTicket: Ticket = {
  ...fakeTicket,
  fullName: 'Efua Asante',
  status: 'CANCELLED',
  qrUrl: null,
}

export const DEMO_TICKET_CODES = {
  valid: 'demo-ticket-code',
  checkedIn: 'demo-checked-in-code',
  cancelled: 'demo-cancelled-code',
}
