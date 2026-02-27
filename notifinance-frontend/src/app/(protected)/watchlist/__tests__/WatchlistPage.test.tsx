import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WatchlistPage from "../page";
import { toast } from "sonner";

const mockRemove = vi.fn();
const mockAdd = vi.fn();

vi.mock("@/hooks/useWatchlist", () => ({
  useWatchlist: () => ({
    isError: false,
    isLoading: false,
    data: [
      { id: "1", symbol: "GGAL", name: "Grupo Galicia", price: 1000, variation: 1.5, type: "STOCK" },
      { id: "2", symbol: "AAPL", name: "Apple", price: 2000, variation: -0.5, type: "CEDEAR" },
      { id: "3", symbol: "AL30", name: "AL30", price: 3000, variation: 0.2, type: "BOND" },
    ],
  }),
  useAddWatchlistItem: () => ({ mutateAsync: mockAdd }),
  useRemoveWatchlistItem: () => ({ mutateAsync: mockRemove }),
}));

vi.mock("@/hooks/useSocket", () => ({
  useSocket: () => ({
    marketSocket: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

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
    mockRemove.mockResolvedValue(undefined);
    mockAdd.mockResolvedValue(undefined);
  });

  it("renders watchlist items correctly", () => {
    render(<WatchlistPage />);
    
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("GGAL")).toBeInTheDocument();
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getAllByText("AL30").length).toBeGreaterThan(0);
  });

  it("filters items by search term", () => {
    render(<WatchlistPage />);
    
    const searchInput = screen.getByPlaceholderText("Buscar en favoritos...");
    fireEvent.change(searchInput, { target: { value: "AAPL" } });

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.queryByText("GGAL")).not.toBeInTheDocument();
    expect(screen.queryByText("AL30")).not.toBeInTheDocument();
  });

  it("removes item when delete button is clicked", async () => {
    render(<WatchlistPage />);
    
    const deleteButtons = screen.getAllByRole("button", { name: "Eliminar" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith("GGAL");
      expect(toast.success).toHaveBeenCalledWith("Activo eliminado de favoritos");
    });
  });

  it("adds ticker from inline input", async () => {
    render(<WatchlistPage />);

    fireEvent.change(screen.getByPlaceholderText("Agregar ticker (ej: GGAL)"), {
      target: { value: "YPFD" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith("YPFD");
    });
  });
});
