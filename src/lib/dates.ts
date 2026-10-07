const accraFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const accraTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const accraDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatAccra(iso: string): string {
  return `${accraFormat.format(new Date(iso))} (Accra time, GMT)`
}

export function formatAccraClock(iso: string): string {
  return `${accraTimeFormat.format(new Date(iso))} (Accra time, GMT)`
}

export function formatAccraShort(iso: string): string {
  return `${accraDateFormat.format(new Date(iso))} · ${accraTimeFormat.format(new Date(iso))} Accra`
}

export function isHappeningNow(startsAt: string, endsAt: string): boolean {
  const now = Date.now()
  return new Date(startsAt).getTime() <= now && now <= new Date(endsAt).getTime()
}
