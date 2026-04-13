import { test as base, type Page } from '@playwright/test';
import { config } from '../config/index.js';
import { LoginPage } from '../pages/login.page.js';

/**
 * Auth fixture — provides a pre-authenticated page.
 *
 * Instead of repeating login steps in every test, this fixture
 * logs in once and provides the authenticated page context.
 * Tests that need auth just use `authenticatedPage` instead of `page`.
 */
export type AuthFixtures = {
  authenticatedPage: Page;
};

export const authFixture = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAs(config.ui.username, config.ui.password);
    // Hand the authenticated page to the test
    await use(page);
  },
});
