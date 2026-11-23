/** Tiny leveled logger. Silent in tests, structured in the browser console. */
import { env } from '@/config/env'

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const
type Level = keyof typeof LEVELS

const threshold = import.meta.env.MODE === 'test' ? LEVELS.error : LEVELS[env.logLevel]

function emit(level: Level, message: string, context?: Record<string, unknown>): void {
  if (LEVELS[level] < threshold) return
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  // One argument plus context keeps the console collapsed by default.
  if (context === undefined) sink(`[${level}] ${message}`)
  else sink(`[${level}] ${message}`, context)
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emit('error', message, context),
}
