import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { DollarQuote } from "@/types/market";

export function useDollarQuotes() {
  return useQuery({
    queryKey: ["market", "dollar"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DollarQuote[] }>("/market/dollar");
      return response.data.data;
    },
  });
}
