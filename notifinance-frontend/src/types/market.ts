export type AssetType =
  | "STOCK"
  | "CEDEAR"
  | "BOND"
  | "LECAP"
  | "BONCAP"
  | "ON"
  | "INDEX";

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  assetType: AssetType;
  sector: string;
  yahooTicker: string;
  description?: string;
}

export interface DollarQuote {
  type: string;
  buyPrice: number | null;
  sellPrice: number | null;
  spread: number | null;
  source: string;
  timestamp: string;
}

export interface CountryRisk {
  value: number;
  changePct: number;
  previousValue: number | null;
  timestamp: string;
}

export interface MarketQuote {
  date: string;
  openPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  closePrice: number | null;
  volume: number | null;
  changePct: number | null;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  variation: number;
  history: { time: string; value: number }[];
}

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  variation: number;
  type: AssetType;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  variation: number;
  type: AssetType;
}

export interface MarketStatus {
  isOpen: boolean;
  nextChange: string; // ISO string of next open/close time
}