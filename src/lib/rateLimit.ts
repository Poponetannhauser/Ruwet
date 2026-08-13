import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateLimitOptions = {
  intervalMs?: number
  maxRequests?: number
}

const tracker = new Map<string, { count: number; expiresAt: number }>()

let upstashRatelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
    })
  } catch (err) {
    console.error("Failed to initialize Upstash Redis ratelimit, falling back to in-memory:", err)
  }
}

export async function checkRateLimitAsync(
  identifier: string
): Promise<{ success: boolean; remaining: number; resetMs: number }> {
  if (upstashRatelimit) {
    try {
      const res = await upstashRatelimit.limit(identifier)
      return {
        success: res.success,
        remaining: res.remaining,
        resetMs: Math.max(0, res.reset - Date.now()),
      }
    } catch (err) {
      console.error("Upstash ratelimit check failed, falling back to in-memory:", err)
    }
  }

  return checkRateLimit(identifier)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetMs: number } {
  const interval = options.intervalMs || 60000
  const max = options.maxRequests || 30
  const now = Date.now()

  const record = tracker.get(identifier)

  if (!record || now > record.expiresAt) {
    tracker.set(identifier, { count: 1, expiresAt: now + interval })
    return { success: true, remaining: max - 1, resetMs: interval }
  }

  if (record.count >= max) {
    return { success: false, remaining: 0, resetMs: record.expiresAt - now }
  }

  record.count += 1
  return { success: true, remaining: max - record.count, resetMs: record.expiresAt - now }
}
