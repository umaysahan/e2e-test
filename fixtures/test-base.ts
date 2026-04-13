import { mergeTests } from '@playwright/test';
import { authFixture } from './auth.fixture.js';
import { apiFixture } from './api.fixture.js';

/**
 * Merged test base — single import for all custom fixtures.
 *
 * Usage in test files:
 *   import { test, expect } from '../fixtures/test-base.js';
 *
 *   test('my test', async ({ authenticatedPage, apiClient }) => { ... });
 *
 * mergeTests() combines multiple fixture extensions cleanly.
 * This avoids the "extend chain" anti-pattern where each fixture
 * extends the previous one, creating fragile coupling.
 */
export const test = mergeTests(authFixture, apiFixture);

// Re-export expect so tests only need one import line
export { expect } from '@playwright/test';
