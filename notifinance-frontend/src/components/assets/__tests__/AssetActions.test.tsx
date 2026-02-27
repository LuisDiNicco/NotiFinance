import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AssetActions } from '../AssetActions';
import { useAuthStore } from '@/stores/authStore';
import { Asset } from '@/types/market';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AssetActions', () => {
  const mockAsset: Asset = {
    id: '1',
    symbol: 'GGAL',
    name: 'Grupo Financiero Galicia',
    type: 'STOCK',
    price: 4500,
    variation: 2.5,
    currency: 'ARS',
  };

  it('shows error when unauthenticated user tries to add to watchlist', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    render(<AssetActions asset={mockAsset} />);

    const watchlistBtn = screen.getByRole('button', { name: /agregar a watchlist/i });
    await user.click(watchlistBtn);

    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Debes iniciar sesión para agregar a tu watchlist');
  });

  it('shows error when unauthenticated user tries to create alert', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    render(<AssetActions asset={mockAsset} />);

    const alertBtn = screen.getByRole('button', { name: /crear alerta/i });
    await user.click(alertBtn);

    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Debes iniciar sesión para crear alertas');
  });

  it('toggles watchlist state when authenticated', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);

    render(<AssetActions asset={mockAsset} />);

    const watchlistBtn = screen.getByRole('button', { name: /agregar a watchlist/i });
    await user.click(watchlistBtn);

    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith('GGAL agregado a tu watchlist');
    
    // Button text should change
    expect(screen.getByRole('button', { name: /en watchlist/i })).toBeInTheDocument();
  });
});
