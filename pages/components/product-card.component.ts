import { type Locator } from '@playwright/test';

/**
 * Represents a single product card on the inventory page.
 * Each card is a scoped Locator, so methods operate within that card's DOM subtree.
 *
 * Usage in tests:
 *   const card = inventoryPage.getProductByName('Sauce Labs Backpack');
 *   await card.addToCart();
 */
export class ProductCardComponent {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(private readonly container: Locator) {
    this.name = container.locator('[data-test="inventory-item-name"]');
    this.description = container.locator('[data-test="inventory-item-desc"]');
    this.price = container.locator('[data-test="inventory-item-price"]');
    this.image = container.locator('img.inventory_item_img');
    this.addToCartButton = container.locator('button', { hasText: 'Add to cart' });
    this.removeButton = container.locator('button', { hasText: 'Remove' });
  }

  async getName(): Promise<string> {
    return (await this.name.textContent()) || '';
  }

  /** Returns price as a number (strips the $ sign) */
  async getPrice(): Promise<number> {
    const text = (await this.price.textContent()) || '$0';
    return parseFloat(text.replace('$', ''));
  }

  async getDescription(): Promise<string> {
    return (await this.description.textContent()) || '';
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  /** Click the product name to navigate to its detail page */
  async openDetail(): Promise<void> {
    await this.name.click();
  }
}
