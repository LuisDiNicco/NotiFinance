import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MarketStatusBadge } from '../MarketStatusBadge';
import { MarketStatus } from '@/types/market';

describe('MarketStatusBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders open market status correctly', () => {
    const mockStatus: MarketStatus = {
      isOpen: true,
      nextChange: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };

    render(<MarketStatusBadge status={mockStatus} />);

    expect(screen.getByText('Mercado Abierto')).toBeInTheDocument();
    expect(screen.getByText(/Cierra en/)).toBeInTheDocument();
  });

  it('renders closed market status correctly', () => {
    const mockStatus: MarketStatus = {
      isOpen: false,
      nextChange: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    };

    render(<MarketStatusBadge status={mockStatus} />);

    expect(screen.getByText('Mercado Cerrado')).toBeInTheDocument();
    expect(screen.getByText(/Abre en/)).toBeInTheDocument();
  });
});
