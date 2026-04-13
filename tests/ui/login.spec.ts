import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { InventoryPage } from '../../pages/inventory.page.js';

/**
 * Login test suite — covers happy path, negative cases, and edge cases.
 *
 * Why data-driven for negative tests:
 * Instead of writing 4 nearly identical test functions, we define the
 * test cases as data and loop. This is how production frameworks handle
 * combinatorial input — clients want to see you know this pattern.
 */

test.describe('Login @smoke @critical', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    // Assert: we landed on the inventory page (URL changed)
    await expect(page).toHaveURL(/inventory/);

    // Assert: the product listing is visible (page actually loaded)
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // --- Data-driven negative login tests ---
  // Each entry is: [description, username, password, expected error substring]
  const negativeLoginCases: [string, string, string, string][] = [
    ['locked out user', 'locked_out_user', 'secret_sauce', 'Sorry, this user has been locked out'],
    ['invalid username', 'nonexistent_user', 'secret_sauce', 'Username and password do not match'],
    ['invalid password', 'standard_user', 'wrong_password', 'Username and password do not match'],
    ['empty credentials', '', '', 'Username is required'],
  ];

  for (const [description, username, password, expectedError] of negativeLoginCases) {
    test(`should show error for ${description}`, async ({ page }) => {
      await loginPage.login(username, password);

      // Assert: still on login page (no redirect happened)
      await expect(page).toHaveURL('/');

      // Assert: error message is visible and contains expected text
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(expectedError);
    });
  }

  test('should show error when only username is provided', async ({ page: _page }) => {
    await loginPage.login('standard_user', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });
});
