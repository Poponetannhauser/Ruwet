import { describe, it, expect } from "vitest"
import { formatPriorityBadge } from "../../supabase/functions/_shared/telegram"
import { DOCUMENT_TYPE_LABELS } from "@/app/boards/[id]/docs/docTypes"

describe("Priority P0-P3 & Formatting Tests", () => {
  it("should format P0-P3 badges properly without emojis", () => {
    expect(formatPriorityBadge("P0")).toBe("[P0] ")
    expect(formatPriorityBadge("p0")).toBe("[P0] ")
    expect(formatPriorityBadge("urgent")).toBe("[P0] ")

    expect(formatPriorityBadge("P1")).toBe("[P1] ")
    expect(formatPriorityBadge("p1")).toBe("[P1] ")
    expect(formatPriorityBadge("high")).toBe("[P1] ")

    expect(formatPriorityBadge("P2")).toBe("[P2] ")
    expect(formatPriorityBadge("p2")).toBe("[P2] ")
    expect(formatPriorityBadge("medium")).toBe("[P2] ")
    expect(formatPriorityBadge(undefined)).toBe("[P2] ")

    expect(formatPriorityBadge("P3")).toBe("[P3] ")
    expect(formatPriorityBadge("p3")).toBe("[P3] ")
    expect(formatPriorityBadge("low")).toBe("[P3] ")
  })

  it("should have labels for PRD, GDD, and Tech Spec", () => {
    expect(DOCUMENT_TYPE_LABELS.prd).toBeDefined()
    expect(DOCUMENT_TYPE_LABELS.prd.label).toBe("PRD")

    expect(DOCUMENT_TYPE_LABELS.gdd).toBeDefined()
    expect(DOCUMENT_TYPE_LABELS.gdd.label).toBe("GDD")

    expect(DOCUMENT_TYPE_LABELS.tech_spec).toBeDefined()
    expect(DOCUMENT_TYPE_LABELS.tech_spec.label).toBe("Tech Spec")

    expect(DOCUMENT_TYPE_LABELS.meeting_notes).toBeDefined()
    expect(DOCUMENT_TYPE_LABELS.general).toBeDefined()
  })
})
