import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TopMoversTable } from '../TopMoversTable';

describe('TopMoversTable', () => {
  const mockData = {
    acciones: {
      gainers: [
        { symbol: 'YPFD', name: 'YPF S.A.', price: 25000, variation: 5.5, type: 'STOCK' as const },
      ],
      losers: [
        { symbol: 'GGAL', name: 'Grupo Financiero Galicia', price: 4500, variation: -2.1, type: 'STOCK' as const },
      ],
    },
    cedears: {
      gainers: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 15000, variation: 1.5, type: 'CEDEAR' as const },
      ],
      losers: [
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 12000, variation: -3.5, type: 'CEDEAR' as const },
      ],
    },
  };

  it('renders initial state correctly (acciones, gainers)', () => {
    render(<TopMoversTable data={mockData} />);

    expect(screen.getByText('Top Movers')).toBeInTheDocument();
    expect(screen.getByText('YPFD')).toBeInTheDocument();
    expect(screen.getByText('YPF S.A.')).toBeInTheDocument();
    expect(screen.queryByText('GGAL')).not.toBeInTheDocument();
  });

  it('switches to losers when clicking Peores tab', async () => {
    const user = userEvent.setup();
    render(<TopMoversTable data={mockData} />);

    const losersTab = screen.getByRole('tab', { name: 'Peores' });
    await user.click(losersTab);

    // Wait for the state update to reflect in the DOM
    const ggalElement = await screen.findByText('Grupo Financiero Galicia', {}, { timeout: 5000 });
    expect(ggalElement).toBeInTheDocument();
    expect(screen.queryByText('YPF S.A.')).not.toBeInTheDocument();
  });

  it('switches to cedears when clicking CEDEARs tab', async () => {
    const user = userEvent.setup();
    render(<TopMoversTable data={mockData} />);

    const cedearsTab = screen.getByRole('tab', { name: 'CEDEARs' });
    await user.click(cedearsTab);

    // Wait for the state update to reflect in the DOM
    const aaplElement = await screen.findByText('Apple Inc.', {}, { timeout: 5000 });
    expect(aaplElement).toBeInTheDocument();
    expect(screen.queryByText('YPF S.A.')).not.toBeInTheDocument();
  });
});
