import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'

const attempts = new Map<string, { count: number; resetAt: number }>()
let nextSweepAt = 0

export function enforceRateLimit(event: H3Event, scope: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (now >= nextSweepAt) {
    nextSweepAt = now + 60 * 1000
    for (const [key, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(key)
    }
  }
  const key = `${scope}:${getRequestIP(event, { xForwardedFor: true }) || 'unknown'}`
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (current.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again later.' })
  }

  current.count += 1
}
