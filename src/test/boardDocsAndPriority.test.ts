import { describe, it, expect } from "vitest"
import { formatPriorityBadge } from "../../supabase/functions/_shared/telegram"
import { DOCUMENT_TEMPLATES } from "@/app/boards/[id]/docs/docTypes"

describe("Priority P0-P3 & Formatting Tests", () => {
  it("should format P0-P3 badges properly with icons", () => {
    expect(formatPriorityBadge("P0")).toBe("[🔴 P0] ")
    expect(formatPriorityBadge("p0")).toBe("[🔴 P0] ")
    expect(formatPriorityBadge("urgent")).toBe("[🔴 P0] ")

    expect(formatPriorityBadge("P1")).toBe("[🟠 P1] ")
    expect(formatPriorityBadge("p1")).toBe("[🟠 P1] ")
    expect(formatPriorityBadge("high")).toBe("[🟠 P1] ")

    expect(formatPriorityBadge("P2")).toBe("[🔵 P2] ")
    expect(formatPriorityBadge("p2")).toBe("[🔵 P2] ")
    expect(formatPriorityBadge("medium")).toBe("[🔵 P2] ")
    expect(formatPriorityBadge(undefined)).toBe("[🔵 P2] ")

    expect(formatPriorityBadge("P3")).toBe("[⚪ P3] ")
    expect(formatPriorityBadge("p3")).toBe("[⚪ P3] ")
    expect(formatPriorityBadge("low")).toBe("[⚪ P3] ")
  })

  it("should have starter templates for PRD, GDD, and Tech Spec", () => {
    expect(DOCUMENT_TEMPLATES.prd).toBeDefined()
    expect(DOCUMENT_TEMPLATES.prd.template).toContain("Product Requirement Document")

    expect(DOCUMENT_TEMPLATES.gdd).toBeDefined()
    expect(DOCUMENT_TEMPLATES.gdd.template).toContain("Game Design Document")

    expect(DOCUMENT_TEMPLATES.tech_spec).toBeDefined()
    expect(DOCUMENT_TEMPLATES.tech_spec.template).toContain("Technical Specification")

    expect(DOCUMENT_TEMPLATES.meeting_notes).toBeDefined()
    expect(DOCUMENT_TEMPLATES.general).toBeDefined()
  })
})
