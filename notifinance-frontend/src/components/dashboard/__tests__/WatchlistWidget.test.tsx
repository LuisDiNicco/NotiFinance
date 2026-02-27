import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WatchlistWidget } from '../WatchlistWidget';
import { WatchlistItem } from '@/types/market';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('WatchlistWidget', () => {
  const mockItems: WatchlistItem[] = [
    { id: '1', symbol: 'YPFD', name: 'YPF S.A.', price: 25000, variation: 5.5, type: 'STOCK' },
    { id: '2', symbol: 'AAPL', name: 'Apple Inc.', price: 15000, variation: -1.5, type: 'CEDEAR' },
  ];

  it('does not render when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuthStore>);

    const { container } = render(<WatchlistWidget items={mockItems} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders empty state when authenticated but no items', () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);

    render(<WatchlistWidget items={[]} />);

    expect(screen.getByText('Mi Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Tu watchlist está vacía')).toBeInTheDocument();
    expect(screen.getByText('Explorar activos')).toBeInTheDocument();
  });

  it('renders items when authenticated and has items', () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuthStore>);

    render(<WatchlistWidget items={mockItems} />);

    expect(screen.getByText('Mi Watchlist')).toBeInTheDocument();
    expect(screen.getByText('YPFD')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.queryByText('Tu watchlist está vacía')).not.toBeInTheDocument();
  });
});
