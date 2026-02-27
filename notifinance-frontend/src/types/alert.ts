export type AlertType = "PRICE" | "PCT_CHANGE" | "DOLLAR" | "RISK";
export type AlertCondition = "ABOVE" | "BELOW" | "CROSSES" | "PCT_UP" | "PCT_DOWN";
export type AlertStatus = "ACTIVE" | "PAUSED" | "TRIGGERED" | "EXPIRED";

export interface Alert {
  id: string;
  userId: string;
  assetId?: string;
  alertType: AlertType;
  condition: AlertCondition;
  threshold: number;
  channels: Array<"IN_APP" | "EMAIL">;
  isRecurring: boolean;
  status: AlertStatus;
  createdAt: string;
}