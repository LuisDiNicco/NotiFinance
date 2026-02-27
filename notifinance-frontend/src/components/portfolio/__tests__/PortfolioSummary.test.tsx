import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PortfolioSummary } from '../PortfolioSummary';
import { Portfolio } from '@/types/portfolio';

describe('PortfolioSummary', () => {
  const mockPortfolio: Portfolio = {
    id: '1',
    name: 'Test Portfolio',
    totalValue: 15000000,
    totalReturn: 2500000,
    totalReturnPct: 20,
    dailyReturn: 150000,
    dailyReturnPct: 1.01,
    createdAt: '2023-01-15T10:00:00Z',
  };

  it('renders portfolio values correctly', () => {
    render(<PortfolioSummary portfolio={mockPortfolio} />);

    // Check if total value is rendered (formatted as currency)
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
    expect(screen.getByText(/\$ 15\.000\.000/)).toBeInTheDocument();

    // Check if total return is rendered
    expect(screen.getByText('Rendimiento Total')).toBeInTheDocument();
    expect(screen.getByText(/\$ 2\.500\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\+20,00%/)).toBeInTheDocument();

    // Check if daily return is rendered
    expect(screen.getByText('Rendimiento Diario')).toBeInTheDocument();
    expect(screen.getByText(/\$ 150\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\+1,01%/)).toBeInTheDocument();
  });

  it('renders negative returns with correct styling', () => {
    const negativePortfolio = {
      ...mockPortfolio,
      totalReturn: -500000,
      totalReturnPct: -3.33,
      dailyReturn: -50000,
      dailyReturnPct: -0.33,
    };

    render(<PortfolioSummary portfolio={negativePortfolio} />);

    // Check negative total return
    expect(screen.getByText(/-\$ 500\.000/)).toBeInTheDocument();
    expect(screen.getByText(/-3,33%/)).toBeInTheDocument();

    // Check negative daily return
    expect(screen.getByText(/-\$ 50\.000/)).toBeInTheDocument();
    expect(screen.getByText(/-0,33%/)).toBeInTheDocument();
  });
});
