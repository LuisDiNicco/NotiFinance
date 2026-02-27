import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "../Sidebar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("Sidebar", () => {
  it("renders public routes when not authenticated", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    expect(screen.getByText("NotiFinance")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
    expect(screen.getByText("CEDEARs")).toBeInTheDocument();
    expect(screen.getByText("Bonos")).toBeInTheDocument();

    // Protected routes should not be visible
    expect(screen.queryByText("Watchlist")).not.toBeInTheDocument();
    expect(screen.queryByText("Portfolio")).not.toBeInTheDocument();
    expect(screen.queryByText("Alertas")).not.toBeInTheDocument();
  });

  it("renders all routes when authenticated", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Alertas")).toBeInTheDocument();
  });
});
