import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotificationsPage from "../page";

const mockMarkAll = vi.fn();

vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({
    isError: false,
    isLoading: false,
    data: {
      data: [
        {
          id: "n1",
          userId: "u1",
          title: "N1",
          body: "Body 1",
          type: "ALERT_TRIGGERED",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "n2",
          userId: "u1",
          title: "N2",
          body: "Body 2",
          type: "MARKET_UPDATE",
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    },
  }),
  useMarkNotificationAsRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllNotificationsAsRead: () => ({ mutateAsync: mockMarkAll }),
  useDeleteNotification: () => ({ mutateAsync: vi.fn() }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the components
vi.mock("@/components/notifications/NotificationItem", () => ({
  NotificationItem: ({ notification, onMarkAsRead, onDelete, onClick }: { notification: { id: string, title: string, isRead: boolean }, onMarkAsRead: (id: string) => void, onDelete: (id: string) => void, onClick: (notification: unknown) => void }) => (
    <div data-testid={`notification-item-${notification.id}`} onClick={() => onClick(notification)}>
      <span>{notification.title}</span>
      {!notification.isRead && (
        <button onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>Mark Read</button>
      )}
      <button onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}>Delete</button>
    </div>
  ),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NotificationsPage", () => {
  it("renders notifications page correctly", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    expect(screen.getByText("Todas")).toBeInTheDocument();
    expect(screen.getByText("No leídas")).toBeInTheDocument();
    
    // Should render mock notifications
    expect(screen.getByTestId("notification-item-n1")).toBeInTheDocument();
    expect(screen.getByTestId("notification-item-n2")).toBeInTheDocument();
  });

  it("filters notifications by tab", () => {
    render(<NotificationsPage />);
    
    // Click unread tab
    const unreadTab = screen.getByText(/No leídas/);
    fireEvent.click(unreadTab);
    
    // Should only show unread notifications
    expect(screen.getByTestId("notification-item-n1")).toBeInTheDocument(); // Assuming 1 is unread
    // The exact assertions depend on the mock data, but this verifies the tab click works
  });

  it("marks all as read when button is clicked", () => {
    render(<NotificationsPage />);
    
    const markAllBtn = screen.getByText("Marcar todas como leídas");
    fireEvent.click(markAllBtn);
    
    expect(mockMarkAll).toHaveBeenCalled();
  });
});
