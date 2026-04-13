import { type Page, type Locator } from '@playwright/test';

/**
 * Header component — appears on every authenticated page.
 * Extracted as a component (not a page) because it's shared across
 * inventory, cart, and checkout pages.
 */
export class HeaderComponent {
  // --- Locators (defined once, reused across methods) ---
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly menuClose: Locator;
  readonly logoutLink: Locator;
  readonly aboutLink: Locator;
  readonly resetLink: Locator;
  readonly allItemsLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.menuClose = page.getByRole('button', { name: 'Close Menu' });
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.resetLink = page.locator('[data-test="reset-sidebar-link"]');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Returns the number on the cart badge, or 0 if no badge is shown */
  async getCartItemCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async closeMenu(): Promise<void> {
    await this.menuClose.click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetLink.click();
  }
}
