import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PortfolioPage from "../page";

const mockCreatePortfolio = vi.fn();

vi.mock("@/hooks/usePortfolio", () => ({
  usePortfolio: () => ({
    isError: false,
    isLoading: false,
    data: [
      {
        id: "p1",
        name: "Portafolio Principal",
        description: "Inversiones a largo plazo",
        totalValue: 15000000,
        totalReturn: 2500000,
        totalReturnPct: 20,
        dailyReturn: 0,
        dailyReturnPct: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "p2",
        name: "Trading Corto Plazo",
        description: "Operaciones especulativas",
        totalValue: 5000000,
        totalReturn: -250000,
        totalReturnPct: -4.76,
        dailyReturn: 0,
        dailyReturnPct: 0,
        createdAt: new Date().toISOString(),
      },
    ],
  }),
  useCreatePortfolio: () => ({ mutateAsync: mockCreatePortfolio }),
}));

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
    expect(screen.getByText("Crear portfolio")).toBeInTheDocument();
  });

  it("renders portfolio cards", () => {
    render(<PortfolioPage />);

    expect(screen.getByText("Portafolio Principal")).toBeInTheDocument();
    expect(screen.getByText("Trading Corto Plazo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ver detalle" }).length).toBeGreaterThan(0);
  });

  it("opens create dialog and submits", async () => {
    render(<PortfolioPage />);

    fireEvent.click(screen.getByRole("button", { name: "Crear portfolio" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Nuevo" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Desc" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(mockCreatePortfolio).toHaveBeenCalledWith({ name: "Nuevo", description: "Desc" });
    });
  });
});
