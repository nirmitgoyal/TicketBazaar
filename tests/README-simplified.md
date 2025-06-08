# 🧪 Simplified Testing Framework

## Overview
This simplified testing framework focuses on essential functionality testing with minimal complexity.

## Test Structure

### E2E Tests (`/tests/e2e/`)
- **`basic-navigation.spec.ts`** - Core navigation and page loading
- **`basic-forms.spec.ts`** - Essential form validation and submission
- **`basic-user-flows.spec.ts`** - Key user journeys and interactions

### Test Helpers (`/tests/helpers/`)
- **`simple-test-utils.ts`** - Basic utility functions for common operations

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e-ui

# Run specific test file
npx playwright test basic-navigation

# Run in headed mode (see browser)
npx playwright test --headed
```

## Test Configuration

### Playwright Config
- Single browser (Chromium) for simplicity
- Sequential test execution
- Basic reporting (HTML + console)
- Minimal timeouts and retries

### GitHub Actions
- **`basic-ci.yml`** - Essential CI pipeline with build and test
- **`basic-deploy.yml`** - Simple deployment workflow

## Writing Tests

### Guidelines
- Keep tests simple and focused on core functionality
- Use descriptive test names
- Test only essential user flows
- Avoid complex scenarios or edge cases
- Use `data-testid` attributes for reliable element selection

### Example Test
```typescript
test("should navigate to main pages", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Ticket Bazaar/);
  
  await page.click('[data-testid="nav-map"]');
  await expect(page.url()).toContain("/map");
});
```

## Test Data
Tests use minimal mock data and focus on UI interactions rather than complex data scenarios.

## Maintenance
- Tests are designed to be stable and require minimal maintenance
- Focus on testing core functionality that users depend on
- Regular cleanup of unused test files and helpers
