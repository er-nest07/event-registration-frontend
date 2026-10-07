const GH_PREFIXES = [
  '20',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '50',
  '53',
  '54',
  '55',
  '56',
  '57',
  '59',
]

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, '')
}

export function isValidGhanaPhone(raw: string): boolean {
  const value = normalizePhone(raw)
  let digits: string | null = null

  if (/^0\d{9}$/.test(value)) {
    digits = value.slice(1)
  } else if (/^\+233\d{9}$/.test(value)) {
    digits = value.slice(4)
  } else if (/^233\d{9}$/.test(value)) {
    digits = value.slice(3)
  }

  if (!digits) return false
  return GH_PREFIXES.includes(digits.slice(0, 2))
}

export function isValidEmail(value: string): boolean {
  if (value.length > 254) return false
  const at = value.indexOf('@')
  if (at < 1 || at !== value.lastIndexOf('@')) return false
  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  return local.length >= 1 && domain.length >= 3 && domain.includes('.')
}
