import { test as base, type APIRequestContext } from '@playwright/test';
import { config } from '../config/index.js';

/**
 * API fixture — provides a pre-configured API client.
 *
 * Sets base URL and default headers so API tests don't repeat boilerplate.
 * The API client is separate from the browser context — no browser is launched.
 */
export type ApiFixtures = {
  apiClient: APIRequestContext;
};

export const apiFixture = base.extend<ApiFixtures>({
  apiClient: async ({ playwright }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        api_key: config.apiKey,
      },
    });
    await use(apiContext);
    await apiContext.dispose();
  },
});
