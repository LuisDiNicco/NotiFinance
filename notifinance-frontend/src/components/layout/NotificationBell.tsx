"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  
  // Mock unread count for now
  const unreadCount = 3;

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-sm">Alerta de Precio</span>
              <span className="text-xs text-muted-foreground">Hace 5m</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              GGAL ha superado tu precio objetivo de $3,500.
            </p>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-sm">Nuevo Reporte</span>
              <span className="text-xs text-muted-foreground">Hace 1h</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              El reporte diario de mercado ya está disponible.
            </p>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-primary cursor-pointer">
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
