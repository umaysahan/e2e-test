/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'playwright'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:playwright/recommended',
    // Must be last — disables rules that conflict with Prettier
    'prettier',
  ],
  rules: {
    // --- TypeScript strictness ---
    // Enforce await on async calls — the #1 source of flaky tests
    '@typescript-eslint/no-floating-promises': 'error',
    // Ban any — forces proper typing of page objects and API responses
    '@typescript-eslint/no-explicit-any': 'warn',
    // Unused vars are dead code — clean them up (allow _ prefix for intentional skips)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // --- Playwright-specific rules ---
    // Enforce web-first assertions (expect(locator).toBeVisible() > isVisible())
    'playwright/prefer-web-first-assertions': 'error',
    // Ban page.waitForTimeout() — it's a hard wait, always flaky
    'playwright/no-wait-for-timeout': 'error',
    // Require expect() in every test — no side-effect-only tests
    'playwright/expect-expect': 'error',
    // Ban conditional logic in tests — tests should be deterministic
    'playwright/no-conditional-in-test': 'warn',

    // --- General code quality ---
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'allure-results/',
    'allure-report/',
    'test-results/',
    'k6/',          // k6 uses its own runtime
    '*.config.ts',  // Config files need more flexibility
  ],
  overrides: [
    {
      // Cucumber step definitions use expect() outside Playwright test blocks — this is correct
      files: ['features/**/*.ts'],
      rules: {
        'playwright/no-standalone-expect': 'off',
      },
    },
    {
      // CLI scripts need console output
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
