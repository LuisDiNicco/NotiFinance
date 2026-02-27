import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WatchlistPage from "../page";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("WatchlistPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders watchlist items correctly", () => {
    render(<WatchlistPage />);
    
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("GGAL")).toBeInTheDocument();
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("AL30")).toBeInTheDocument();
  });

  it("filters items by search term", () => {
    render(<WatchlistPage />);
    
    const searchInput = screen.getByPlaceholderText("Buscar en favoritos...");
    fireEvent.change(searchInput, { target: { value: "AAPL" } });

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.queryByText("GGAL")).not.toBeInTheDocument();
    expect(screen.queryByText("AL30")).not.toBeInTheDocument();
  });

  it("removes item when delete button is clicked", () => {
    render(<WatchlistPage />);
    
    const deleteButtons = screen.getAllByRole("button", { name: "Eliminar" });
    fireEvent.click(deleteButtons[0]);

    expect(toast.success).toHaveBeenCalledWith("Activo eliminado de favoritos");
    expect(screen.queryByText("GGAL")).not.toBeInTheDocument();
  });

  it("shows empty state when all items are removed", () => {
    render(<WatchlistPage />);
    
    const deleteButtons = screen.getAllByRole("button", { name: "Eliminar" });
    deleteButtons.forEach(button => fireEvent.click(button));

    expect(screen.getByText("No tenés favoritos.")).toBeInTheDocument();
    expect(screen.getByText("Explorar activos →")).toBeInTheDocument();
  });
});
