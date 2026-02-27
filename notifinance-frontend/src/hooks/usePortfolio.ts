import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Holding, Portfolio, Trade } from "@/types/portfolio";

interface PortfolioSummaryPayload {
  totalValueArs: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

interface PortfolioApiItem {
  id: string;
  name: string;
  description?: string | null;
  summary?: PortfolioSummaryPayload;
}

interface HoldingApi {
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

interface TradeApi {
  id?: string;
  portfolioId: string;
  assetId: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  pricePerUnit: number;
  currency: "ARS" | "USD";
  commission: number;
  executedAt: string;
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: PortfolioApiItem[] }>("/portfolios");
      const now = new Date().toISOString();

      return response.data.data.map((item): Portfolio => ({
        id: item.id,
        name: item.name,
        description: item.description ?? undefined,
        totalValue: item.summary?.totalValueArs ?? 0,
        totalReturn: item.summary?.unrealizedPnl ?? 0,
        totalReturnPct: item.summary?.unrealizedPnlPct ?? 0,
        dailyReturn: 0,
        dailyReturnPct: 0,
        createdAt: now,
      }));
    },
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const response = await apiClient.post<PortfolioApiItem>("/portfolios", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function usePortfolioHoldings(portfolioId: string, enabled = true) {
  return useQuery({
    queryKey: ["portfolio", portfolioId, "holdings"],
    enabled: Boolean(portfolioId) && enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ holdings: HoldingApi[] }>(`/portfolios/${portfolioId}/holdings`);

      return response.data.holdings.map((holding): Holding => ({
        assetId: holding.assetId,
        ticker: holding.ticker,
        name: holding.ticker,
        type: "STOCK",
        quantity: holding.quantity,
        avgCostBasis: holding.avgCostBasis,
        currentPrice: holding.currentPrice,
        marketValue: holding.marketValue,
        unrealizedPnl: holding.unrealizedPnl,
        unrealizedPnlPct: holding.unrealizedPnlPct,
        dailyPnl: 0,
        dailyPnlPct: 0,
        weight: holding.weight,
        currency: "ARS",
      }));
    },
  });
}

export function usePortfolioTrades(portfolioId: string, enabled = true) {
  return useQuery({
    queryKey: ["portfolio", portfolioId, "trades"],
    enabled: Boolean(portfolioId) && enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ data: TradeApi[] }>(`/portfolios/${portfolioId}/trades`);

      return response.data.data.map((trade, index): Trade => ({
        id: trade.id ?? `${trade.portfolioId}-${index}`,
        portfolioId: trade.portfolioId,
        ticker: trade.assetId,
        tradeType: trade.tradeType,
        quantity: trade.quantity,
        pricePerUnit: trade.pricePerUnit,
        currency: trade.currency,
        commission: trade.commission,
        executedAt: trade.executedAt,
      }));
    },
  });
}

export function useRecordTrade(portfolioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      ticker: string;
      tradeType: "BUY" | "SELL";
      quantity: number;
      pricePerUnit: number;
      currency: "ARS" | "USD";
      commission?: number;
      executedAt?: string;
    }) => {
      const response = await apiClient.post(`/portfolios/${portfolioId}/trades`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId, "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId, "trades"] });
    },
  });
}

export function usePortfolioPerformance(portfolioId: string, period: string, enabled = true) {
  return useQuery({
    queryKey: ["portfolio", portfolioId, "performance", period],
    enabled: Boolean(portfolioId) && enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ dataPoints: Array<{ date: string; value: number }> }>(
        `/portfolios/${portfolioId}/performance`,
        { params: { period } },
      );

      return response.data.dataPoints.map((point) => ({ time: point.date, value: point.value }));
    },
  });
}

export function usePortfolioDistribution(portfolioId: string, enabled = true) {
  return useQuery({
    queryKey: ["portfolio", portfolioId, "distribution"],
    enabled: Boolean(portfolioId) && enabled,
    queryFn: async () => {
      const response = await apiClient.get<{
        byAsset: Array<{ ticker: string; value: number; weight: number }>;
        byType: Array<{ type: string; value: number; weight: number }>;
        bySector: Array<{ sector: string; value: number; weight: number }>;
        byCurrency: Array<{ currency: string; value: number; weight: number }>;
      }>(`/portfolios/${portfolioId}/distribution`);
      return response.data;
    },
  });
}
