import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { WatchlistItem } from "@/types/market";

interface WatchlistApiItem {
  id?: string;
  assetId: string;
}

interface AssetDetailResponse {
  id?: string;
  ticker: string;
  name: string;
  assetType: string;
}

interface AssetStatsResponse {
  latestClose: number;
  changePctFromPeriodStart: number;
}

interface AssetQuoteResponse {
  closePrice: number | null;
}

interface AssetsCatalogResponse {
  data: AssetDetailResponse[];
  meta: {
    page: number;
    totalPages: number;
  };
}

async function resolveAssetsByIds(assetIds: string[]): Promise<Map<string, AssetDetailResponse>> {
  const ids = new Set(assetIds);
  const result = new Map<string, AssetDetailResponse>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && result.size < ids.size) {
    const response = await apiClient.get<AssetsCatalogResponse>("/assets", {
      params: { page, limit: 100 },
    });

    totalPages = response.data.meta.totalPages;

    for (const asset of response.data.data) {
      if (asset.id && ids.has(asset.id)) {
        result.set(asset.id, asset);
      }
    }

    page += 1;
  }

  return result;
}

export function useWatchlist(enabled = true) {
  return useQuery({
    queryKey: ["watchlist"],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ data: WatchlistApiItem[] }>("/watchlist");
      const assetsById = await resolveAssetsByIds(
        response.data.data.map((item) => item.assetId),
      );

      const mapped = await Promise.all(
        response.data.data.map(async (item, index): Promise<WatchlistItem | null> => {
          const asset = assetsById.get(item.assetId);

          if (!asset) {
            return null;
          }

          try {
            const statsResponse = await apiClient.get<AssetStatsResponse>(`/assets/${asset.ticker}/stats`);

            return {
              id: item.id ?? `${item.assetId}-${index}`,
              symbol: asset.ticker,
              name: asset.name,
              type: asset.assetType as WatchlistItem["type"],
              price: Number(statsResponse.data.latestClose ?? 0),
              variation: Number(statsResponse.data.changePctFromPeriodStart ?? 0),
            };
          } catch {
            try {
              const quoteResponse = await apiClient.get<AssetQuoteResponse[]>(
                `/assets/${asset.ticker}/quotes`,
                {
                  params: { days: 1 },
                },
              );
              const latestPrice = quoteResponse.data
                .map((point) => Number(point.closePrice ?? 0))
                .find((value) => Number.isFinite(value) && value > 0);

              if (!latestPrice) {
                return null;
              }

              return {
                id: item.id ?? `${item.assetId}-${index}`,
                symbol: asset.ticker,
                name: asset.name,
                type: asset.assetType as WatchlistItem["type"],
                price: latestPrice,
                variation: 0,
              };
            } catch {
              return null;
            }
          }
        }),
      );

      return mapped.filter((item): item is WatchlistItem => Boolean(item));
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
