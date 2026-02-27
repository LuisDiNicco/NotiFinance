import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Alert, AlertStatus } from "@/types/alert";

interface AlertsResponse {
  data: Alert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertPayload {
  assetId?: string;
  alertType: Alert["alertType"];
  condition: Alert["condition"];
  threshold: number;
  period?: Alert["period"];
  channels: Alert["channels"];
  isRecurring: boolean;
}

interface UseAlertsParams {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useAlerts({ page = 1, limit = 20, enabled = true }: UseAlertsParams = {}) {
  return useQuery({
    queryKey: ["alerts", page, limit],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<AlertsResponse>("/alerts", {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AlertPayload) => {
      const response = await apiClient.post<Alert>("/alerts", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, payload }: { alertId: string; payload: Partial<AlertPayload> }) => {
      const response = await apiClient.patch<Alert>(`/alerts/${alertId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useChangeAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: AlertStatus }) => {
      const response = await apiClient.patch<Alert>(`/alerts/${alertId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      await apiClient.delete(`/alerts/${alertId}`);
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
