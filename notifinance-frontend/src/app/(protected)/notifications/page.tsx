"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Notification } from "@/types/notification";
import {
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const notificationsQuery = useNotifications({ unreadOnly: activeTab === "unread", page: 1, limit: 100 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = (notificationsQuery.data?.data as Notification[] | undefined) ?? [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "alerts") return n.type === "ALERT_TRIGGERED";
    if (activeTab === "market") return n.type === "MARKET_UPDATE";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch {
      toast.error("No se pudo marcar la notificación como leída");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllMutation.mutateAsync();
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch {
      toast.error("No se pudieron marcar todas las notificaciones");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Notificación eliminada");
    } catch {
      toast.error("No se pudo eliminar la notificación");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type/metadata
    if (notification.metadata?.ticker) {
      router.push(`/assets/${notification.metadata.ticker}`);
    } else if (notification.metadata?.portfolioId) {
      router.push(`/portfolio`);
    } else if (notification.metadata?.alertId) {
      router.push(`/alerts`);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Historial de alertas y actualizaciones del mercado.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">
            No leídas
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0 space-y-4">
          {notificationsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-lg border bg-muted/10 py-10 text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notificationsQuery.isError ? (
            <div className="flex items-center justify-center rounded-lg border bg-muted/10 py-10 text-sm text-destructive">
              No se pudieron cargar notificaciones confiables. Reintentá en unos segundos.
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
              <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No hay notificaciones</h3>
              <p className="text-muted-foreground mt-1">
                {activeTab === "unread" 
                  ? "No tenés notificaciones sin leer." 
                  : "Aún no has recibido notificaciones de este tipo."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))}

              <div className="mt-2 flex items-center justify-between rounded-md border p-3">
                <p className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
