/** One normalized error shape for the whole app. */
import { isAxiosError } from 'axios'

export interface ApiError {
  /** Business or HTTP status. `0` means "no response" (network/timeout). */
  code: number
  message: string
  /** Present when the server sent one; useful for support tickets. */
  traceId?: string
  /** True when retrying the same call could plausibly succeed. */
  retryable: boolean
}

const FALLBACK = '请求失败，请稍后重试'

export function normalizeError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const body = error.response?.data as { code?: number; message?: string; traceId?: string } | undefined
    const timedOut = error.code === 'ECONNABORTED'
    return {
      code: typeof body?.code === 'number' ? body.code : status,
      message: body?.message ?? (timedOut ? '请求超时' : error.message) ?? FALLBACK,
      ...(body?.traceId ? { traceId: body.traceId } : {}),
      retryable: status >= 500 || status === 429 || status === 0,
    }
  }

  if (error instanceof Error) {
    return { code: 0, message: error.message || FALLBACK, retryable: false }
  }

  return { code: 0, message: FALLBACK, retryable: false }
}

/** Type guard for templates that branch on a caught value. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'retryable' in value
  )
}
