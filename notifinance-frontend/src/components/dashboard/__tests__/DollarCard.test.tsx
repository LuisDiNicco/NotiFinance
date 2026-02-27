import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DollarCard } from '../DollarCard';
import { DollarQuote } from '@/types/market';

describe('DollarCard', () => {
  it('renders dollar quote correctly', () => {
    const mockQuote: DollarQuote = {
      type: 'Blue',
      buyPrice: 1000,
      sellPrice: 1020,
      spread: 20,
      timestamp: new Date().toISOString(),
    };

    render(<DollarCard quote={mockQuote} />);

    expect(screen.getByText('Dólar Blue')).toBeInTheDocument();
    expect(screen.getByText('Compra')).toBeInTheDocument();
    expect(screen.getByText('Venta')).toBeInTheDocument();
    // formatCurrency might format it as $1,000.00 or similar depending on locale
    // We can just check if the numbers are present in some form
    expect(screen.getByText(/1\.000/)).toBeInTheDocument();
    expect(screen.getByText(/1\.020/)).toBeInTheDocument();
  });

  it('handles missing prices gracefully', () => {
    const mockQuote: DollarQuote = {
      type: 'Oficial',
      buyPrice: 0,
      sellPrice: 0,
      spread: 0,
      timestamp: new Date().toISOString(),
    };

    render(<DollarCard quote={mockQuote} />);

    expect(screen.getByText('Dólar Oficial')).toBeInTheDocument();
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});
