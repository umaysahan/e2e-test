import dotenv from 'dotenv';
import path from 'path';

/**
 * Centralized config loader.
 * Reads from environment variables with sensible defaults.
 * All test files import config from here — single source of truth.
 */

const testEnv = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(`.env.${testEnv}`) });
dotenv.config({ path: path.resolve('.env') });

export const config = {
  env: testEnv,

  // UI testing targets
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  ui: {
    username: process.env.UI_USERNAME || 'standard_user',
    password: process.env.UI_PASSWORD || 'secret_sauce',
  },

  // API testing targets
  apiBaseUrl: process.env.API_BASE_URL || 'https://petstore.swagger.io/v2',
  apiKey: process.env.API_KEY || 'special-key',

  // Timeouts (ms)
  timeouts: {
    action: 10_000,
    navigation: 15_000,
    expect: 5_000,
    test: 30_000,
  },
} as const;

export type Config = typeof config;
