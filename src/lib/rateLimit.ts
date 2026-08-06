type RateLimitOptions = {
  intervalMs?: number
  maxRequests?: number
}

const tracker = new Map<string, { count: number; expiresAt: number }>()

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
