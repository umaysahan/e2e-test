import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Login Page — https://www.saucedemo.com/
 *
 * Locator strategy:
 * - Prefer data-test attributes (resilient to CSS/text changes)
 * - Fall back to getByRole/getByPlaceholder for semantic elements
 * - Never use fragile XPath or nth-child selectors
 */
export class LoginPage extends BasePage {
  protected readonly path = '/';

  // --- Locators ---
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('.error-button');
  }

  /**
   * Fill credentials and submit the login form.
   * Separated from navigation so tests can:
   * 1. goto() + login() for full flow tests
   * 2. Just login() if already on the page
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Convenience: navigate + login in one call for tests that just need auth */
  async loginAs(username: string, password: string): Promise<void> {
    await this.goto();
    await this.login(username, password);
  }

  /** Get the error message text (for negative login test assertions) */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  /** Dismiss the error banner */
  async dismissError(): Promise<void> {
    await this.errorButton.click();
  }
}
