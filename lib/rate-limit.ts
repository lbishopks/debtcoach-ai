/**
 * In-process sliding-window rate limiter.
 *
 * Suitable for a single Railway instance. If you scale to multiple
 * instances in future, replace with Upstash Redis rate limiting.
 *
 * Usage:
 *   const result = rateLimit(ip, 'chat', { limit: 20, windowMs: 60_000 })
 *   if (!result.allowed) return 429
 */

interface Window {
  count: number
  resetAt: number
}

// Keyed by `${ip}:${bucket}` → sliding window state
const store = new Map<string, Window>()

// Periodically purge expired entries to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, window] of store) {
    if (now > window.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000) // every 5 minutes

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Seconds until the window resets (only meaningful if !allowed) */
  retryAfterSeconds: number
}

export function rateLimit(
  ip: string,
  bucket: string,
  options: RateLimitOptions,
): RateLimitResult {
  const key = `${ip}:${bucket}`
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    // Fresh window
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count++
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfterSeconds: 0,
  }
}

/**
 * Extract a client IP from a Next.js request, preferring standard proxy headers.
 * Falls back to a safe default so we never crash if no IP is available.
 */
export function getClientIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : (request as any).headers
  return (
    headers.get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get?.('x-real-ip') ||
    'unknown'
  )
}
