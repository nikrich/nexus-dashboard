import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyProjects } from "../empty-projects";

describe("EmptyProjects", () => {
  it("renders empty state message", () => {
    render(<EmptyProjects />);
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(
      screen.getByText("Get started by creating your first project.")
    ).toBeInTheDocument();
  });
});
