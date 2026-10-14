import type { ApiErrorBody, ApiErrorCode, FieldError, PageMeta } from './types'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/+$/,
  '',
) ?? 'http://localhost:3000'

export type ApiResult<T, C extends string = ApiErrorCode> =
  | { ok: true; status: number; data: T; meta?: PageMeta }
  | {
      ok: false
      status: number
      code: C | 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE'
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

export async function request<T, C extends string = ApiErrorCode>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  init: { body?: unknown; headers?: Record<string, string> } = {},
): Promise<ApiResult<T, C>> {
  const headers: Record<string, string> = { ...init.headers }
  // Only send Content-Type when there is a body: a header-less GET skips the CORS preflight.
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR', message: 'Could not reach the server' }
  }

  if (res.status === 204) return { ok: true, status: 204, data: undefined as T }

  const parsed = await parseBody(res)

  if (res.ok) {
    if (parsed === null || typeof parsed !== 'object' || !('data' in parsed)) {
      return {
        ok: false,
        status: res.status,
        code: 'UNEXPECTED_RESPONSE',
        message: 'Unexpected response',
      }
    }
    const body = parsed as { data: T; meta?: PageMeta }
    return { ok: true, status: res.status, data: body.data, meta: body.meta }
  }

  const retryAfter = Number(res.headers.get('retry-after'))
  const err = parsed && typeof parsed === 'object' ? (parsed as ApiErrorBody).error : undefined

  if (!err || typeof err.code !== 'string') {
    return {
      ok: false,
      status: res.status,
      code: 'UNEXPECTED_RESPONSE',
      message: 'Unexpected response',
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    }
  }

  const hasRetryAfter = Number.isFinite(retryAfter) && retryAfter > 0
  return {
    ok: false,
    status: res.status,
    code: err.code as C,
    message: err.message,
    details: err.details,
    retryAfterSeconds:
      err.code === 'RATE_LIMITED'
        ? hasRetryAfter
          ? retryAfter
          : 60
        : hasRetryAfter
          ? retryAfter
          : undefined,
  }
}
