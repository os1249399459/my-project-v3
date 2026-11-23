/**
 * Axios client with a typed envelope.
 *
 * The original project re-implemented interceptors per call site and returned
 * raw responses. Everything here goes through one instance and one unwrapping
 * rule, so a new endpoint cannot accidentally invent a second error shape.
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { logger } from '@/utils/logger'
import { normalizeError, type ApiError } from './errors'

/** Server contract: every response carries these four fields. */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  traceId?: string
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set to true to resolve with the full envelope instead of `data`. */
    raw?: boolean
    /** Suppresses the global error toast for expected failures. */
    silent?: boolean
  }
}

function attachToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

function onRejected(error: unknown): Promise<never> {
  return Promise.reject(normalizeError(error))
}

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use(attachToken, onRejected)

// The interceptor unwraps the envelope, so the runtime shape is no longer an
// AxiosResponse. That mismatch is intentional and contained here: callers go
// through `request<T>()`, which casts once.
http.interceptors.response.use((response: AxiosResponse) => {
  const body = response.data as ApiEnvelope<unknown> | undefined
  // A non-enveloped payload (a file, a proxy health check) passes through
  // untouched rather than being misread as `{ code: undefined }`.
  if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
    if (body.code !== 0) {
      logger.warn('api: non-zero business code', { code: body.code, message: body.message })
      return Promise.reject(normalizeError({ response: { data: body } }))
    }
    return (response.config.raw ? response : body.data) as AxiosResponse
  }
  return response
}, onRejected)

/**
 * Thin typed wrapper — the only way pages should call the API.
 * The cast is the single place where "the interceptor already unwrapped it"
 * is asserted, instead of in every caller.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  return (await http.request(config)) as T
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: 'GET' }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, data, method: 'POST' }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, data, method: 'PUT' }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: 'DELETE' }),
}

export type { ApiError }
