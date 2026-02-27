import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Alert } from "@/types/alert";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Alert[] }>("/alerts");
      return response.data.data;
    },
  });
}
