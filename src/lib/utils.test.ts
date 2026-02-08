import { describe, it, expect } from "vitest"
import { getStatusColor, getStatusLabel } from "./utils"

describe("Status color utilities", () => {
  describe("getStatusColor", () => {
    it("should return correct color classes for todo status", () => {
      const color = getStatusColor("todo")
      expect(color).toBe("bg-status-todo text-status-todo-foreground")
    })

    it("should return correct color classes for in_progress status", () => {
      const color = getStatusColor("in_progress")
      expect(color).toBe("bg-status-in-progress text-status-in-progress-foreground")
    })

    it("should return correct color classes for review status", () => {
      const color = getStatusColor("review")
      expect(color).toBe("bg-status-review text-status-review-foreground")
    })

    it("should return correct color classes for done status", () => {
      const color = getStatusColor("done")
      expect(color).toBe("bg-status-done text-status-done-foreground")
    })

    it("should return todo color as default for unknown status", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const color = getStatusColor("unknown" as any)
      expect(color).toBe("bg-status-todo text-status-todo-foreground")
    })
  })

  describe("getStatusLabel", () => {
    it("should return correct label for todo status", () => {
      const label = getStatusLabel("todo")
      expect(label).toBe("To Do")
    })

    it("should return correct label for in_progress status", () => {
      const label = getStatusLabel("in_progress")
      expect(label).toBe("In Progress")
    })

    it("should return correct label for review status", () => {
      const label = getStatusLabel("review")
      expect(label).toBe("Review")
    })

    it("should return correct label for done status", () => {
      const label = getStatusLabel("done")
      expect(label).toBe("Done")
    })

    it("should return status value as fallback for unknown status", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const label = getStatusLabel("unknown" as any)
      expect(label).toBe("unknown")
    })
  })
})
