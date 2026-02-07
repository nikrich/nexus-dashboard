import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TaskDetailSkeleton } from "../task-detail-skeleton";

describe("TaskDetailSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<TaskDetailSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
