import { DollarQuote, CountryRisk, MarketIndex, TopMover, MarketStatus } from "@/types/market";

// Mock data for development
export const mockDollarQuotes: DollarQuote[] = [
  { type: "Oficial", buyPrice: 1020, sellPrice: 1060, spread: 40, source: "BCRA", timestamp: new Date().toISOString() },
  { type: "Blue", buyPrice: 1180, sellPrice: 1200, spread: 20, source: "Mercado", timestamp: new Date().toISOString() },
  { type: "MEP", buyPrice: 1150.5, sellPrice: 1152.3, spread: 1.8, source: "Bolsa", timestamp: new Date().toISOString() },
  { type: "CCL", buyPrice: 1170.2, sellPrice: 1175.8, spread: 5.6, source: "Bolsa", timestamp: new Date().toISOString() },
  { type: "Tarjeta", buyPrice: 1696, sellPrice: 1696, spread: 0, source: "Bancos", timestamp: new Date().toISOString() },
  { type: "Cripto", buyPrice: 1190, sellPrice: 1210, spread: 20, source: "Exchanges", timestamp: new Date().toISOString() },
];

export const mockCountryRisk: CountryRisk = {
  value: 1250,
  changePct: -2.5,
  previousValue: 1282,
  timestamp: new Date().toISOString(),
};

export const mockRiskHistory = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    time: date.toISOString().split('T')[0],
    value: 1300 - Math.random() * 100 + (i * 2),
  };
});

export const mockIndices: MarketIndex[] = [
  {
    symbol: "MERV",
    name: "S&P Merval",
    value: 1250400.5,
    variation: 1.2,
    history: Array.from({ length: 5 }).map((_, i) => ({
      time: `2024-01-0${i + 1}`,
      value: 1200000 + Math.random() * 100000,
    })),
  },
  {
    symbol: "SPX",
    name: "S&P 500",
    value: 5100.25,
    variation: 0.5,
    history: Array.from({ length: 5 }).map((_, i) => ({
      time: `2024-01-0${i + 1}`,
      value: 5000 + Math.random() * 200,
    })),
  },
  {
    symbol: "NDX",
    name: "Nasdaq",
    value: 18200.5,
    variation: -0.3,
    history: Array.from({ length: 5 }).map((_, i) => ({
      time: `2024-01-0${i + 1}`,
      value: 18000 + Math.random() * 500,
    })),
  },
  {
    symbol: "DJI",
    name: "Dow Jones",
    value: 39000.75,
    variation: 0.1,
    history: Array.from({ length: 5 }).map((_, i) => ({
      time: `2024-01-0${i + 1}`,
      value: 38500 + Math.random() * 1000,
    })),
  },
];

export const mockTopMovers: {
  acciones: { gainers: TopMover[]; losers: TopMover[] };
  cedears: { gainers: TopMover[]; losers: TopMover[] };
} = {
  acciones: {
    gainers: [
      { symbol: "GGAL", name: "Grupo Financiero Galicia", price: 3500, variation: 5.2, type: "STOCK" },
      { symbol: "YPFD", name: "YPF S.A.", price: 28000, variation: 4.1, type: "STOCK" },
      { symbol: "PAMP", name: "Pampa Energía", price: 2500, variation: 3.5, type: "STOCK" },
      { symbol: "BMA", name: "Banco Macro", price: 4200, variation: 2.8, type: "STOCK" },
      { symbol: "CEPU", name: "Central Puerto", price: 1100, variation: 2.1, type: "STOCK" },
    ],
    losers: [
      { symbol: "ALUA", name: "Aluar", price: 950, variation: -3.2, type: "STOCK" },
      { symbol: "TXAR", name: "Ternium", price: 820, variation: -2.5, type: "STOCK" },
      { symbol: "TGSU2", name: "Transportadora Gas del Sur", price: 3100, variation: -1.8, type: "STOCK" },
      { symbol: "LOMA", name: "Loma Negra", price: 1450, variation: -1.5, type: "STOCK" },
      { symbol: "CRES", name: "Cresud", price: 1200, variation: -1.1, type: "STOCK" },
    ],
  },
  cedears: {
    gainers: [
      { symbol: "NVDA", name: "NVIDIA Corp", price: 15000, variation: 6.5, type: "CEDEAR" },
      { symbol: "META", name: "Meta Platforms", price: 12000, variation: 4.8, type: "CEDEAR" },
      { symbol: "MSFT", name: "Microsoft", price: 18000, variation: 2.5, type: "CEDEAR" },
      { symbol: "AAPL", name: "Apple Inc", price: 14500, variation: 1.8, type: "CEDEAR" },
      { symbol: "AMZN", name: "Amazon", price: 16000, variation: 1.2, type: "CEDEAR" },
    ],
    losers: [
      { symbol: "TSLA", name: "Tesla Inc", price: 11000, variation: -4.5, type: "CEDEAR" },
      { symbol: "BABA", name: "Amazon", price: 9500, variation: -2.8, type: "CEDEAR" },
      { symbol: "GOOGL", name: "Alphabet", price: 13000, variation: -1.5, type: "CEDEAR" },
      { symbol: "NFLX", name: "Netflix", price: 8500, variation: -1.2, type: "CEDEAR" },
      { symbol: "DIS", name: "Walt Disney", price: 7200, variation: -0.8, type: "CEDEAR" },
    ],
  },
};

export const mockMarketStatus: MarketStatus = {
  isOpen: true,
  nextChange: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), // Today at 17:00
};
