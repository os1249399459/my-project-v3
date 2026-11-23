/**
 * useApi — one composable for loading/error/data around a single request.
 *
 * Every page needs the same four things, and re-deriving them per page is how
 * the old project ended up with three subtly different loading flags.
 */
import { ref, shallowRef, type Ref } from 'vue'
import { isApiError, normalizeError, type ApiError } from '@/api/errors'
import { logger } from '@/utils/logger'

export interface UseApiOptions<T> {
  /** Run once on setup. Default false. */
  immediate?: boolean
  /** Data used when the request fails and `useFallback` is set. */
  fallback?: T
  /** Keep `fallback` on error instead of clearing data. */
  useFallbackOnError?: boolean
}

export interface UseApiResult<T> {
  data: Ref<T | undefined>
  loading: Ref<boolean>
  error: Ref<ApiError | undefined>
  execute: () => Promise<T | undefined>
  reset: () => void
}

export function useApi<T>(fetcher: () => Promise<T>, options: UseApiOptions<T> = {}): UseApiResult<T> {
  const data = shallowRef<T | undefined>(options.fallback)
  const loading = ref(false)
  const error = ref<ApiError | undefined>()

  async function execute(): Promise<T | undefined> {
    loading.value = true
    error.value = undefined
    try {
      const result = await fetcher()
      data.value = result
      return result
    } catch (cause) {
      const normalized = isApiError(cause) ? cause : normalizeError(cause)
      error.value = normalized
      logger.warn('api call failed', { code: normalized.code, message: normalized.message })
      if (!options.useFallbackOnError) data.value = options.fallback
      return undefined
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = options.fallback
    error.value = undefined
    loading.value = false
  }

  if (options.immediate === true) void execute()

  return { data, loading, error, execute, reset }
}
