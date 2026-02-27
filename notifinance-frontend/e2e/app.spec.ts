import { test, expect } from '@playwright/test';

const demoAuthState = {
  state: {
    user: { id: 'u1', email: 'demo@notifinance.com', displayName: 'Usuario Demo' },
    accessToken: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
    isAuthenticated: true,
  },
  version: 0,
};

test.describe('NotiFinance App', () => {
  test('Dashboard loads public data correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Check dashboard title and key widget
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

    // Ensure Top Movers table is visible
    await expect(page.getByText('Top Movers')).toBeVisible();
  });

  test('Public asset details load correctly', async ({ page }) => {
    await page.goto('/assets/GGAL');

    // Ensure the ticker is visible
    await expect(page.getByText('GGAL')).toBeVisible();
    await expect(page.getByText('Grupo Financiero Galicia')).toBeVisible();
  });

  test('Authenticated user can access protected sections', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'notifinance-auth',
        value: '1',
        url: 'http://localhost:3001',
      },
    ]);

    await page.addInitScript((state) => {
      localStorage.setItem('notifinance-auth', JSON.stringify(state));
    }, demoAuthState);

    await page.goto('/dashboard');
    await expect(page.getByText('Mi Watchlist')).toBeVisible();

    await page.goto('/portfolio');
    await expect(page.getByRole('heading', { name: 'Mi Portafolio' })).toBeVisible();

    await page.goto('/alerts');
    await expect(page.getByRole('heading', { name: 'Mis Alertas' })).toBeVisible();
  });
});
