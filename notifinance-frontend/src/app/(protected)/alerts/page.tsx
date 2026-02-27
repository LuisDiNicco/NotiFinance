"use client";

import { useState } from "react";
import { Alert } from "@/types/alert";
import { mockAlerts } from "@/services/mockAlertsData";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertFormModal } from "@/components/alerts/AlertFormModal";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertToEdit, setAlertToEdit] = useState<Alert | null>(null);

  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const maxAlerts = 20;

  const handleToggle = (id: string, active: boolean) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: active ? "ACTIVE" : "PAUSED" }
          : alert
      )
    );
    toast.success(`Alerta ${active ? "activada" : "pausada"}`);
  };

  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    toast.success("Alerta eliminada");
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

  const handleSave = (data: Omit<Alert, "id" | "userId" | "status" | "createdAt">) => {
    if (alertToEdit) {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertToEdit.id ? { ...alert, ...data } : alert
        )
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
      setAlerts((prev) => [newAlert, ...prev]);
      toast.success("Alerta creada");
    }
    setIsModalOpen(false);
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

      {alerts.length === 0 ? (
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
