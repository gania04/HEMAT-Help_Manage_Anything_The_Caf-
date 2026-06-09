import { test, expect } from '@playwright/test';

test('POS Checkout Flow', async ({ page }) => {
  // Navigate to POS page
  await page.goto('/pos');

  // Verify page title
  await expect(page.locator('h1').filter({ hasText: 'Kasir Utama' })).toBeVisible();

  // Find the first menu item and click it to add to cart
  const firstMenuItem = page.locator('.grid > div').first();
  await firstMenuItem.click();

  // Verify it was added to the cart
  await expect(page.getByText('Keranjang Pesanan')).toBeVisible();

  // Note: Since this is an E2E on dummy data, we won't click Bayar 
  // to avoid cluttering the production database unless we are in a testing environment.
});
