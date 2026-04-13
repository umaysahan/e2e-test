import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { config } from '../../config/index.js';
import { LoginPage } from '../../pages/login.page.js';
import { InventoryPage } from '../../pages/inventory.page.js';
import { CartPage } from '../../pages/cart.page.js';
import { CheckoutPage } from '../../pages/checkout.page.js';
import { CheckoutCompletePage } from '../../pages/checkout-complete.page.js';

/**
 * Custom Cucumber World — bridges Playwright with Cucumber.js.
 *
 * Each scenario gets its own browser context (isolation),
 * and page objects are lazily initialized on first access.
 * This keeps step definitions clean and focused on behavior.
 */
export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page objects — initialized after browser launch
  loginPage!: LoginPage;
  inventoryPage!: InventoryPage;
  cartPage!: CartPage;
  checkoutPage!: CheckoutPage;
  checkoutCompletePage!: CheckoutCompletePage;

  // Shared state between steps within a scenario
  errorMessage = '';

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Launch browser and create an isolated context for this scenario */
  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      baseURL: config.baseUrl,
      viewport: { width: 1280, height: 720 },
    });
    this.page = await this.context.newPage();

    // Wire up page objects to the live page
    this.loginPage = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.cartPage = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
    this.checkoutCompletePage = new CheckoutCompletePage(this.page);
  }

  /** Tear down browser after scenario completes */
  async cleanup(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(PlaywrightWorld);
