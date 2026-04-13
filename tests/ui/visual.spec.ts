import { test, expect } from '../../fixtures/test-base.js';
import { InventoryPage } from '../../pages/inventory.page.js';

/**
 * Visual regression tests — catch unintended UI changes via screenshot comparison.
 *
 * How it works:
 * 1. First run: Playwright saves baseline screenshots to /snapshots
 * 2. Subsequent runs: each screenshot is pixel-compared to the baseline
 * 3. If diff exceeds the threshold (configured in playwright.config.ts),
 *    the test fails and generates a diff image for review
 *
 * Update baselines when UI changes are intentional:
 *   npx playwright test visual.spec.ts --update-snapshots
 *
 * Why these pages:
 * - Login: brand-critical, rarely changes, good baseline candidate
 * - Inventory: most complex layout, highest risk for visual regressions
 * - Cart: dynamic content area, catches layout shifts
 */

test.describe('Visual Regression @visual', () => {
  test('login page should match baseline', async ({ page }) => {
    await page.goto('/');

    // Wait for all fonts and images to load before taking the snapshot
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveScreenshot('login-page.png', {
      // Full page screenshot catches elements below the fold
      fullPage: true,
      // Mask the username list area — it's informational and may change
      mask: [page.locator('[data-test="login-credentials"]')],
    });
  });

  test('inventory page should match baseline', async ({ authenticatedPage }) => {
    // InventoryPage import validates the page loaded correctly
    await authenticatedPage.waitForLoadState('domcontentloaded');

    await expect(authenticatedPage).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      // Mask product images — they load from an external CDN and can cause
      // false positives due to network timing or image compression changes
      mask: [authenticatedPage.locator('img.inventory_item_img')],
    });
  });

  test('cart page with items should match baseline', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);

    // Add items to create a non-empty cart state for the snapshot
    await inventoryPage.getProductByName('Sauce Labs Backpack').addToCart();
    await inventoryPage.getProductByName('Sauce Labs Onesie').addToCart();
    await inventoryPage.header.goToCart();

    await authenticatedPage.waitForLoadState('domcontentloaded');

    await expect(authenticatedPage).toHaveScreenshot('cart-with-items.png', {
      fullPage: true,
    });
  });
});
