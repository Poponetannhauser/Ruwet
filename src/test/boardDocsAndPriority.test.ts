import { describe, it, expect } from "vitest"
import { formatPriorityBadge } from "../../supabase/functions/_shared/telegram"
import { DOCUMENT_TYPE_LABELS, isValidDocumentExtension } from "@/app/boards/[id]/docs/docTypes"

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
  })

  it("should validate allowed and disallowed document file extensions", () => {
    // Valid extensions
    expect(isValidDocumentExtension("project_prd.pdf")).toBe(true)
    expect(isValidDocumentExtension("game_design.docx")).toBe(true)
    expect(isValidDocumentExtension("architecture.md")).toBe(true)
    expect(isValidDocumentExtension("spec.markdown")).toBe(true)
    expect(isValidDocumentExtension("config.json")).toBe(true)
    expect(isValidDocumentExtension("data.yaml")).toBe(true)
    expect(isValidDocumentExtension("wireframe.png")).toBe(true)
    expect(isValidDocumentExtension("mockup.jpg")).toBe(true)
    expect(isValidDocumentExtension("preview.webp")).toBe(true)
    expect(isValidDocumentExtension("backlog.csv")).toBe(true)
    expect(isValidDocumentExtension("DATA.CSV")).toBe(true)

    // Disallowed dangerous / web markup / executable extensions
    expect(isValidDocumentExtension("exploit.html")).toBe(false)
    expect(isValidDocumentExtension("payload.htm")).toBe(false)
    expect(isValidDocumentExtension("vector.svg")).toBe(false)
    expect(isValidDocumentExtension("malware.exe")).toBe(false)
    expect(isValidDocumentExtension("script.sh")).toBe(false)
    expect(isValidDocumentExtension("backdoor.php")).toBe(false)
    expect(isValidDocumentExtension("stealer.js")).toBe(false)
  })

  it("should sanitize phase strings by stripping numeric and boilerplate prefixes", async () => {
    const { sanitizePhase } = await import("@/app/boards/[id]/boardColors")

    expect(sanitizePhase("0 - Prototype")).toBe("Prototype")
    expect(sanitizePhase("0. Prototype")).toBe("Prototype")
    expect(sanitizePhase("0: Prototype")).toBe("Prototype")
    expect(sanitizePhase("01 - Core Production")).toBe("Core Production")
    expect(sanitizePhase("Phase 0 - Prototype")).toBe("Prototype")
    expect(sanitizePhase("Fase 1: Content")).toBe("Content")
    expect(sanitizePhase("Stage 2 - Polish")).toBe("Polish")
    expect(sanitizePhase("[0] Prototype")).toBe("Prototype")
    expect(sanitizePhase("(1) MVP")).toBe("MVP")
    expect(sanitizePhase("Prototype")).toBe("Prototype")
    expect(sanitizePhase("Core Production")).toBe("Core Production")
    expect(sanitizePhase("")).toBe(null)
    expect(sanitizePhase(null)).toBe(null)
    expect(sanitizePhase(undefined)).toBe(null)
  })

  it("should accurately calculate stale status, ratios, and elapsed time labels", async () => {
    const { calculateStaleStatus } = await import("@/app/boards/[id]/boardColors")
    const mockColumns = [
      { id: "col-todo", name: "To Do" },
      { id: "col-prog", name: "In Progress" },
      { id: "col-done", name: "Done" },
    ]

    const now = 1000000000000 // Fixed reference timestamp
    const oneHourMs = 3600000
    const thresholdHours = 48

    // 1. Fresh/Active task (1 hour ago)
    const fresh = calculateStaleStatus(
      {
        column_id: "col-todo",
        status_updated_at: new Date(now - 1 * oneHourMs).toISOString(),
      },
      mockColumns,
      thresholdHours,
      now
    )
    expect(fresh?.status).toBe("green")
    expect(fresh?.label).toContain("Active")

    // 2. Warning task (40 hours ago, ratio >= 0.75)
    const warning = calculateStaleStatus(
      {
        column_id: "col-prog",
        status_updated_at: new Date(now - 40 * oneHourMs).toISOString(),
      },
      mockColumns,
      thresholdHours,
      now
    )
    expect(warning?.status).toBe("yellow")
    expect(warning?.label).toContain("Warning")

    // 3. Stale task (50 hours ago, ratio >= 1.0)
    const stale = calculateStaleStatus(
      {
        column_id: "col-todo",
        status_updated_at: new Date(now - 50 * oneHourMs).toISOString(),
      },
      mockColumns,
      thresholdHours,
      now
    )
    expect(stale?.status).toBe("red")
    expect(stale?.label).toContain("Stale")

    // 4. Task in Done column should return null (no stale status)
    const doneTask = calculateStaleStatus(
      {
        column_id: "col-done",
        status_updated_at: new Date(now - 100 * oneHourMs).toISOString(),
      },
      mockColumns,
      thresholdHours,
      now
    )
    expect(doneTask).toBe(null)
  })
})
