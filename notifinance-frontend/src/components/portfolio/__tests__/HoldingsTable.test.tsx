import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoldingsTable } from '../HoldingsTable';
import { Holding } from '@/types/portfolio';

describe('HoldingsTable', () => {
  const mockHoldings: Holding[] = [
    {
      assetId: '1',
      ticker: 'GGAL',
      name: 'Grupo Financiero Galicia',
      type: 'STOCK',
      quantity: 1000,
      avgCostBasis: 3500,
      currentPrice: 4500,
      marketValue: 4500000,
      unrealizedPnl: 1000000,
      unrealizedPnlPct: 28.57,
      dailyPnl: 112500,
      dailyPnlPct: 2.56,
      weight: 30,
      currency: 'ARS',
    },
  ];

  it('renders empty state when no holdings', () => {
    render(<HoldingsTable holdings={[]} />);
    expect(screen.getByText('No hay activos en este portafolio.')).toBeInTheDocument();
  });

  it('renders holdings correctly', () => {
    render(<HoldingsTable holdings={mockHoldings} />);

    expect(screen.getByText('GGAL')).toBeInTheDocument();
    expect(screen.getByText('Grupo Financiero Galicia')).toBeInTheDocument();
    expect(screen.getByText('1.000')).toBeInTheDocument(); // Quantity
    expect(screen.getByText(/\$ 3\.500/)).toBeInTheDocument(); // Avg Cost
    expect(screen.getByText(/\$ 4\.500,00/)).toBeInTheDocument(); // Current Price
    expect(screen.getByText(/\$ 4\.500\.000/)).toBeInTheDocument(); // Market Value
    expect(screen.getByText(/\+28,57%/)).toBeInTheDocument(); // PnL Pct
    expect(screen.getByText(/\$ 1\.000\.000/)).toBeInTheDocument(); // PnL
    expect(screen.getByText('30%')).toBeInTheDocument(); // Weight
  });
});
