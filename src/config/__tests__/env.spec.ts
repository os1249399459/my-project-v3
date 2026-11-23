import { describe, expect, it, vi, afterEach } from 'vitest'

/**
 * env.ts validates at import time, so each case needs a fresh module registry
 * with a different import.meta.env. vi.resetModules + stubEnv is the only way.
 */
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('env', () => {
  it('applies defaults when nothing is set', async () => {
    vi.resetModules()
    const { env } = await import('../env')
    expect(env.apiBaseUrl).toBe('/api')
    expect(env.apiTimeout).toBe(15_000)
    expect(env.useMock).toBe(false)
    expect(env.logLevel).toBe('info')
  })

  it('reads overrides', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.stubEnv('VITE_API_TIMEOUT', '3000')
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const { env } = await import('../env')
    expect(env.apiBaseUrl).toBe('https://api.example.com')
    expect(env.apiTimeout).toBe(3_000)
    expect(env.useMock).toBe(true)
  })

  it('rejects a malformed timeout at boot instead of returning NaN', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_TIMEOUT', 'soon')
    await expect(import('../env')).rejects.toThrow(/Invalid environment/)
  })
})
