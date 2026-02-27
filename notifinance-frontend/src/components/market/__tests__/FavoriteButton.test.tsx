import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FavoriteButton } from "../FavoriteButton";

const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const mockUseAuthStore = vi.fn();
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows auth required feedback when unauthenticated", () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    render(<FavoriteButton />);

    fireEvent.click(screen.getByLabelText("favorite-toggle"));
    expect(mockToastError).toHaveBeenCalled();
  });

  it("toggles and calls callback when authenticated", () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    const onToggle = vi.fn();

    render(<FavoriteButton onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText("favorite-toggle"));

    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
