import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CountryRisk, DollarQuote, MarketIndex, MarketStatus, TopMover } from "@/types/market";

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

function mapTopMovers(
  payload: TopMoversApiResponse,
  type: TopMover["type"],
): { gainers: TopMover[]; losers: TopMover[] } {
  return {
    gainers: payload.gainers.map((item) => ({
      symbol: item.asset.ticker,
      name: item.asset.name,
      price: Number(item.quote.priceArs ?? 0),
      variation: Number(item.quote.changePct ?? 0),
      type,
    })),
    losers: payload.losers.map((item) => ({
      symbol: item.asset.ticker,
      name: item.asset.name,
      price: Number(item.quote.priceArs ?? 0),
      variation: Number(item.quote.changePct ?? 0),
      type,
    })),
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
      const [
        dollarResponse,
        summaryResponse,
        riskHistoryResponse,
        statusResponse,
        stockTopMoversResponse,
        cedearTopMoversResponse,
      ] = await Promise.allSettled([
        apiClient.get<{ data: DollarQuote[] }>("/market/dollar"),
        apiClient.get<MarketSummaryResponse>("/market/summary"),
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
      const riskHistoryData =
        riskHistoryResponse.status === "fulfilled" ? riskHistoryResponse.value.data : [];
      const dollarData =
        dollarResponse.status === "fulfilled" ? dollarResponse.value.data.data : [];
      const stockTopMoversData =
        stockTopMoversResponse.status === "fulfilled"
          ? stockTopMoversResponse.value.data
          : { gainers: [], losers: [] };
      const cedearTopMoversData =
        cedearTopMoversResponse.status === "fulfilled"
          ? cedearTopMoversResponse.value.data
          : { gainers: [], losers: [] };

      const indexTickers = [
        { symbol: "MERV", name: "S&P Merval" },
        { symbol: "SPX", name: "S&P 500" },
        { symbol: "NDX", name: "Nasdaq" },
        { symbol: "DJI", name: "Dow Jones" },
      ] as const;

      const indicesRaw = await Promise.all(
        indexTickers.map(async (index): Promise<MarketIndex | null> => {
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
            return null;
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

      return {
        dollarQuotes: dollarData,
        countryRisk: {
          value: Number(summaryData?.risk.value ?? 0),
          changePct: Number(summaryData?.risk.changePct ?? 0),
          previousValue: null,
          timestamp: new Date().toISOString(),
        },
        riskHistory: riskHistoryData.map((point) => ({
          time: point.timestamp.split("T")[0],
          value: Number(point.value ?? 0),
        })),
        indices,
        topMovers: {
          acciones: mapTopMovers(stockTopMoversData, "STOCK"),
          cedears: mapTopMovers(cedearTopMoversData, "CEDEAR"),
        },
        marketStatus: {
          isOpen: marketStatusRaw.isOpen,
          nextChange: nextChange ?? new Date().toISOString(),
        },
      };
    },
    staleTime: 30_000,
  });
}
