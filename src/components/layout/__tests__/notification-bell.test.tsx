import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationBell } from "../notification-bell";

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

// Mock the notification hooks
vi.mock("@/hooks/use-notification-queries", () => ({
  useUnreadNotificationCount: () => ({
    data: { data: { count: 3 } },
  }),
  useNotifications: () => ({
    data: {
      data: {
        items: [
          {
            id: "n1",
            userId: "u1",
            type: "task_assigned",
            channel: "in_app",
            title: "You were assigned a task",
            body: "Task: Fix the bug",
            metadata: {},
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "n2",
            userId: "u1",
            type: "comment_added",
            channel: "in_app",
            title: "New comment on your task",
            body: "Check this out",
            metadata: {},
            read: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
    },
  }),
  useMarkNotificationRead: () => ({
    mutate: vi.fn(),
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("NotificationBell", () => {
  it("renders the bell button", () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders as a popover trigger", () => {
    renderWithProviders(<NotificationBell />);
    const button = screen.getByLabelText("Notifications");
    expect(button).toHaveAttribute("data-state", "closed");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });
});
