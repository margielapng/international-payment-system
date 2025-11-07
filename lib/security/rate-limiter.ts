interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export const rateLimitConfigs = {
  login: { maxAttempts: 10, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  register: { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  transaction: { maxAttempts: 100, windowMs: 15 * 60 * 1000 },
  api: { maxAttempts: 100, windowMs: 15 * 60 * 1000 },
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (entry.blocked && now < entry.resetTime) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  if (entry.count >= config.maxAttempts) {
    entry.blocked = true
    entry.resetTime = now + (config.blockDurationMs || config.windowMs)
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
  }
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 60 * 1000)
