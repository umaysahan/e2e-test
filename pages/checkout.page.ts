import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';
import { HeaderComponent } from './components/header.component.js';

/** Checkout info required for step one */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * Checkout Page — handles both step-one (info) and step-two (overview).
 *
 * SauceDemo splits checkout into two URLs:
 *   /checkout-step-one.html — enter shipping info
 *   /checkout-step-two.html — review order + finish
 *
 * We model both in one page object because they share context
 * and tests flow through them sequentially.
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  readonly header: HeaderComponent;

  // --- Step One: Info form ---
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  // --- Step Two: Order overview ---
  readonly summaryItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    // Step One
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // Step Two
    this.summaryItems = page.locator('[data-test="inventory-item"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  /** Fill the shipping info form and continue to step two */
  async fillInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  /** Convenience: fill + continue in one call */
  async submitInfo(info: CheckoutInfo): Promise<void> {
    await this.fillInfo(info);
    await this.continueToOverview();
  }

  /** Get the error message text (for validation tests) */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  // --- Step Two helpers ---

  /** Extract the subtotal as a number */
  async getSubtotal(): Promise<number> {
    const text = (await this.subtotalLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  /** Extract the tax as a number */
  async getTax(): Promise<number> {
    const text = (await this.taxLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  /** Extract the total as a number */
  async getTotal(): Promise<number> {
    const text = (await this.totalLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }
}
