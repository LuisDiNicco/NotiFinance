export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Holding {
  assetId: string;
  ticker: string;
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  weight: number;
}

export interface Trade {
  id: string;
  portfolioId: string;
  ticker: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  pricePerUnit: number;
  currency: "ARS" | "USD";
  commission?: number;
  executedAt: string;
}