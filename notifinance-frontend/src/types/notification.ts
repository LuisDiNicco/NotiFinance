export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "ALERT_TRIGGERED" | "MARKET_UPDATE" | "SYSTEM";
  metadata?: {
    ticker?: string;
    price?: number;
    alertId?: string;
    portfolioId?: string;
    performance?: number;
    dollarType?: string;
    changePct?: number;
    riskValue?: number;
    [key: string]: unknown;
  };
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type NotificationItem = Notification;