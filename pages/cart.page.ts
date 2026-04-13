import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';
import { HeaderComponent } from './components/header.component.js';

/** Represents a single item row in the cart */
export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

/**
 * Cart Page — /cart.html
 * Shows items added to cart with quantity, price, and remove option.
 */
export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  readonly header: HeaderComponent;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.title = page.locator('[data-test="title"]');
  }

  /** Get all cart items as structured data */
  async getItems(): Promise<CartItem[]> {
    const count = await this.cartItems.count();
    const items: CartItem[] = [];

    for (let i = 0; i < count; i++) {
      const row = this.cartItems.nth(i);
      const name = (await row.locator('[data-test="inventory-item-name"]').textContent()) || '';
      const description =
        (await row.locator('[data-test="inventory-item-desc"]').textContent()) || '';
      const priceText =
        (await row.locator('[data-test="inventory-item-price"]').textContent()) || '$0';
      const quantityText = (await row.locator('[data-test="item-quantity"]').textContent()) || '0';

      items.push({
        name,
        description,
        price: parseFloat(priceText.replace('$', '')),
        quantity: parseInt(quantityText, 10),
      });
    }

    return items;
  }

  /** Get the number of distinct items in the cart */
  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /** Remove a specific item by name */
  async removeItemByName(name: string): Promise<void> {
    const row = this.cartItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }),
    });
    await row.locator('button', { hasText: 'Remove' }).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
