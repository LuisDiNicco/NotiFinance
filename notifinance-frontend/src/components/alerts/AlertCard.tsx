import { Alert } from "@/types/alert";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, DollarSign, TrendingDown, TrendingUp, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
}

export function AlertCard({ alert, onToggle, onEdit, onDelete }: AlertCardProps) {
  const getIcon = () => {
    switch (alert.alertType) {
      case "PRICE":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "PCT_CHANGE":
        return alert.condition === "PCT_DOWN" ? (
          <TrendingDown className="h-5 w-5 text-red-500" />
        ) : (
          <TrendingUp className="h-5 w-5 text-green-500" />
        );
      case "DOLLAR":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "RISK":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (alert.alertType) {
      case "PRICE":
        return `Precio de ${alert.assetId}`;
      case "PCT_CHANGE":
        return `Variación de ${alert.assetId}`;
      case "DOLLAR":
        return "Dólar";
      case "RISK":
        return "Riesgo País";
      default:
        return "Alerta";
    }
  };

  const getDescription = () => {
    const thresholdStr =
      alert.alertType === "PCT_CHANGE"
        ? formatPercent(alert.threshold)
        : alert.alertType === "RISK"
        ? alert.threshold.toString()
        : formatCurrency(alert.threshold);

    switch (alert.condition) {
      case "ABOVE":
        return `Sube por encima de ${thresholdStr}`;
      case "BELOW":
        return `Baja por debajo de ${thresholdStr}`;
      case "CROSSES":
        return `Cruza ${thresholdStr}`;
      case "PCT_UP":
        return `Sube más de ${thresholdStr}`;
      case "PCT_DOWN":
        return `Baja más de ${thresholdStr}`;
      default:
        return `Condición: ${alert.condition} ${thresholdStr}`;
    }
  };

  const getStatusBadge = () => {
    switch (alert.status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500">Activa</Badge>;
      case "PAUSED":
        return <Badge variant="secondary">Pausada</Badge>;
      case "TRIGGERED":
        return <Badge variant="destructive">Disparada</Badge>;
      case "EXPIRED":
        return <Badge variant="outline">Expirada</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-lg">{getTitle()}</h3>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{getDescription()}</p>
        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
          <span>Canales: {alert.channels.join(", ")}</span>
          <span>•</span>
          <span>{alert.isRecurring ? "Recurrente" : "Una sola vez"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={alert.status === "ACTIVE"}
            onCheckedChange={(checked) => onToggle(alert.id, checked)}
            disabled={alert.status === "TRIGGERED" || alert.status === "EXPIRED"}
          />
          <span className="text-sm text-muted-foreground">
            {alert.status === "ACTIVE" ? "Activada" : "Pausada"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(alert)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(alert.id)} className="text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
