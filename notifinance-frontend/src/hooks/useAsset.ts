import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Asset } from "@/types/market";

export function useAsset(ticker: string) {
  return useQuery({
    queryKey: ["asset", ticker],
    queryFn: async () => {
      const response = await apiClient.get<Asset>(`/assets/${ticker}`);
      return response.data;
    },
    enabled: Boolean(ticker),
  });
}
