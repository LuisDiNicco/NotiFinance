import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AssetsTable } from '../AssetsTable';
import { Asset } from '@/types/market';

describe('AssetsTable', () => {
  const mockAssets: Asset[] = [
    {
      id: '1',
      symbol: 'GGAL',
      name: 'Grupo Financiero Galicia',
      type: 'STOCK',
      price: 4500,
      variation: 2.5,
      volume: 1500000,
      currency: 'ARS',
    },
    {
      id: '2',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'CEDEAR',
      price: 15000,
      variation: -1.5,
      volume: 2000000,
      currency: 'ARS',
    },
  ];

  it('renders all assets initially', () => {
    render(<AssetsTable initialData={mockAssets} />);

    expect(screen.getByText('GGAL')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('filters assets by search term', async () => {
    const user = userEvent.setup();
    render(<AssetsTable initialData={mockAssets} />);

    const searchInput = screen.getByPlaceholderText(/buscar por ticker o nombre/i);
    await user.type(searchInput, 'apple');

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.queryByText('GGAL')).not.toBeInTheDocument();
  });
});
