/**
 * Typed environment configuration.
 *
 * One place where `import.meta.env` is read. Everything else imports `env`, so
 * a missing or malformed variable fails once at startup instead of returning
 * `undefined` deep inside a request handler.
 */
import { z } from 'zod'

/** Accepts "true"/"1" as true; anything else (including unset) as false. */
const booleanish = z
  .enum(['true', 'false', '1', '0', ''])
  .default('false')
  .transform((value) => value === 'true' || value === '1')

const schema = z.object({
  /** e.g. "/api" — empty means same-origin. */
  apiBaseUrl: z.string().default('/api'),
  /** Request timeout for the axios instance, in milliseconds. */
  apiTimeout: z.coerce.number().int().positive().default(15_000),
  /** Shown in the header; lets a deploy identify its own environment. */
  appTitle: z.string().default('Console'),
  /** Enables msw or a local stub layer when true. */
  useMock: booleanish,
  /** Log level for the small logger in src/utils/logger.ts. */
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof schema>

function read(): Env {
  const parsed = schema.safeParse({
    apiBaseUrl: import.meta.env['VITE_API_BASE_URL'],
    apiTimeout: import.meta.env['VITE_API_TIMEOUT'],
    appTitle: import.meta.env['VITE_APP_TITLE'],
    useMock: import.meta.env['VITE_USE_MOCK'],
    logLevel: import.meta.env['VITE_LOG_LEVEL'],
  })

  if (!parsed.success) {
    // Fail loudly at boot: a half-configured environment produces bugs that
    // only show up as empty screens hours later.
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    throw new Error(`Invalid environment:\n${problems.join('\n')}`)
  }

  return parsed.data
}

export const env: Env = read()
