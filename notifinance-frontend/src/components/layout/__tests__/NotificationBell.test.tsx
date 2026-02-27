import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationBell } from "../NotificationBell";
import { useAuthStore } from "@/stores/authStore";

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("NotificationBell", () => {
  it("does not render when not authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    const { container } = render(<NotificationBell />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders when authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);

    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });
});
