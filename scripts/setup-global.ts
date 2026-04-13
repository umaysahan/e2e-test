import { type FullConfig } from '@playwright/test';

/**
 * Global setup — runs once before the entire test suite.
 * Use for: environment health checks, seeding test data, warming caches.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const baseUrl = config.projects[0]?.use?.baseURL || 'https://www.saucedemo.com';

  // Health check: verify the target app is reachable before running 100+ tests
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    console.log(`[setup] Target app is reachable: ${baseUrl}`);
  } catch (error) {
    console.error(`[setup] Cannot reach ${baseUrl} — aborting test run`);
    throw error;
  }
}

export default globalSetup;
