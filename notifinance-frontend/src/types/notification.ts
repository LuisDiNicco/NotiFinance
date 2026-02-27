export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}