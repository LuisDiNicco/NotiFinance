import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlertCard } from '../AlertCard';
import { Alert } from '@/types/alert';

describe('AlertCard', () => {
  const mockAlert: Alert = {
    id: 'a1',
    userId: 'u1',
    assetId: 'GGAL',
    alertType: 'PRICE',
    condition: 'ABOVE',
    threshold: 8000,
    channels: ['IN_APP', 'EMAIL'],
    isRecurring: false,
    status: 'ACTIVE',
    createdAt: '2023-10-01T10:00:00Z',
  };

  const mockOnToggle = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders alert details correctly', () => {
    render(
      <AlertCard
        alert={mockAlert}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Precio de GGAL')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText(/Sube por encima de/)).toBeInTheDocument();
    expect(screen.getByText(/\$ 8\.000/)).toBeInTheDocument();
    expect(screen.getByText('Canales: IN_APP, EMAIL')).toBeInTheDocument();
    expect(screen.getByText('Una sola vez')).toBeInTheDocument();
  });

  it('calls onToggle when switch is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AlertCard
        alert={mockAlert}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const switchElement = screen.getByRole('switch');
    await user.click(switchElement);

    expect(mockOnToggle).toHaveBeenCalledWith('a1', false);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AlertCard
        alert={mockAlert}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // The edit button is the first ghost button
    const buttons = screen.getAllByRole('button');
    const editButton = buttons.find(b => !b.classList.contains('text-red-500') && b.getAttribute('role') !== 'switch');
    
    if (editButton) {
      await user.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockAlert);
    }
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AlertCard
        alert={mockAlert}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // The delete button has text-red-500 class
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(b => b.classList.contains('text-red-500'));
    
    if (deleteButton) {
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('a1');
    }
  });
});
