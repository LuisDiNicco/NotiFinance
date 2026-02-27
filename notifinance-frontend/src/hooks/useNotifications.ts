import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { NotificationItem } from "@/types/notification";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications", "inbox"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: NotificationItem[] }>("/notifications");
      return response.data.data;
    },
  });
}
