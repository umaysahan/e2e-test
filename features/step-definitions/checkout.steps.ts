import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world.js';
import { config } from '../../config/index.js';

Given('I am logged in as a standard user', async function (this: PlaywrightWorld) {
  await this.loginPage.loginAs(config.ui.username, config.ui.password);
});

When('I add {string} to the cart', async function (this: PlaywrightWorld, productName: string) {
  const product = this.inventoryPage.getProductByName(productName);
  await product.addToCart();
});

When('I navigate to the cart', async function (this: PlaywrightWorld) {
  await this.inventoryPage.header.goToCart();
});

Then(
  'the cart should contain {int} item(s)',
  async function (this: PlaywrightWorld, expectedCount: number) {
    const count = await this.cartPage.getItemCount();
    expect(count).toBe(expectedCount);
  },
);

When('I proceed to checkout', async function (this: PlaywrightWorld) {
  await this.cartPage.proceedToCheckout();
});

When(
  'I fill in checkout info with first name {string}, last name {string}, and postal code {string}',
  async function (this: PlaywrightWorld, firstName: string, lastName: string, postalCode: string) {
    await this.checkoutPage.fillInfo({ firstName, lastName, postalCode });
  },
);

When('I continue to the order overview', async function (this: PlaywrightWorld) {
  await this.checkoutPage.continueToOverview();
});

When(
  'I continue to the order overview without filling info',
  async function (this: PlaywrightWorld) {
    await this.checkoutPage.continueToOverview();
  },
);

When('I finish the order', async function (this: PlaywrightWorld) {
  await this.checkoutPage.finishOrder();
});

Then(
  'I should see the confirmation message {string}',
  async function (this: PlaywrightWorld, expectedMessage: string) {
    await expect(this.checkoutCompletePage.completeHeader).toHaveText(expectedMessage);
  },
);

Then(
  'I should see the checkout error {string}',
  async function (this: PlaywrightWorld, expectedError: string) {
    await expect(this.checkoutPage.errorMessage).toHaveText(expectedError);
  },
);
