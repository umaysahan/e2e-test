import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * AI Test Generator — turns user stories into Gherkin feature files.
 *
 * Usage:
 *   npm run generate:tests -- --story "As a user, I want to filter products by category"
 *   npm run generate:tests -- --story "As a user, I want to reset my password"
 *   npm run generate:tests -- --file user-stories.txt
 *
 * The script calls the Claude API with a carefully engineered prompt that:
 * 1. Understands our app context (SauceDemo e-commerce)
 * 2. Follows our Gherkin conventions (tags, Background, Scenario Outline)
 * 3. Generates scenarios a senior QA would write — including edge cases
 * 4. Outputs a ready-to-commit .feature file
 */

// ---------------------------------------------------------------------------
// Prompt Engineering
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a Senior QA Automation Engineer specializing in BDD test design.
You write Gherkin feature files for a Playwright + Cucumber.js framework.

## Application Under Test
- **App:** SauceDemo (https://www.saucedemo.com) — a demo e-commerce site
- **Pages:** Login, Inventory (product listing), Cart, Checkout (step one + step two), Checkout Complete
- **Users:** standard_user, locked_out_user, problem_user, performance_glitch_user, error_user, visual_user
- **Password:** All users share "secret_sauce"
- **Products:** 6 items (Sauce Labs Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt)

## Available Step Definitions
These steps are already implemented — reuse them when possible:

### Login
- Given I am on the login page
- When I login with username {string} and password {string}
- Then I should be redirected to the inventory page
- Then I should see the page title {string}
- Then I should see the error message {string}

### Checkout
- Given I am logged in as a standard user
- When I add {string} to the cart
- When I navigate to the cart
- Then the cart should contain {int} item(s)
- When I proceed to checkout
- When I fill in checkout info with first name {string}, last name {string}, and postal code {string}
- When I continue to the order overview
- When I continue to the order overview without filling info
- When I finish the order
- Then I should see the confirmation message {string}
- Then I should see the checkout error {string}

## Gherkin Conventions
1. Feature files start with a tag: @bdd plus a category tag (@smoke, @regression, @critical)
2. Use Background for shared preconditions
3. Use Scenario Outline + Examples for data-driven scenarios
4. Write the Feature description in "As a / I want / So that" format
5. Scenarios should be independent — no scenario depends on another
6. Include positive, negative, and edge-case scenarios
7. Keep scenarios concise — 3-8 steps each
8. If a step doesn't exist yet, write it with a comment: # NEW STEP — needs implementation

## Output Format
Return ONLY the .feature file content. No markdown fences, no explanation.
Start with the @tags line, then Feature:, then scenarios.`;

const USER_PROMPT_TEMPLATE = `Generate a comprehensive Gherkin feature file for the following user story:

---
{USER_STORY}
---

Requirements:
- Write 4-6 scenarios covering: happy path, negative cases, edge cases, and data-driven variations
- Reuse existing step definitions where possible
- Mark any new steps with "# NEW STEP — needs implementation"
- Choose appropriate tags (@smoke for critical happy paths, @regression for thorough coverage)
- Think about what a senior QA engineer would test that a junior might miss`;

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------

async function parseArgs(): Promise<string> {
  const args = process.argv.slice(2);
  let story = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--story' && args[i + 1]) {
      story = args[i + 1] as string;
      break;
    }
    if (args[i] === '--file' && args[i + 1]) {
      const filePath = path.resolve(args[i + 1] as string);
      story = await fs.readFile(filePath, 'utf-8');
      break;
    }
  }

  if (!story) {
    console.error(`
Usage:
  npm run generate:tests -- --story "As a user, I want to sort products by price"
  npm run generate:tests -- --file path/to/user-story.txt

Environment:
  Set ANTHROPIC_API_KEY in your .env file or environment.
`);
    process.exit(1);
  }

  return story.trim();
}

// ---------------------------------------------------------------------------
// Claude API Integration
// ---------------------------------------------------------------------------

async function generateFeatureFile(userStory: string): Promise<string> {
  if (!config.anthropicApiKey) {
    console.error('Error: ANTHROPIC_API_KEY is not set.');
    console.error('Add it to your .env file: ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  console.log('Generating test scenarios from user story...\n');
  console.log(`Story: "${userStory}"\n`);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: USER_PROMPT_TEMPLATE.replace('{USER_STORY}', userStory),
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract text from response
  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text;
}

// ---------------------------------------------------------------------------
// File Output
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

async function writeFeatureFile(content: string, userStory: string): Promise<string> {
  const slug = slugify(userStory);
  const filename = `generated-${slug}.feature`;
  const outputPath = path.join('features', filename);

  await fs.writeFile(outputPath, content, 'utf-8');
  return outputPath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const userStory = await parseArgs();
  const featureContent = await generateFeatureFile(userStory);
  const outputPath = await writeFeatureFile(featureContent, userStory);

  console.log('Generated feature file:\n');
  console.log('─'.repeat(60));
  console.log(featureContent);
  console.log('─'.repeat(60));
  console.log(`\nSaved to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('  1. Review the generated scenarios');
  console.log('  2. Implement any steps marked "# NEW STEP"');
  console.log('  3. Add the new step file to cucumber.cjs require array');
  console.log('  4. Run: npm run test:bdd');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Generation failed:', message);
  process.exit(1);
});
