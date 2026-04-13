import { type Page, type Locator } from '@playwright/test';

/**
 * Abstract base page — shared behavior inherited by all page objects.
 *
 * Design principles:
 * - No assertions here (assertions belong in tests, not page objects)
 * - No hard waits (all waits are implicit via Playwright's auto-waiting)
 * - Encapsulates navigation and common interaction patterns
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Each page declares its own path for navigation */
  protected abstract readonly path: string;

  /** Navigate to this page using the base URL from config */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Wait for the page to reach a network-idle-like state */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Get the current page URL (useful for navigation assertions in tests) */
  get currentUrl(): string {
    return this.page.url();
  }

  /** Get page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Scroll an element into view before interacting.
   * Useful for long pages where elements are below the fold.
   */
  protected async scrollTo(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }
}
