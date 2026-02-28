import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CountryRisk, DollarQuote, MarketIndex, MarketStatus, TopMover } from "@/types/market";

const DASHBOARD_CACHE_KEY = "market:dashboard:last-real";

const FEATURED_INSTRUMENTS = [
  { symbol: "MERV", name: "S&P Merval" },
  { symbol: "GGAL", name: "Grupo Financiero Galicia" },
  { symbol: "YPFD", name: "YPF" },
  { symbol: "AL30", name: "Bono AL30" },
] as const;

interface MarketSummaryResponse {
  risk: {
    value: number;
    changePct: number;
  };
  marketStatus: {
    isOpen: boolean;
    closesAt: string | null;
    nextOpen: string | null;
  };
}

interface TopMoversApiResponse {
  gainers: Array<{
    asset: { ticker: string; name: string; assetType: string };
    quote: { priceArs: number | null; changePct: number | null };
  }>;
  losers: Array<{
    asset: { ticker: string; name: string; assetType: string };
    quote: { priceArs: number | null; changePct: number | null };
  }>;
}

interface RiskHistoryPoint {
  value: number;
  timestamp: string;
}

interface MarketStatusResponse {
  isOpen: boolean;
  closesAt: string | null;
  nextOpen: string | null;
}

interface AssetStatsResponse {
  latestClose: number;
  changePctFromPeriodStart: number;
}

interface AssetQuotePoint {
  date: string;
  closePrice: number | null;
}

interface DashboardData {
  dollarQuotes: DollarQuote[];
  countryRisk: CountryRisk;
  riskHistory: { time: string; value: number }[];
  indices: MarketIndex[];
  topMovers: {
    acciones: { gainers: TopMover[]; losers: TopMover[] };
    cedears: { gainers: TopMover[]; losers: TopMover[] };
  };
  marketStatus: MarketStatus;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

function loadDashboardCache(): DashboardData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DashboardData;
  } catch {
    return null;
  }
}

function saveDashboardCache(data: DashboardData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
  } catch {
    // no-op
  }
}

function mapRiskHistory(
  riskHistoryData: unknown,
): { time: string; value: number }[] {
  if (!Array.isArray(riskHistoryData)) {
    return [];
  }

  return riskHistoryData
    .map((point) => {
      const candidate = point as Partial<RiskHistoryPoint>;
      const rawTimestamp =
        typeof candidate.timestamp === "string" && candidate.timestamp.length > 0
          ? candidate.timestamp
          : new Date().toISOString();

      return {
        time: rawTimestamp.split("T")[0],
        value: asFiniteNumber(candidate.value, 0),
      };
    })
    .filter((point) => point.value > 0);
}

function mapDollarQuotes(payload: unknown): DollarQuote[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item): DollarQuote | null => {
      const quote = item as Partial<DollarQuote>;
      const buyPrice = asFiniteNumber(quote.buyPrice, 0);
      const sellPrice = asFiniteNumber(quote.sellPrice, 0);

      if (buyPrice <= 0 && sellPrice <= 0) {
        return null;
      }

      return {
        type: String(quote.type ?? "UNKNOWN"),
        buyPrice,
        sellPrice,
        spread: asFiniteNumber(quote.spread, 0),
        source: String(quote.source ?? "unknown"),
        timestamp:
          typeof quote.timestamp === "string" && quote.timestamp.length > 0
            ? quote.timestamp
            : new Date().toISOString(),
      };
    })
    .filter((quote): quote is DollarQuote => quote !== null);
}

function mapTopMovers(
  payload: unknown,
  type: TopMover["type"],
): { gainers: TopMover[]; losers: TopMover[] } {
  const safePayload = payload as Partial<TopMoversApiResponse>;
  const gainers = Array.isArray(safePayload.gainers) ? safePayload.gainers : [];
  const losers = Array.isArray(safePayload.losers) ? safePayload.losers : [];

  return {
    gainers: gainers
      .map((item) => ({
      symbol: item.asset.ticker,
      name: item.asset.name,
      price: Number(item.quote.priceArs ?? 0),
      variation: Number(item.quote.changePct ?? 0),
      type,
      }))
      .filter((item) => item.price > 0),
    losers: losers
      .map((item) => ({
      symbol: item.asset.ticker,
      name: item.asset.name,
      price: Number(item.quote.priceArs ?? 0),
      variation: Number(item.quote.changePct ?? 0),
      type,
      }))
      .filter((item) => item.price > 0),
  };
}

export function useDollarQuotes() {
  return useQuery({
    queryKey: ["market", "dollar"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DollarQuote[] }>("/market/dollar");
      return response.data.data;
    },
  });
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["market", "dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const cached = loadDashboardCache();

      const [
        dollarResponse,
        summaryResponse,
        riskResponse,
        riskHistoryResponse,
        statusResponse,
        stockTopMoversResponse,
        cedearTopMoversResponse,
      ] = await Promise.allSettled([
        apiClient.get<{ data: DollarQuote[] }>("/market/dollar"),
        apiClient.get<MarketSummaryResponse>("/market/summary"),
        apiClient.get<CountryRisk>("/market/risk"),
        apiClient.get<RiskHistoryPoint[]>("/market/risk/history", {
          params: { days: 30 },
        }),
        apiClient.get<MarketStatusResponse>("/market/status"),
        apiClient.get<TopMoversApiResponse>("/market/top-movers", {
          params: { type: "STOCK", limit: 5 },
        }),
        apiClient.get<TopMoversApiResponse>("/market/top-movers", {
          params: { type: "CEDEAR", limit: 5 },
        }),
      ]);

      const summaryData =
        summaryResponse.status === "fulfilled" ? summaryResponse.value.data : null;
      const statusData =
        statusResponse.status === "fulfilled"
          ? statusResponse.value.data
          : summaryData?.marketStatus ?? null;
      const riskData = riskResponse.status === "fulfilled" ? riskResponse.value.data : null;
      const riskHistoryData = mapRiskHistory(
        riskHistoryResponse.status === "fulfilled" ? riskHistoryResponse.value.data : [],
      );
      const dollarData = mapDollarQuotes(
        dollarResponse.status === "fulfilled" ? dollarResponse.value.data.data : [],
      );
      const stockTopMoversData =
        stockTopMoversResponse.status === "fulfilled"
          ? stockTopMoversResponse.value.data
          : { gainers: [], losers: [] };
      const cedearTopMoversData =
        cedearTopMoversResponse.status === "fulfilled"
          ? cedearTopMoversResponse.value.data
          : { gainers: [], losers: [] };

      const indicesRaw = await Promise.all(
        FEATURED_INSTRUMENTS.map(async (index): Promise<MarketIndex | null> => {
          try {
            const [statsResponse, quotesResponse] = await Promise.all([
              apiClient.get<AssetStatsResponse>(`/assets/${index.symbol}/stats`, {
                params: { days: 5 },
              }),
              apiClient.get<AssetQuotePoint[]>(`/assets/${index.symbol}/quotes`, {
                params: { days: 5 },
              }),
            ]);

            return {
              symbol: index.symbol,
              name: index.name,
              value: Number(statsResponse.data.latestClose ?? 0),
              variation: Number(statsResponse.data.changePctFromPeriodStart ?? 0),
              history: quotesResponse.data
                .map((point) => ({
                  time: point.date,
                  value: Number(point.closePrice ?? 0),
                }))
                .filter((point) => point.value > 0),
            };
          } catch {
            return cached?.indices.find((cachedIndex) => cachedIndex.symbol === index.symbol) ?? null;
          }
        }),
      );
      const indices = indicesRaw.filter((index): index is MarketIndex => index !== null);

      const marketStatusRaw: MarketStatusResponse =
        statusData ?? {
          isOpen: false,
          closesAt: null,
          nextOpen: null,
        };
      const nextChange = marketStatusRaw.isOpen ? marketStatusRaw.closesAt : marketStatusRaw.nextOpen;

      const latestRiskFromHistory = riskHistoryData.at(-1)?.value;
      const countryRisk: CountryRisk = {
        value: asFiniteNumber(
          riskData?.value ?? summaryData?.risk?.value ?? latestRiskFromHistory,
          cached?.countryRisk.value ?? 0,
        ),
        changePct: asFiniteNumber(
          riskData?.changePct ?? summaryData?.risk?.changePct,
          cached?.countryRisk.changePct ?? 0,
        ),
        previousValue: asFiniteNumber(riskData?.previousValue, cached?.countryRisk.previousValue ?? 0),
        timestamp:
          typeof riskData?.timestamp === "string" && riskData.timestamp.length > 0
            ? riskData.timestamp
            : cached?.countryRisk.timestamp ?? new Date().toISOString(),
      };

      const result: DashboardData = {
        dollarQuotes: dollarData.length > 0 ? dollarData : cached?.dollarQuotes ?? [],
        countryRisk,
        riskHistory: riskHistoryData.length > 0 ? riskHistoryData : cached?.riskHistory ?? [],
        indices: indices.length > 0 ? indices : cached?.indices ?? [],
        topMovers: {
          acciones: mapTopMovers(stockTopMoversData, "STOCK"),
          cedears: mapTopMovers(cedearTopMoversData, "CEDEAR"),
        },
        marketStatus: {
          isOpen: marketStatusRaw.isOpen,
          nextChange: nextChange ?? cached?.marketStatus.nextChange ?? new Date().toISOString(),
        },
      };

      saveDashboardCache(result);
      return result;
    },
    staleTime: 30_000,
  });
}
