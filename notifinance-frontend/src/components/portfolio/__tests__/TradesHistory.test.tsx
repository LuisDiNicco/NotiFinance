import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TradesHistory } from '../TradesHistory';
import { Trade } from '@/types/portfolio';

describe('TradesHistory', () => {
  const mockTrades: Trade[] = [
    {
      id: 't1',
      portfolioId: '1',
      ticker: 'GGAL',
      tradeType: 'BUY',
      quantity: 500,
      pricePerUnit: 3000,
      currency: 'ARS',
      commission: 15000,
      executedAt: '2023-02-10T11:15:00Z',
    },
    {
      id: 't2',
      portfolioId: '1',
      ticker: 'AAPL',
      tradeType: 'SELL',
      quantity: 100,
      pricePerUnit: 15000,
      currency: 'ARS',
      commission: 0,
      executedAt: '2023-05-22T14:45:00Z',
    },
  ];

  it('renders empty state when no trades', () => {
    render(<TradesHistory trades={[]} />);
    expect(screen.getByText('No hay operaciones registradas.')).toBeInTheDocument();
  });

  it('renders trades correctly', () => {
    render(<TradesHistory trades={mockTrades} />);

    // Check first trade (BUY)
    expect(screen.getByText('GGAL')).toBeInTheDocument();
    expect(screen.getByText('COMPRA')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText(/\$ 3\.000/)).toBeInTheDocument();
    expect(screen.getAllByText(/\$ 15\.000/)[0]).toBeInTheDocument(); // Commission
    expect(screen.getByText(/\$ 1\.515\.000/)).toBeInTheDocument(); // Total (500 * 3000 + 15000)

    // Check second trade (SELL)
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('VENTA')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getAllByText(/\$ 15\.000/)[1]).toBeInTheDocument();
    expect(screen.getByText(/\$ 1\.500\.000/)).toBeInTheDocument(); // Total (100 * 15000 + 0)
  });
});
