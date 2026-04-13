import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';
import { HeaderComponent } from './components/header.component.js';
import { ProductCardComponent } from './components/product-card.component.js';

/** Valid sort options in the SauceDemo dropdown */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/**
 * Inventory Page — /inventory.html
 * The main product listing page after login.
 */
export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly header: HeaderComponent;
  readonly sortDropdown: Locator;
  readonly productList: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.productList = page.locator('[data-test="inventory-list"]');
    this.title = page.locator('[data-test="title"]');
  }

  /** Get all product cards as component instances */
  async getAllProducts(): Promise<ProductCardComponent[]> {
    const items = this.page.locator('[data-test="inventory-item"]');
    const count = await items.count();
    const products: ProductCardComponent[] = [];
    for (let i = 0; i < count; i++) {
      products.push(new ProductCardComponent(items.nth(i)));
    }
    return products;
  }

  /** Find a specific product by its exact name */
  getProductByName(name: string): ProductCardComponent {
    const container = this.page
      .locator('[data-test="inventory-item"]')
      .filter({ has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }) });
    return new ProductCardComponent(container);
  }

  /** Get all product names as an array (for sort-order assertions) */
  async getAllProductNames(): Promise<string[]> {
    const names = this.page.locator('[data-test="inventory-item-name"]');
    return names.allTextContents();
  }

  /** Get all product prices as numbers (for sort-order assertions) */
  async getAllProductPrices(): Promise<number[]> {
    const prices = this.page.locator('[data-test="inventory-item-price"]');
    const texts = await prices.allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }

  /** Change the sort order */
  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  /** Get the count of products displayed */
  async getProductCount(): Promise<number> {
    return this.page.locator('[data-test="inventory-item"]').count();
  }
}
