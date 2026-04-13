import { Before, After, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world.js';

/**
 * Cucumber hooks — lifecycle management for each scenario.
 *
 * Before: launches a fresh browser context (full test isolation)
 * After: captures screenshot on failure, then tears down browser
 */

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld, scenario) {
  // Attach screenshot on failure — invaluable for debugging in CI
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  await this.cleanup();
});
