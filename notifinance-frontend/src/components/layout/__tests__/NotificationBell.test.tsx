import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationBell } from "../NotificationBell";
import { useAuthStore } from "@/stores/authStore";
import { useNotifications } from "@/hooks/useNotifications";
import { useSocket } from "@/hooks/useSocket";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: vi.fn(),
}));

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(),
}));

describe("NotificationBell", () => {
  it("does not render when not authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);
    vi.mocked(useNotifications).mockReturnValue({ data: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 1 } } } as ReturnType<typeof useNotifications>);
    vi.mocked(useSocket).mockReturnValue({ notificationSocket: { on: vi.fn(), off: vi.fn() } } as ReturnType<typeof useSocket>);

    const { container } = render(<NotificationBell />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders when authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);
    vi.mocked(useNotifications).mockReturnValue({ data: { data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 1 } } } as ReturnType<typeof useNotifications>);
    vi.mocked(useSocket).mockReturnValue({ notificationSocket: { on: vi.fn(), off: vi.fn() } } as ReturnType<typeof useSocket>);

    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });
});
