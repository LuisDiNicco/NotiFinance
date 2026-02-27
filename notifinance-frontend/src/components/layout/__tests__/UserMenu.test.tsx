import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserMenu } from "../UserMenu";
import { useAuthStore } from "@/stores/authStore";

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("UserMenu", () => {
  it("renders login/register buttons when not authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    render(<UserMenu />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
  });

  it("renders user avatar when authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", displayName: "John Doe", email: "john@example.com" },
      clearSession: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<UserMenu />);

    // Avatar fallback should be JD
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
