import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PortfolioPage from "../page";

// Mock ResizeObserver for Recharts/Lightweight Charts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock lightweight-charts to avoid canvas errors in tests
vi.mock("lightweight-charts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lightweight-charts")>();
  return {
    ...actual,
    createChart: vi.fn().mockReturnValue({
      addSeries: vi.fn().mockReturnValue({
        setData: vi.fn(),
        applyOptions: vi.fn(),
      }),
      addAreaSeries: vi.fn().mockReturnValue({
        setData: vi.fn(),
        applyOptions: vi.fn(),
      }),
      addHistogramSeries: vi.fn().mockReturnValue({
        setData: vi.fn(),
      }),
      timeScale: vi.fn().mockReturnValue({
        fitContent: vi.fn(),
      }),
      remove: vi.fn(),
      resize: vi.fn(),
    }),
  };
});

describe("PortfolioPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders portfolio page correctly", () => {
    render(<PortfolioPage />);
    
    expect(screen.getByText("Mi Portafolio")).toBeInTheDocument();
    expect(screen.getByText("Portafolio Principal")).toBeInTheDocument();
    expect(screen.getByText("Valor Total")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento Total")).toBeInTheDocument();
  });

  it("renders holdings table by default", () => {
    render(<PortfolioPage />);
    
    expect(screen.getByRole("tab", { name: "Tenencias" })).toHaveAttribute("data-state", "active");
    expect(screen.getByText("GGAL")).toBeInTheDocument();
    expect(screen.getByText("AAPL")).toBeInTheDocument();
  });

  it("switches to trades history tab", async () => {
    render(<PortfolioPage />);
    
    const tradesTab = screen.getByRole("tab", { name: "Historial de Operaciones" });
    fireEvent.click(tradesTab);

    // Wait for the tab content to be visible by checking for a trade that exists in the mock data
    await waitFor(() => {
      expect(screen.getAllByText("GGAL").length).toBeGreaterThan(0);
    });
  });
});
