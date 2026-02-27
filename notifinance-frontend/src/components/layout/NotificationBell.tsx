"use client";

import { useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { useSocket } from "@/hooks/useSocket";
import { Notification } from "@/types/notification";
import { mockNotifications } from "@/services/mockNotificationsData";

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const { data } = useNotifications();
  const { notificationSocket } = useSocket();
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([]);

  const notifications = useMemo(
    () => (data && data.length > 0 ? (data as Notification[]) : mockNotifications),
    [data],
  );

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setLiveNotifications((previous) => [notification, ...previous]);
    };

    notificationSocket.on("notification:new", handleNewNotification);
    return () => {
      notificationSocket.off("notification:new", handleNewNotification);
    };
  }, [notificationSocket]);

  const inbox = [...liveNotifications, ...notifications].slice(0, 5);
  const unreadCount = inbox.filter((item) => !item.isRead).length;

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
          {inbox.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm flex items-center gap-2">
                  {!notification.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground">hace un momento</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="justify-center text-primary cursor-pointer">
            <Link href="/notifications">Ver todas las notificaciones</Link>
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
