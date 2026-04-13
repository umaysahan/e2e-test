import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world.js';

Given('I am on the login page', async function (this: PlaywrightWorld) {
  await this.loginPage.goto();
});

When(
  'I login with username {string} and password {string}',
  async function (this: PlaywrightWorld, username: string, password: string) {
    await this.loginPage.login(username, password);
  },
);

Then('I should be redirected to the inventory page', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveURL(/inventory/);
});

Then('I should see the page title {string}', async function (this: PlaywrightWorld, title: string) {
  await expect(this.inventoryPage.title).toHaveText(title);
});

Then(
  'I should see the error message {string}',
  async function (this: PlaywrightWorld, expectedError: string) {
    await expect(this.loginPage.errorMessage).toHaveText(expectedError);
  },
);
