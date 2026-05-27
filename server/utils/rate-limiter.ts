import { createError, getRequestIP, setResponseHeader, setResponseHeaders } from 'h3'
import type { H3Event } from 'h3'

export interface RateLimiterConfig {
  maxAttempts: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxAttempts: Number(process.env.NETCOREOPS_RATE_LIMIT_MAX) || 5,
  windowMs: Number(process.env.NETCOREOPS_RATE_LIMIT_WINDOW_MS) || 60_000
}

function loadConfig(overrides?: Partial<RateLimiterConfig>): RateLimiterConfig {
  return { ...DEFAULT_CONFIG, ...overrides }
}

const store = new Map<string, number[]>()
let lastCleanup = 0
const CLEANUP_INTERVAL_MS = 60_000

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, timestamps] of store) {
    const fresh = timestamps.filter(t => now - t < DEFAULT_CONFIG.windowMs)
    if (fresh.length > 0) {
      store.set(key, fresh)
    } else {
      store.delete(key)
    }
  }
}

function getClientKey(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || event.node?.req?.socket?.remoteAddress || 'unknown'
}

export function checkRateLimit(event: H3Event, overrides?: Partial<RateLimiterConfig>) {
  const config = loadConfig(overrides)
  const key = getClientKey(event)
  const now = Date.now()

  cleanup()

  const timestamps = store.get(key) || []
  const windowStart = now - config.windowMs
  const recent = timestamps.filter(t => t > windowStart)
  const remaining = Math.max(0, config.maxAttempts - recent.length)
  const oldestRecent = recent.length > 0 ? Math.min(...recent) : now
  const resetS = Math.ceil((config.windowMs - (now - oldestRecent + 1)) / 1000)

  setResponseHeaders(event, {
    'X-RateLimit-Limit': String(config.maxAttempts),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetS)
  })

  if (recent.length >= config.maxAttempts) {
    setResponseHeader(event, 'Retry-After', resetS)
    throw createError({
      statusCode: 429,
      statusMessage: 'Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.'
    })
  }

  recent.push(now)
  store.set(key, recent)
}
