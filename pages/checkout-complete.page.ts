import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';
import { HeaderComponent } from './components/header.component.js';

/**
 * Checkout Complete Page — /checkout-complete.html
 * The final confirmation page after a successful order.
 */
export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';

  readonly header: HeaderComponent;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.ponyExpressImage = page.locator('[data-test="pony-express"]');
  }

  /** Get the confirmation heading (e.g., "Thank you for your order!") */
  async getConfirmationHeading(): Promise<string> {
    return (await this.completeHeader.textContent()) || '';
  }

  /** Get the confirmation body text */
  async getConfirmationText(): Promise<string> {
    return (await this.completeText.textContent()) || '';
  }

  async goBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
