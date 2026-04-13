import { test, expect } from '../../fixtures/test-base.js';
import { InventoryPage } from '../../pages/inventory.page.js';
import { CartPage } from '../../pages/cart.page.js';

/**
 * Cart test suite — add, remove, verify badge count, cart persistence.
 *
 * Uses the `authenticatedPage` fixture so tests start already logged in.
 * This keeps each test focused on cart behavior, not login boilerplate.
 */

test.describe('Shopping Cart @smoke', () => {
  test('should add a single product to cart', async ({ authenticatedPage }) => {
    const inventory = new InventoryPage(authenticatedPage);

    // Add a specific product by name (not by index — resilient to reordering)
    const backpack = inventory.getProductByName('Sauce Labs Backpack');
    await backpack.addToCart();

    // Assert: cart badge shows 1
    await expect(inventory.header.cartBadge).toHaveText('1');

    // Assert: "Add to cart" changed to "Remove" (button state feedback)
    await expect(backpack.removeButton).toBeVisible();
  });

  test('should add multiple products and reflect count in badge', async ({ authenticatedPage }) => {
    const inventory = new InventoryPage(authenticatedPage);

    await inventory.getProductByName('Sauce Labs Backpack').addToCart();
    await inventory.getProductByName('Sauce Labs Bike Light').addToCart();
    await inventory.getProductByName('Sauce Labs Onesie').addToCart();

    // Assert: badge shows 3
    await expect(inventory.header.cartBadge).toHaveText('3');

    // Navigate to cart and verify all 3 items are present
    await inventory.header.goToCart();
    const cartPage = new CartPage(authenticatedPage);
    const items = await cartPage.getItems();

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.name)).toEqual(
      expect.arrayContaining(['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie']),
    );
  });

  test('should remove a product from cart', async ({ authenticatedPage }) => {
    const inventory = new InventoryPage(authenticatedPage);

    // Add two items
    await inventory.getProductByName('Sauce Labs Backpack').addToCart();
    await inventory.getProductByName('Sauce Labs Bike Light').addToCart();
    await expect(inventory.header.cartBadge).toHaveText('2');

    // Go to cart and remove one
    await inventory.header.goToCart();
    const cartPage = new CartPage(authenticatedPage);
    await cartPage.removeItemByName('Sauce Labs Backpack');

    // Assert: only the bike light remains
    const items = await cartPage.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe('Sauce Labs Bike Light');
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test('should persist cart items after navigating away and back', async ({
    authenticatedPage,
  }) => {
    const inventory = new InventoryPage(authenticatedPage);

    await inventory.getProductByName('Sauce Labs Fleece Jacket').addToCart();

    // Navigate to cart, then back to shopping, then back to cart
    await inventory.header.goToCart();
    const cartPage = new CartPage(authenticatedPage);
    await cartPage.continueShopping();
    await inventory.header.goToCart();

    // Assert: item is still in cart (state persisted)
    const items = await cartPage.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe('Sauce Labs Fleece Jacket');
  });
});
