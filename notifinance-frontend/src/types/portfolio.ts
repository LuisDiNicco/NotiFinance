export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  dailyReturn: number;
  dailyReturnPct: number;
  createdAt: string;
}

export interface Holding {
  assetId: string;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  dailyPnl: number;
  dailyPnlPct: number;
  weight: number;
  currency: string;
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