import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { WatchlistItem } from "@/types/market";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WatchlistItem[] }>("/watchlist");
      return response.data.data;
    },
  });
}
