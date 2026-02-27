import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { WatchlistItem } from "@/types/market";

interface WatchlistApiItem {
  id?: string;
  assetId: string;
}

interface AssetDetailResponse {
  ticker: string;
  name: string;
  assetType: string;
}

interface AssetStatsResponse {
  latestClose: number;
  changePctFromPeriodStart: number;
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WatchlistApiItem[] }>("/watchlist");

      const mapped = await Promise.all(
        response.data.data.map(async (item, index): Promise<WatchlistItem> => {
          try {
            const [assetResponse, statsResponse] = await Promise.all([
              apiClient.get<AssetDetailResponse>(`/assets/${item.assetId}`),
              apiClient.get<AssetStatsResponse>(`/assets/${item.assetId}/stats`),
            ]);

            return {
              id: item.id ?? `${item.assetId}-${index}`,
              symbol: assetResponse.data.ticker,
              name: assetResponse.data.name,
              type: assetResponse.data.assetType as WatchlistItem["type"],
              price: Number(statsResponse.data.latestClose ?? 0),
              variation: Number(statsResponse.data.changePctFromPeriodStart ?? 0),
            };
          } catch {
            return {
              id: item.id ?? `${item.assetId}-${index}`,
              symbol: item.assetId,
              name: item.assetId,
              type: "STOCK",
              price: 0,
              variation: 0,
            };
          }
        }),
      );

      return mapped;
    },
  });
}

export function useAddWatchlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      const response = await apiClient.post("/watchlist", { ticker });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useRemoveWatchlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticker: string) => {
      await apiClient.delete(`/watchlist/${ticker}`);
      return ticker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}
