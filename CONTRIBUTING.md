# Contributing

Guidelines for maintaining code quality and consistency in this project.

---

## Setup

```bash
git clone https://github.com/usahan/job-hunter.git
cd job-hunter
npm install
npx playwright install --with-deps
```

## Coding Standards

### TypeScript

- **Strict mode** is enforced — no `any` types unless absolutely necessary
- Use `async/await` — never raw Promises or callbacks
- Import with `.js` extensions (required for ESM)
- Use path aliases: `@pages/*`, `@api/*`, `@fixtures/*`, `@config/*`, `@data/*`

### Page Objects

- Extend `BasePage` for all new page objects
- Declare locators in the constructor as `readonly` properties
- Prefer `data-test` attributes, then `getByRole()`, then CSS selectors
- **Never** put assertions in page objects — assertions belong in tests
- **Never** use hard waits (`page.waitForTimeout()`) — use Playwright's auto-waiting

### Tests

- One `describe` block per feature, with a tag: `@smoke`, `@regression`, `@critical`, or `@visual`
- Each test must be independent — no shared state between tests
- Use Faker.js for dynamic data, JSON fixtures for static/expected data
- Use the merged `test` from `fixtures/test-base.ts` for UI tests needing auth

### API Tests

- Validate every response against a Zod schema
- Test both success and error paths (especially 404)
- Include at least one response time assertion per endpoint group

### BDD

- Feature files use `As a / I want / So that` format
- Reuse existing step definitions before writing new ones
- New step files must be added to the `require` array in `cucumber.cjs`

## Commit Messages

Use conventional commits:

```
feat: add product filtering test suite
fix: stabilize checkout test with explicit wait
test: add 404 edge case for store API
docs: update architecture diagram
chore: upgrade Playwright to 1.51
```

## Pre-commit Hooks

Husky runs ESLint and Prettier on staged files before every commit. If the hook fails:

1. Fix the lint/format issue
2. Stage the fix
3. Commit again

Do **not** skip hooks with `--no-verify`.

## Pull Request Process

1. Create a feature branch from `main`
2. Write tests first (TDD encouraged)
3. Ensure all tests pass locally: `npm test`
4. Run quality checks: `npm run ci:quality`
5. Open a PR — CI will run the full matrix automatically
6. PR requires passing CI before merge
