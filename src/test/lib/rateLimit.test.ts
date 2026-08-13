import { describe, it, expect} from "vitest"
import { checkRateLimit } from "../../lib/rateLimit"

describe("checkRateLimit", () => {
  const id = "test-user-1"

  it("should allow request under limit", () => {
    const res = checkRateLimit(`${id}-1`, { maxRequests: 5, intervalMs: 60000 })
    expect(res.success).toBe(true)
    expect(res.remaining).toBe(4)
  })

  it("should block request exceeding maxRequests", () => {
    const key = `${id}-2`
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, { maxRequests: 3, intervalMs: 60000 })
    }
    const blocked = checkRateLimit(key, { maxRequests: 3, intervalMs: 60000 })
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })
})
