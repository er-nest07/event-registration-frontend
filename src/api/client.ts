import type { ApiErrorBody, FieldError } from './types'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/+$/,
  '',
) ?? 'http://localhost:3000'

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      code: string
      message: string
      details?: FieldError[]
      retryAfterSeconds?: number
    }

export function absoluteUrl(path: string): string {
  if (/^(https?:|data:)/i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export function fieldErrors(result: Extract<ApiResult<unknown>, { ok: false }>): FieldError[] {
  return Array.isArray(result.details) ? result.details : []
}

async function parseBody(res: Response): Promise<unknown> {
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const { method = 'GET', body } = init

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (USE_MOCKS) {
    const { handleMock } = await import('./mock')
    return handleMock<T>(method, path, body)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', message: 'Network error' }
  }

  if (res.status === 204) return { ok: true, data: undefined as T }

  const parsed = await parseBody(res)

  if (res.ok) {
    if (parsed === null || typeof parsed !== 'object' || !('data' in parsed)) {
      return { ok: false, code: 'UNEXPECTED_RESPONSE', message: 'Unexpected response' }
    }
    return { ok: true, data: (parsed as { data: T }).data }
  }

  const retryAfter = Number(res.headers.get('retry-after'))
  const err = parsed && typeof parsed === 'object' ? (parsed as ApiErrorBody).error : undefined

  if (!err || typeof err.code !== 'string') {
    return {
      ok: false,
      code: `HTTP_${res.status}`,
      message: 'Unexpected response',
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    }
  }

  const hasRetryAfter = Number.isFinite(retryAfter) && retryAfter > 0
  return {
    ok: false,
    code: err.code,
    message: err.message,
    details: err.details,
    retryAfterSeconds: err.code === 'RATE_LIMITED' ? (hasRetryAfter ? retryAfter : 60) : hasRetryAfter ? retryAfter : undefined,
  }
}
