import { describe, expect, it, vi } from 'vitest'
import { useApi } from '../useApi'
import { normalizeError } from '@/api/errors'

describe('useApi', () => {
  it('starts idle and resolves into data', async () => {
    const fetcher = vi.fn<() => Promise<number[]>>().mockResolvedValue([1, 2, 3])
    const { data, loading, error, execute } = useApi(fetcher)
    expect(data.value).toBeUndefined()
    expect(loading.value).toBe(false)

    await execute()
    expect(data.value).toEqual([1, 2, 3])
    expect(loading.value).toBe(false)
    expect(error.value).toBeUndefined()
  })

  it('runs immediately when asked', async () => {
    const fetcher = vi.fn<() => Promise<string>>().mockResolvedValue('x')
    const { data } = useApi(fetcher, { immediate: true })
    await vi.waitFor(() => expect(data.value).toBe('x'))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('captures a normalized error and falls back', async () => {
    const fetcher = vi.fn<() => Promise<never>>().mockRejectedValue({ code: 500, message: 'boom', retryable: true })
    const { data, error, execute } = useApi(fetcher, { fallback: [] })
    await execute()
    expect(data.value).toEqual([])
    expect(error.value?.message).toBe('boom')
    expect(error.value?.retryable).toBe(true)
  })

  it('keeps the previous data when useFallbackOnError is set', async () => {
    const fetcher = vi
      .fn<() => Promise<{ ok: boolean }>>()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error('nope'))
    const { data, execute } = useApi(fetcher, { fallback: { ok: false }, useFallbackOnError: true })
    await execute()
    expect(data.value).toEqual({ ok: true })
    await execute()
    expect(data.value).toEqual({ ok: true })
  })

  it('reset returns to the initial state', async () => {
    const { data, error, reset } = useApi(vi.fn<() => Promise<number>>().mockResolvedValue(1), { fallback: 0 })
    reset()
    expect(data.value).toBe(0)
    expect(error.value).toBeUndefined()
  })
})

describe('normalizeError', () => {
  it('marks 5xx and network failures retryable', () => {
    expect(normalizeError({ response: { status: 502, data: {} }, isAxiosError: true }).retryable).toBe(true)
    expect(normalizeError({ code: 'ECONNABORTED', isAxiosError: true, message: 'timeout' }).retryable).toBe(true)
  })

  it('does not retry a 400', () => {
    const error = normalizeError({
      isAxiosError: true,
      response: { status: 400, data: { code: 10400, message: '参数错误' } },
    })
    expect(error.code).toBe(10400)
    expect(error.retryable).toBe(false)
  })
})
