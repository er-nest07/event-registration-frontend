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

export function formatAccraTime(iso: string): string {
  return accraTimeFormat.format(new Date(iso))
}

const accraDayNum = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', day: '2-digit' })
const accraMonthName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', month: 'long' })
const accraMonthShort = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', month: 'short' })
const accraMonthYear = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', month: 'long', year: 'numeric' })
const accraWeekdayName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', weekday: 'long' })

export function accraShortMonth(iso: string): string {
  return accraMonthShort.format(new Date(iso))
}

export function accraDateParts(iso: string): {
  day: string
  month: string
  monthYear: string
  weekday: string
} {
  const date = new Date(iso)
  return {
    day: accraDayNum.format(date),
    month: accraMonthName.format(date),
    monthYear: accraMonthYear.format(date),
    weekday: accraWeekdayName.format(date),
  }
}

export function formatAccraShort(iso: string): string {
  return `${accraDateFormat.format(new Date(iso))} · ${accraTimeFormat.format(new Date(iso))} Accra`
}

const accraDayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatAccraRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const sameDay = accraDayFormat.format(start) === accraDayFormat.format(end)
  if (sameDay) {
    return `${accraDayFormat.format(start)} · ${accraTimeFormat.format(start)}–${accraTimeFormat.format(end)} (Accra time, GMT)`
  }
  return `${accraDayFormat.format(start)}, ${accraTimeFormat.format(start)} – ${accraDayFormat.format(end)}, ${accraTimeFormat.format(end)} (Accra time, GMT)`
}

export function isHappeningNow(startsAt: string, endsAt: string): boolean {
  const now = Date.now()
  return new Date(startsAt).getTime() <= now && now <= new Date(endsAt).getTime()
}

const accraMonthYearShort = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  month: 'short',
  year: '2-digit',
})

const accraTodayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/** Compact month and two-digit year, e.g. "Oct 26". Used by the month index. */
export function accraShortMonthYear(iso: string): string {
  return accraMonthYearShort.format(new Date(iso))
}

/** Today's date in Accra, e.g. "Tue 14 Oct", with the timezone named. */
export function accraTodayLabel(): string {
  return `${accraTodayFormat.format(new Date())} (Accra time, GMT)`
}

/** Human wait until an event starts, e.g. "in 7 days". Past events read "started". */
export function untilInWords(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'started'
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `in ${hours} hour${hours === 1 ? '' : 's'}`
  const days = Math.round(hours / 24)
  return `in ${days} day${days === 1 ? '' : 's'}`
}
