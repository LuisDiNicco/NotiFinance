import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { NotificationItem } from "@/types/notification";

interface NotificationsResponse {
  data: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useNotifications({ unreadOnly = false, page = 1, limit = 20, enabled = true }: UseNotificationsParams = {}) {
  return useQuery({
    queryKey: ["notifications", unreadOnly, page, limit],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<NotificationsResponse>("/notifications", {
        params: {
          unreadOnly,
          page,
          limit,
        },
      });
      return response.data;
    },
  });
}

export function useUnreadNotificationsCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "count"],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ unreadCount: number }>("/notifications/count");
      return response.data.unreadCount;
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.patch<{ id: string; isRead: boolean; readAt: string | null } | null>(
        `/notifications/${notificationId}/read`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<{ updatedCount: number }>("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/notifications/${notificationId}`);
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
