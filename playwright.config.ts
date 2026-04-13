import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Load environment-specific .env file.
 * Usage: TEST_ENV=staging npx playwright test
 * Defaults to 'dev' if not specified.
 */
const testEnv = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(`.env.${testEnv}`) });

// Fallback to .env if env-specific file doesn't exist
dotenv.config({ path: path.resolve('.env') });

export default defineConfig({
  // Where Playwright looks for test files
  testDir: './tests',

  // Maximum time a single test can run (prevents hanging tests in CI)
  timeout: 30_000,

  // Maximum time for expect() assertions (fast-fail on stale elements)
  expect: {
    timeout: 5_000,
    // Visual regression thresholds — 0.2% pixel diff tolerance
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
      animations: 'disabled', // Freeze animations for deterministic snapshots
    },
  },

  // Run tests in parallel within each file — speeds up large suites
  fullyParallel: true,

  // Fail the entire suite if test.only() slips into CI
  forbidOnly: !!process.env.CI,

  // Retry flaky tests: 2 retries in CI, 0 locally (catch flakes early)
  retries: process.env.CI ? 2 : 0,

  // Parallel workers: CI gets 1 (stable), local gets 50% of CPUs
  workers: process.env.CI ? 1 : undefined,

  // Allure + HTML reporters — Allure for CI dashboards, HTML for local debugging
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'], // Real-time console output during runs
  ],

  // Shared settings applied to ALL projects below
  use: {
    // Base URL lets tests use relative paths: page.goto('/inventory')
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Collect traces, screenshots, and video ONLY on failure
    // (saves disk space but gives full debug context when needed)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    // Default viewport — standard laptop resolution
    viewport: { width: 1280, height: 720 },

    // Extra HTTP headers for API testing
    extraHTTPHeaders: {
      Accept: 'application/json',
    },

    // Slow down actions by 0ms (change to 100+ for visual debugging)
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  // Browser matrix — each project runs the full test suite independently
  projects: [
    // --- Setup project: runs first, creates auth state ---
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // --- Desktop browsers ---
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      dependencies: ['setup'],
    },

    // --- Mobile viewport (bonus: shows you test responsive layouts) ---
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
    },

    // --- API-only project: no browser needed, faster execution ---
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://petstore.swagger.io/v2',
      },
      testMatch: /tests\/api\/.*\.spec\.ts/,
    },
  ],

  // Global setup script — seed test data, verify environment health
  globalSetup: './scripts/setup-global.ts',

  // Output directory for screenshots, videos, traces
  outputDir: 'test-results',
});
