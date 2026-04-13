import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { InventoryPage } from '../../pages/inventory.page.js';
import { CartPage } from '../../pages/cart.page.js';
import { CheckoutPage } from '../../pages/checkout.page.js';
import { CheckoutCompletePage } from '../../pages/checkout-complete.page.js';
import { config } from '../../config/index.js';

/**
 * Demo recording — showcases the full framework in one video.
 * Covers: negative login, valid login, sorting, cart, checkout, visual check.
 *
 * Run:  npm run test:demo
 * Video: demo-recording/video.webm (auto-copied after test)
 */
test.use({
  video: 'on',
  launchOptions: { slowMo: 600 },
  viewport: { width: 1280, height: 720 },
});

test('Framework Demo — Full E2E Showcase', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const completePage = new CheckoutCompletePage(page);

  // ── ACT 1: Negative Login ──────────────────────────────────
  await loginPage.goto();

  // Invalid credentials
  await loginPage.login('wrong_user', 'wrong_pass');
  await expect(loginPage.errorMessage).toBeVisible();

  // Locked out user
  await loginPage.login('locked_out_user', 'secret_sauce');
  await expect(loginPage.errorMessage).toContainText('locked out');

  // Empty fields
  await loginPage.login('', '');
  await expect(loginPage.errorMessage).toContainText('Username is required');

  // ── ACT 2: Successful Login ────────────────────────────────
  await loginPage.login(config.ui.username, config.ui.password);
  await expect(page).toHaveURL(/inventory/);
  await expect(inventoryPage.title).toHaveText('Products');

  // ── ACT 3: Product Browsing & Sorting ──────────────────────
  const productCount = await inventoryPage.getProductCount();
  expect(productCount).toBe(6);

  // Sort by price low to high
  await inventoryPage.sortBy('lohi');
  const pricesAsc = await inventoryPage.getAllProductPrices();
  expect(pricesAsc.length).toBeGreaterThan(0);
  expect(pricesAsc[0]!).toBeLessThanOrEqual(pricesAsc[pricesAsc.length - 1]!);

  // Sort by name Z-A
  await inventoryPage.sortBy('za');
  const namesDesc = await inventoryPage.getAllProductNames();
  expect(namesDesc.length).toBeGreaterThan(0);
  expect(namesDesc[0]!.localeCompare(namesDesc[namesDesc.length - 1]!)).toBeGreaterThan(0);

  // View product detail
  await inventoryPage.getProductByName('Sauce Labs Backpack').openDetail();
  await expect(page).toHaveURL(/inventory-item/);
  await page.goBack();

  // ── ACT 4: Cart Operations ─────────────────────────────────
  // Add 3 items
  await inventoryPage.getProductByName('Sauce Labs Backpack').addToCart();
  await inventoryPage.getProductByName('Sauce Labs Bike Light').addToCart();
  await inventoryPage.getProductByName('Sauce Labs Fleece Jacket').addToCart();

  // Verify badge
  await expect(inventoryPage.header.cartBadge).toHaveText('3');

  // Go to cart
  await inventoryPage.header.goToCart();
  expect(await cartPage.getItemCount()).toBe(3);

  // Remove one
  await cartPage.removeItemByName('Sauce Labs Bike Light');
  expect(await cartPage.getItemCount()).toBe(2);

  // ── ACT 5: Checkout — Validation Error ─────────────────────
  await cartPage.proceedToCheckout();

  // Submit empty form
  await checkoutPage.continueToOverview();
  await expect(checkoutPage.errorMessage).toContainText('First Name is required');

  // ── ACT 6: Checkout — Happy Path ───────────────────────────
  await checkoutPage.fillInfo({
    firstName: 'Umay',
    lastName: 'Sahan',
    postalCode: '34000',
  });
  await checkoutPage.continueToOverview();

  // Verify price math
  const subtotal = await checkoutPage.getSubtotal();
  const tax = await checkoutPage.getTax();
  const total = await checkoutPage.getTotal();
  expect(total).toBeCloseTo(subtotal + tax, 2);

  // Complete order
  await checkoutPage.finishOrder();
  const heading = await completePage.getConfirmationHeading();
  expect(heading).toContain('Thank you');

  // ── ACT 7: Return to Home ─────────────────────────────────
  await completePage.goBackHome();
  await expect(page).toHaveURL(/inventory/);
});
