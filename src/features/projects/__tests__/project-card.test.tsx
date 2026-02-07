import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "../project-card";
import type { Project } from "@/types";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockProject: Project = {
  id: "proj-1",
  name: "Test Project",
  description: "A test project description that might be long",
  ownerId: "user-1",
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
};

describe("ProjectCard", () => {
  it("renders project name and description", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(
      screen.getByText("A test project description that might be long")
    ).toBeInTheDocument();
  });

  it("links to the project detail page", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/proj-1");
  });

  it("shows created date", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it("shows 'No description' when description is empty", () => {
    const project = { ...mockProject, description: "" };
    render(<ProjectCard project={project} />);
    expect(screen.getByText("No description")).toBeInTheDocument();
  });
});
