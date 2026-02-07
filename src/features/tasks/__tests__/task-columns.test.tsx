import { describe, it, expect, vi } from "vitest";
import { createTaskColumns } from "../task-columns";

describe("createTaskColumns", () => {
  it("returns the correct number of columns", () => {
    const columns = createTaskColumns({
      onSort: vi.fn(),
      onStatusChange: vi.fn(),
    });
    // select, title, status, priority, assignee, due date, created
    expect(columns).toHaveLength(7);
  });

  it("has a select column with no sorting", () => {
    const columns = createTaskColumns({
      onSort: vi.fn(),
      onStatusChange: vi.fn(),
    });
    expect(columns[0].id).toBe("select");
    expect(columns[0].enableSorting).toBe(false);
  });

  it("has title column with accessor", () => {
    const columns = createTaskColumns({
      onSort: vi.fn(),
      onStatusChange: vi.fn(),
    });
    expect((columns[1] as { accessorKey: string }).accessorKey).toBe("title");
  });

  it("has status column with accessor", () => {
    const columns = createTaskColumns({
      onSort: vi.fn(),
      onStatusChange: vi.fn(),
    });
    expect((columns[2] as { accessorKey: string }).accessorKey).toBe("status");
  });
});
