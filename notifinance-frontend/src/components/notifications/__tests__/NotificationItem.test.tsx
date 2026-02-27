import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotificationItem } from '../NotificationItem';
import { Notification } from '@/types/notification';

describe('NotificationItem', () => {
  const mockNotification: Notification = {
    id: 'n1',
    userId: 'u1',
    title: 'Alerta de Precio: GGAL',
    body: 'GGAL ha superado el umbral de $8.000.',
    type: 'ALERT_TRIGGERED',
    isRead: false,
    metadata: {
      ticker: 'GGAL',
    },
    createdAt: new Date().toISOString(),
  };

  const mockOnMarkAsRead = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClick = vi.fn();

  it('renders notification details correctly', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Alerta de Precio: GGAL')).toBeInTheDocument();
    expect(screen.getByText('GGAL ha superado el umbral de $8.000.')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when check button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const markAsReadButton = screen.getByTitle('Marcar como leída');
    await user.click(markAsReadButton);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('n1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const deleteButton = screen.getByTitle('Eliminar');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('n1');
  });

  it('calls onClick when notification body is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const bodyElement = screen.getByText('GGAL ha superado el umbral de $8.000.');
    await user.click(bodyElement);

    expect(mockOnClick).toHaveBeenCalledWith(mockNotification);
  });

  it('does not show mark as read button if already read', () => {
    const readNotification = { ...mockNotification, isRead: true };
    render(
      <NotificationItem
        notification={readNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.queryByTitle('Marcar como leída')).not.toBeInTheDocument();
  });
});
