/**
 * Cucumber.js configuration (CommonJS format).
 * Wires Gherkin .feature files to TypeScript step definitions.
 *
 * Why .cjs? — Cucumber's config loader has ESM compatibility issues on Windows.
 * Using CommonJS for the config while keeping step definitions in ESM/TypeScript.
 */
module.exports = {
  default: {
    // Where to find .feature files
    paths: ['features/**/*.feature'],

    // Step definitions and support files (world, hooks)
    require: [
      'features/step-definitions/login.steps.ts',
      'features/step-definitions/checkout.steps.ts',
      'features/support/world.ts',
      'features/support/hooks.ts',
    ],

    // Use tsx loader so we can write steps in TypeScript directly
    requireModule: ['tsx'],

    // Output format — progress for CI, pretty for local
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
    ],

    // Tag expression — run specific scenarios
    // Usage: npm run test:bdd -- --tags "@smoke"
  },
};
