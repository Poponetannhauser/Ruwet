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
})
