import { test, expect } from '../../fixtures/test-base.js';
import { InventoryPage } from '../../pages/inventory.page.js';
import productData from '../../data/fixtures/products.json' with { type: 'json' };

/**
 * Inventory page tests — sorting, product display, navigation.
 *
 * Uses JSON fixture data for expected values so assertions are
 * maintainable. If SauceDemo changes a product name or price,
 * update one JSON file instead of hunting through 20 tests.
 */

test.describe('Inventory Page @regression', () => {
  let inventory: InventoryPage;

  test.beforeEach(({ authenticatedPage }) => {
    inventory = new InventoryPage(authenticatedPage);
  });

  test('should display all 6 products', async () => {
    const count = await inventory.getProductCount();
    expect(count).toBe(6);
  });

  test('should sort products by name A-Z', async () => {
    await inventory.sortBy('az');
    const names = await inventory.getAllProductNames();
    expect(names).toEqual(productData.sortedByNameAsc);
  });

  test('should sort products by name Z-A', async () => {
    await inventory.sortBy('za');
    const names = await inventory.getAllProductNames();
    const expected = [...productData.sortedByNameAsc].reverse();
    expect(names).toEqual(expected);
  });

  test('should sort products by price low to high', async () => {
    await inventory.sortBy('lohi');
    const prices = await inventory.getAllProductPrices();
    expect(prices).toEqual(productData.sortedByPriceAsc);
  });

  test('should sort products by price high to low', async () => {
    await inventory.sortBy('hilo');
    const prices = await inventory.getAllProductPrices();
    const expected = [...productData.sortedByPriceAsc].reverse();
    expect(prices).toEqual(expected);
  });

  test('should navigate to product detail and back', async ({ authenticatedPage }) => {
    const backpack = inventory.getProductByName('Sauce Labs Backpack');
    await backpack.openDetail();

    // Assert: we're on the detail page
    await expect(authenticatedPage).toHaveURL(/inventory-item/);

    // Navigate back
    await authenticatedPage.locator('[data-test="back-to-products"]').click();
    await expect(authenticatedPage).toHaveURL(/inventory/);
  });
});
