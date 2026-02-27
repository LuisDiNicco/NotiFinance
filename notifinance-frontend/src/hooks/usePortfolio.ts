import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Portfolio } from "@/types/portfolio";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Portfolio[] }>("/portfolio");
      return response.data.data;
    },
  });
}
