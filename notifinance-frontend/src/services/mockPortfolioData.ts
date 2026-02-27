import { Portfolio, Holding, Trade } from "@/types/portfolio";

export const mockPortfolios: Portfolio[] = [
  {
    id: "1",
    name: "Portafolio Principal",
    description: "Inversiones a largo plazo",
    totalValue: 15000000,
    totalReturn: 2500000,
    totalReturnPct: 20,
    dailyReturn: 150000,
    dailyReturnPct: 1.01,
    createdAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Trading Corto Plazo",
    description: "Operaciones especulativas",
    totalValue: 5000000,
    totalReturn: -250000,
    totalReturnPct: -4.76,
    dailyReturn: -50000,
    dailyReturnPct: -0.99,
    createdAt: "2023-06-20T14:30:00Z",
  },
];

export const mockHoldings: Record<string, Holding[]> = {
  "1": [
    {
      assetId: "1",
      ticker: "GGAL",
      name: "Grupo Financiero Galicia",
      type: "STOCK",
      quantity: 1000,
      avgCostBasis: 3500,
      currentPrice: 4500,
      marketValue: 4500000,
      unrealizedPnl: 1000000,
      unrealizedPnlPct: 28.57,
      dailyPnl: 112500,
      dailyPnlPct: 2.56,
      weight: 30,
      currency: "ARS",
    },
    {
      assetId: "4",
      ticker: "AAPL",
      name: "Apple Inc.",
      type: "CEDEAR",
      quantity: 500,
      avgCostBasis: 12000,
      currentPrice: 15000,
      marketValue: 7500000,
      unrealizedPnl: 1500000,
      unrealizedPnlPct: 25,
      dailyPnl: 112500,
      dailyPnlPct: 1.52,
      weight: 50,
      currency: "ARS",
    },
    {
      assetId: "7",
      ticker: "AL30",
      name: "Bono Rep. Arg. USD Step Up 2030",
      type: "BOND",
      quantity: 54.54,
      avgCostBasis: 50000,
      currentPrice: 55000,
      marketValue: 3000000,
      unrealizedPnl: 272700,
      unrealizedPnlPct: 10,
      dailyPnl: -75000,
      dailyPnlPct: -2.44,
      weight: 20,
      currency: "ARS",
    },
  ],
  "2": [
    {
      assetId: "2",
      ticker: "YPFD",
      name: "YPF S.A.",
      type: "STOCK",
      quantity: 200,
      avgCostBasis: 26000,
      currentPrice: 25000,
      marketValue: 5000000,
      unrealizedPnl: -200000,
      unrealizedPnlPct: -3.85,
      dailyPnl: -50000,
      dailyPnlPct: -0.99,
      weight: 100,
      currency: "ARS",
    },
  ],
};

export const mockTrades: Record<string, Trade[]> = {
  "1": [
    {
      id: "t1",
      portfolioId: "1",
      ticker: "GGAL",
      tradeType: "BUY",
      quantity: 500,
      pricePerUnit: 3000,
      currency: "ARS",
      commission: 15000,
      executedAt: "2023-02-10T11:15:00Z",
    },
    {
      id: "t2",
      portfolioId: "1",
      ticker: "GGAL",
      tradeType: "BUY",
      quantity: 500,
      pricePerUnit: 4000,
      currency: "ARS",
      commission: 20000,
      executedAt: "2023-05-22T14:45:00Z",
    },
    {
      id: "t3",
      portfolioId: "1",
      ticker: "AAPL",
      tradeType: "BUY",
      quantity: 500,
      pricePerUnit: 12000,
      currency: "ARS",
      commission: 60000,
      executedAt: "2023-08-05T10:30:00Z",
    },
  ],
  "2": [
    {
      id: "t4",
      portfolioId: "2",
      ticker: "YPFD",
      tradeType: "BUY",
      quantity: 200,
      pricePerUnit: 26000,
      currency: "ARS",
      commission: 52000,
      executedAt: "2024-01-15T12:00:00Z",
    },
  ],
};

export const mockPortfolioHistory = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    time: date.toISOString().split("T")[0],
    value: 12000000 + (i * 100000) + (Math.random() * 500000 - 250000),
  };
});
