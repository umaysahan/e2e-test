import { test, expect } from '../../fixtures/test-base.js';
import { InventoryPage } from '../../pages/inventory.page.js';
import { CartPage } from '../../pages/cart.page.js';
import { CheckoutPage } from '../../pages/checkout.page.js';
import { CheckoutCompletePage } from '../../pages/checkout-complete.page.js';
import { generateCheckoutInfo } from '../../data/factories/user.factory.js';

/**
 * Checkout flow — the most critical E2E path in any e-commerce app.
 *
 * This suite demonstrates:
 * - Full user journey (inventory → cart → checkout → confirmation)
 * - Dynamic test data via Faker factory (no hardcoded names/zips)
 * - Price calculation verification (subtotal + tax = total)
 * - Validation error handling on the checkout form
 */

test.describe('Checkout Flow @critical @regression', () => {
  test('should complete a full purchase end-to-end', async ({ authenticatedPage }) => {
    // 1. Add items from inventory
    const inventory = new InventoryPage(authenticatedPage);
    await inventory.getProductByName('Sauce Labs Backpack').addToCart();
    await inventory.getProductByName('Sauce Labs Bolt T-Shirt').addToCart();

    // 2. Go to cart and verify items
    await inventory.header.goToCart();
    const cart = new CartPage(authenticatedPage);
    const cartItems = await cart.getItems();
    expect(cartItems).toHaveLength(2);

    // 3. Proceed to checkout and fill info with dynamic data
    await cart.proceedToCheckout();
    const checkout = new CheckoutPage(authenticatedPage);
    const customerInfo = generateCheckoutInfo();
    await checkout.submitInfo(customerInfo);

    // 4. Verify order overview — URL should be step-two
    await expect(authenticatedPage).toHaveURL(/checkout-step-two/);

    // 5. Verify price math: subtotal + tax = total
    const subtotal = await checkout.getSubtotal();
    const tax = await checkout.getTax();
    const total = await checkout.getTotal();
    // Backpack ($29.99) + Bolt T-Shirt ($15.99) = $45.98
    expect(subtotal).toBeCloseTo(45.98, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // 6. Finish order
    await checkout.finishOrder();

    // 7. Verify confirmation page
    const completePage = new CheckoutCompletePage(authenticatedPage);
    await expect(completePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(completePage.ponyExpressImage).toBeVisible();
  });

  test('should show error when checkout info is incomplete', async ({ authenticatedPage }) => {
    // Add an item and go straight to checkout
    const inventory = new InventoryPage(authenticatedPage);
    await inventory.getProductByName('Sauce Labs Onesie').addToCart();
    await inventory.header.goToCart();

    const cart = new CartPage(authenticatedPage);
    await cart.proceedToCheckout();

    const checkout = new CheckoutPage(authenticatedPage);

    // Try to continue with empty form
    await checkout.continueToOverview();
    await expect(checkout.errorMessage).toContainText('First Name is required');

    // Fill only first name, try again
    await checkout.firstNameInput.fill('Jane');
    await checkout.continueToOverview();
    await expect(checkout.errorMessage).toContainText('Last Name is required');

    // Fill last name too, try again
    await checkout.lastNameInput.fill('Doe');
    await checkout.continueToOverview();
    await expect(checkout.errorMessage).toContainText('Postal Code is required');
  });

  test('should allow returning to cart from checkout', async ({ authenticatedPage }) => {
    const inventory = new InventoryPage(authenticatedPage);
    await inventory.getProductByName('Sauce Labs Bike Light').addToCart();
    await inventory.header.goToCart();

    const cart = new CartPage(authenticatedPage);
    await cart.proceedToCheckout();

    const checkout = new CheckoutPage(authenticatedPage);
    await checkout.cancelButton.click();

    // Assert: we're back on the cart page with our item intact
    await expect(authenticatedPage).toHaveURL(/cart/);
    const items = await cart.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe('Sauce Labs Bike Light');
  });
});
