# Architecture & Design Decisions

This document explains the "why" behind key architectural choices in this framework. Use it to understand trade-offs and defend decisions in technical discussions.

---

## Why Playwright over Cypress or Selenium?

| Factor                 | Playwright                   | Cypress              | Selenium                  |
| ---------------------- | ---------------------------- | -------------------- | ------------------------- |
| **Multi-browser**      | Chromium, Firefox, WebKit    | Chromium-based only  | All via WebDriver         |
| **API testing**        | Built-in `APIRequestContext` | Via `cy.request()`   | Requires separate library |
| **Parallel execution** | Native sharding + workers    | Paid (Cypress Cloud) | Grid setup required       |
| **Auto-waiting**       | Built-in, no flaky waits     | Built-in             | Manual waits needed       |
| **Language**           | JS/TS, Python, Java, C#      | JS/TS only           | Many languages            |
| **Speed**              | Fast (CDP/WebSocket)         | Fast (in-browser)    | Slower (HTTP protocol)    |
| **Mobile viewports**   | Native device emulation      | Limited              | Appium needed             |

**Decision:** Playwright gives the best coverage-to-complexity ratio. One framework handles UI, API, visual, and mobile — no need to juggle multiple tools.

---

## Why Unified Framework (UI + API in Playwright)?

Many teams use Playwright for UI and a separate tool (RestAssured, Supertest) for API. We chose a unified approach:

- **Single reporting pipeline** — UI and API results appear in the same Allure dashboard
- **Shared fixtures** — the `apiFixture` provides a configured client with the same lifecycle as UI fixtures
- **One dependency tree** — no version conflicts between test frameworks
- **Simpler CI** — one `npm test` command runs everything

**Trade-off:** If you need Java-based API testing (e.g., for a Java team), you'd want RestAssured instead. This framework optimizes for TypeScript-first teams.

---

## Why Zod for Schema Validation?

Alternatives considered: JSON Schema (ajv), Joi, io-ts.

**Why Zod:**

- **TypeScript-native** — infers types from schemas (`z.infer<typeof PetSchema>`)
- **Runtime validation** — catches API contract drift that TypeScript alone can't (TS only checks compile time)
- **Composable** — schemas compose with `.extend()`, `.pick()`, `.merge()`
- **Zero config** — no code generation step (unlike JSON Schema + quicktype)

```typescript
// Schema defines shape AND TypeScript type in one place
const PetSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(['available', 'pending', 'sold']),
});
type Pet = z.infer<typeof PetSchema>; // TypeScript type derived automatically
```

---

## Why `mergeTests()` over Fixture Extend Chains?

Playwright supports two patterns for combining fixtures:

**Extend chain (fragile):**

```typescript
const test1 = base.extend({ fixtureA });
const test2 = test1.extend({ fixtureB }); // coupled to test1
const test3 = test2.extend({ fixtureC }); // coupled to test2
```

**`mergeTests()` (decoupled):**

```typescript
const test = mergeTests(authFixture, apiFixture); // independent
```

**Decision:** `mergeTests()` keeps fixtures independent. Adding or removing a fixture doesn't break the chain. Each fixture is testable in isolation.

---

## Why Page Objects Don't Contain Assertions?

Some frameworks put assertions inside page objects:

```typescript
// Anti-pattern
class LoginPage {
  async verifyLoggedIn() {
    expect(this.page).toHaveURL(/inventory/); // assertion in page object
  }
}
```

**Why we avoid this:**

- **Reusability** — the same page object works for positive and negative tests
- **Readability** — test files show the full story (action + verification)
- **Maintainability** — changing an assertion doesn't require touching the page object
- **Single responsibility** — pages describe behavior, tests verify outcomes

---

## Why `data-test` Attributes for Locators?

| Strategy    | Example                      | Resilience              | Speed |
| ----------- | ---------------------------- | ----------------------- | ----- |
| `data-test` | `[data-test="login-button"]` | High                    | Fast  |
| CSS class   | `.btn-primary`               | Low (styling changes)   | Fast  |
| XPath       | `//div[3]/button[1]`         | Very low                | Slow  |
| Text        | `getByText('Login')`         | Medium (i18n breaks it) | Fast  |
| Role        | `getByRole('button')`        | High (accessibility)    | Fast  |

**Decision:** `data-test` attributes are explicitly for testing — they survive CSS refactors, text changes, and DOM restructuring. SauceDemo already ships with `data-test` attributes, making this the natural choice.

For elements without `data-test`, we fall back to `getByRole()` for semantic queries.

---

## Why CommonJS for Cucumber Config?

The project uses ESM (`"type": "module"` in package.json), but `cucumber.cjs` uses CommonJS.

**Why:** Cucumber.js v11 has a known issue loading ESM config files on Windows. The `export default` syntax in an ESM config file fails to register step definitions. Using `.cjs` is the reliable workaround that works across all platforms.

Step definitions and support files remain in TypeScript/ESM — only the config file is CommonJS.

---

## Why Separate `World` Class for BDD?

Playwright tests use fixtures (`test.extend()`). Cucumber tests use a World class. Why not share?

**They solve different problems:**

- **Playwright fixtures** are scoped to test lifecycle and injected automatically
- **Cucumber World** is the `this` context shared across steps within a scenario

The World class wraps Playwright (launches browser, creates page) and instantiates the same page objects used by Playwright tests. This means:

- Step definitions reuse the same `LoginPage`, `CartPage`, etc.
- No duplicate page object maintenance
- BDD and non-BDD tests share the same locator strategies

---

## Why `fail-fast: false` in CI Matrix?

When one browser fails, you still want results from the others. A Firefox-only bug shouldn't block your Chromium and WebKit results.

**Trade-off:** Longer total CI time when there are failures. Worth it because partial results are more useful than no results.

---

## Why API Tests Run Once (Not Per Browser)?

API tests don't use a browser — they send HTTP requests. Running them in chromium, firefox, AND webkit would triple the execution time with identical results.

The pipeline runs API tests only in the `chromium + Node 20` matrix cell, avoiding 5 redundant runs.
