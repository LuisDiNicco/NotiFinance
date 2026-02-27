"use client";

import { useState } from "react";
import { Alert } from "@/types/alert";
import { mockAlerts } from "@/services/mockAlertsData";
import {
  AlertPayload,
  useAlerts,
  useChangeAlertStatus,
  useCreateAlert,
  useDeleteAlert,
  useUpdateAlert,
} from "@/hooks/useAlerts";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertFormModal } from "@/components/alerts/AlertFormModal";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function AlertsPage() {
  const [fallbackAlerts, setFallbackAlerts] = useState<Alert[]>(mockAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertToEdit, setAlertToEdit] = useState<Alert | null>(null);
  const alertsQuery = useAlerts();
  const createAlertMutation = useCreateAlert();
  const updateAlertMutation = useUpdateAlert();
  const changeStatusMutation = useChangeAlertStatus();
  const deleteAlertMutation = useDeleteAlert();

  const usingFallback = alertsQuery.isError;
  const alerts = usingFallback ? fallbackAlerts : (alertsQuery.data?.data ?? []);

  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const maxAlerts = 20;

  const handleToggle = async (id: string, active: boolean) => {
    if (usingFallback) {
      setFallbackAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? { ...alert, status: active ? "ACTIVE" : "PAUSED" }
            : alert,
        ),
      );
      toast.success(`Alerta ${active ? "activada" : "pausada"}`);
      return;
    }

    try {
      await changeStatusMutation.mutateAsync({
        alertId: id,
        status: active ? "ACTIVE" : "PAUSED",
      });
      toast.success(`Alerta ${active ? "activada" : "pausada"}`);
    } catch {
      toast.error("No se pudo actualizar el estado de la alerta");
    }
  };

  const handleDelete = async (id: string) => {
    if (usingFallback) {
      setFallbackAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast.success("Alerta eliminada");
      return;
    }

    try {
      await deleteAlertMutation.mutateAsync(id);
      toast.success("Alerta eliminada");
    } catch {
      toast.error("No se pudo eliminar la alerta");
    }
  };

  const handleEdit = (alert: Alert) => {
    setAlertToEdit(alert);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (activeAlertsCount >= maxAlerts) {
      toast.error(`Has alcanzado el límite de ${maxAlerts} alertas activas`);
      return;
    }
    setAlertToEdit(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: AlertPayload) => {
    if (usingFallback) {
      if (alertToEdit) {
        setFallbackAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertToEdit.id ? { ...alert, ...data } : alert,
          ),
        );
        toast.success("Alerta actualizada");
      } else {
        const newAlert: Alert = {
          id: `a${Date.now()}`,
          userId: "u1",
          ...data,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };
        setFallbackAlerts((prev) => [newAlert, ...prev]);
        toast.success("Alerta creada");
      }
      setIsModalOpen(false);
      return;
    }

    try {
      if (alertToEdit) {
        await updateAlertMutation.mutateAsync({
          alertId: alertToEdit.id,
          payload: data,
        });
        toast.success("Alerta actualizada");
      } else {
        await createAlertMutation.mutateAsync(data);
        toast.success("Alerta creada");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("No se pudo guardar la alerta. Verificá los datos e intentá nuevamente.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Alertas</h1>
          <p className="text-muted-foreground">
            Configurá notificaciones para estar al tanto de los movimientos del mercado.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{activeAlertsCount}</span> / {maxAlerts} activas
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Alerta
          </Button>
        </div>
      </div>

      {alertsQuery.isLoading && !usingFallback ? (
        <div className="flex items-center justify-center rounded-lg border bg-muted/10 py-10 text-sm text-muted-foreground">
          Cargando alertas...
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
          <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tenés alertas configuradas</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-4">
            Creá tu primera alerta para recibir notificaciones cuando un activo alcance el precio que esperás.
          </p>
          <Button onClick={handleCreate}>Crear mi primera alerta</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AlertFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        alertToEdit={alertToEdit}
        onSave={handleSave}
      />
    </main>
  );
}
