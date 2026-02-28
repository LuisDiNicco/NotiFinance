import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Asset } from "@/types/market";
import { AxiosError } from "axios";

interface BackendAsset {
  id?: string;
  ticker: string;
  name: string;
  assetType: string;
  sector?: string;
  currency?: string;
  metadata?: {
    marketCap?: number;
  };
}

interface AssetStatsResponse {
  latestClose: number;
  changePctFromPeriodStart: number;
}

interface AssetQuoteResponse {
  date: string;
  closePrice: number | null;
  volume: number | null;
}

interface AssetsPaginatedResponse {
  data: BackendAsset[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AssetDetailData {
  asset: Asset;
  history: { time: string; value: number }[];
  relatedAssets: Asset[];
}

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

function mapBackendAsset(asset: BackendAsset, stats?: AssetStatsResponse): Asset {
  return {
    id: asset.id ?? asset.ticker,
    symbol: asset.ticker,
    name: asset.name,
    type: asset.assetType,
    price: Number(stats?.latestClose ?? 0),
    variation: Number(stats?.changePctFromPeriodStart ?? 0),
    volume: undefined,
    marketCap: Number(asset.metadata?.marketCap ?? 0) || undefined,
    sector: asset.sector,
    currency: asset.currency ?? "ARS",
  };
}

export function useAsset(ticker: string) {
  return useQuery({
    queryKey: ["asset", ticker],
    queryFn: async () => {
      const [assetResponse, statsResponse] = await Promise.all([
        apiClient.get<BackendAsset>(`/assets/${ticker}`),
        apiClient.get<AssetStatsResponse>(`/assets/${ticker}/stats`, {
          params: { days: 30 },
        }),
      ]);

      return mapBackendAsset(assetResponse.data, statsResponse.data);
    },
    enabled: Boolean(ticker),
  });
}

export function useAssetsCatalog(params?: { type?: string; limit?: number; page?: number }) {
  const { type, limit = 100, page = 1 } = params ?? {};
  const cacheKey = `assets:catalog:${type ?? "ALL"}:${page}:${limit}`;

  return useQuery({
    queryKey: ["assets", "catalog", type ?? "ALL", page, limit],
    queryFn: async () => {
      try {
        const response = await apiClient.get<AssetsPaginatedResponse>("/assets", {
          params: {
            type,
            page,
            limit,
          },
        });

        const assets = await Promise.all(
          response.data.data.map(async (item): Promise<Asset> => {
            try {
              const statsResponse = await apiClient.get<AssetStatsResponse>(`/assets/${item.ticker}/stats`, {
                params: { days: 30 },
              });
              return mapBackendAsset(item, statsResponse.data);
            } catch {
              return mapBackendAsset(item);
            }
          }),
        );

        writeCache(cacheKey, assets);
        return assets;
      } catch (error) {
        const cached = readCache<Asset[]>(cacheKey);
        if (cached && cached.length > 0) {
          return cached;
        }

        throw error;
      }
    },
    staleTime: 30_000,
  });
}

export function useAssetDetail(ticker: string) {
  const cacheKey = `asset:detail:${ticker}`;

  return useQuery({
    queryKey: ["asset", "detail", ticker],
    enabled: Boolean(ticker),
    queryFn: async (): Promise<AssetDetailData | null> => {
      try {
        const [assetResponse, statsResponse, quotesResponse, relatedResponse] = await Promise.all([
          apiClient.get<BackendAsset>(`/assets/${ticker}`),
          apiClient.get<AssetStatsResponse>(`/assets/${ticker}/stats`, {
            params: { days: 30 },
          }),
          apiClient.get<AssetQuoteResponse[]>(`/assets/${ticker}/quotes`, {
            params: { days: 180 },
          }),
          apiClient.get<BackendAsset[]>(`/assets/${ticker}/related`, {
            params: { limit: 6 },
          }),
        ]);

        const relatedAssets = await Promise.all(
          relatedResponse.data.map(async (item): Promise<Asset> => {
            try {
              const relatedStatsResponse = await apiClient.get<AssetStatsResponse>(`/assets/${item.ticker}/stats`, {
                params: { days: 30 },
              });
              return mapBackendAsset(item, relatedStatsResponse.data);
            } catch {
              return mapBackendAsset(item);
            }
          }),
        );

        const detailData = {
          asset: mapBackendAsset(assetResponse.data, statsResponse.data),
          history: quotesResponse.data
            .map((point) => ({ time: point.date, value: Number(point.closePrice ?? 0) }))
            .filter((point) => point.value > 0),
          relatedAssets,
        };

        writeCache(cacheKey, detailData);
        return detailData;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }

        const cached = readCache<AssetDetailData>(cacheKey);
        if (cached) {
          return cached;
        }

        throw error;
      }
    },
  });
}
