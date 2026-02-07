import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../command-palette";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useProjects hook
vi.mock("@/hooks/use-project-queries", () => ({
  useProjects: vi.fn(),
}));

import { useProjects } from "@/hooks/use-project-queries";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProjects).mockReturnValue({
      data: { data: { items: [], total: 0, page: 1, pageSize: 10, hasMore: false } },
      isLoading: false,
      error: null,
      isError: false,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should not be visible initially", () => {
    render(<CommandPalette />, { wrapper: createWrapper() });
    expect(screen.queryByPlaceholderText("Search projects...")).not.toBeInTheDocument();
  });

  it("should open when Cmd+K is pressed", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    });
  });

  it("should open when Ctrl+K is pressed", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Control>}k{/Control}");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    });
  });

  it("should show loading state", async () => {
    vi.mocked(useProjects).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as never);

    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Search projects...");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });
  });

  it("should display projects when search returns results", async () => {
    const mockProjects = [
      { id: "1", name: "Test Project", description: "A test project", ownerId: "user1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "2", name: "Another Project", description: "Another test", ownerId: "user1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ];

    vi.mocked(useProjects).mockReturnValue({
      data: { data: { items: mockProjects, total: 2, page: 1, pageSize: 10, hasMore: false } },
      isLoading: false,
      error: null,
      isError: false,
    } as never);

    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    const input = await screen.findByPlaceholderText("Search projects...");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
      expect(screen.getByText("Another Project")).toBeInTheDocument();
    });
  });

  it("should show empty state when no projects found", async () => {
    vi.mocked(useProjects).mockReturnValue({
      data: { data: { items: [], total: 0, page: 1, pageSize: 10, hasMore: false } },
      isLoading: false,
      error: null,
      isError: false,
    } as never);

    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    const input = await screen.findByPlaceholderText("Search projects...");
    await user.type(input, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });
  });

  it("should navigate to project when selected", async () => {
    const mockProjects = [
      { id: "proj-123", name: "Test Project", description: "A test project", ownerId: "user1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ];

    vi.mocked(useProjects).mockReturnValue({
      data: { data: { items: mockProjects, total: 1, page: 1, pageSize: 10, hasMore: false } },
      isLoading: false,
      error: null,
      isError: false,
    } as never);

    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    const input = await screen.findByPlaceholderText("Search projects...");
    await user.type(input, "test");

    const projectItem = await screen.findByText("Test Project");
    await user.click(projectItem);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/projects/proj-123");
    });

    // Dialog should close after selection
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search projects...")).not.toBeInTheDocument();
    });
  });

  it("should show initial prompt when no search query", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: createWrapper() });

    await user.keyboard("{Meta>}k{/Meta}");

    await waitFor(() => {
      expect(screen.getByText("Start typing to search projects...")).toBeInTheDocument();
    });
  });
});
