import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateTaskDialog } from "../create-task-dialog";

const mockMutateAsync = vi.fn();

vi.mock("@/hooks/use-task-queries", () => ({
  useCreateTask: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-user-queries", () => ({
  useUsers: () => ({
    data: {
      data: [
        { id: "u1", name: "Alice", email: "alice@test.com", role: "admin" },
        { id: "u2", name: "Bob", email: "bob@test.com", role: "member" },
      ],
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("CreateTaskDialog", () => {
  it("renders the trigger button with default text", () => {
    renderWithProviders(<CreateTaskDialog projectId="p1" />);
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it("renders a custom trigger when provided", () => {
    renderWithProviders(
      <CreateTaskDialog
        projectId="p1"
        trigger={<button>Custom Trigger</button>}
      />
    );
    expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTaskDialog projectId="p1" />);

    await user.click(screen.getByText("New Task"));
    expect(screen.getByText("Add a new task to this project.")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  it("shows form fields when dialog is open", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTaskDialog projectId="p1" />);

    await user.click(screen.getByText("New Task"));
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date")).toBeInTheDocument();
  });

  it("opens in controlled mode with specified default status", () => {
    renderWithProviders(
      <CreateTaskDialog
        projectId="p1"
        defaultStatus="in_progress"
        open={true}
        onOpenChange={() => {}}
      />
    );
    expect(screen.getByText("Add a new task to this project.")).toBeInTheDocument();
  });

  it("shows cancel and create buttons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTaskDialog projectId="p1" />);

    await user.click(screen.getByText("New Task"));
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
  });
});
