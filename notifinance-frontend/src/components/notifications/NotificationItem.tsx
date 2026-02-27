import { Notification } from "@/types/notification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, TrendingUp, DollarSign, AlertTriangle, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const getIcon = () => {
    if (notification.type === "ALERT_TRIGGERED") {
      if (notification.metadata?.ticker) return <TrendingUp className="h-5 w-5 text-blue-500" />;
      if (notification.metadata?.dollarType) return <DollarSign className="h-5 w-5 text-green-600" />;
      if (notification.metadata?.riskValue) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      return <Bell className="h-5 w-5 text-primary" />;
    }
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Card 
      className={cn(
        "w-full transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5 border-primary/20"
      )}
    >
      <CardContent className="p-4 flex gap-4">
        <div className="mt-1 flex-shrink-0">
          {getIcon()}
        </div>
        
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onClick?.(notification)}
        >
          <div className="flex justify-between items-start gap-2">
            <h4 className={cn("font-medium text-sm", !notification.isRead && "font-semibold")}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.body}
          </p>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {!notification.isRead && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title="Marcar como leída"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
