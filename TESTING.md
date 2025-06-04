# Ticket Bazaar Testing Guide

This document provides an overview of the testing process for the Ticket Bazaar application. It covers the different types of tests we use, how to run them, and how they fit into the deployment process.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Types of Tests](#types-of-tests)
3. [Running Tests](#running-tests)
4. [Pre-Deployment Testing](#pre-deployment-testing)
5. [Continuous Integration](#continuous-integration)
6. [Adding New Tests](#adding-new-tests)

## Testing Strategy

Our testing strategy follows a pyramid approach:

- **Unit Tests**: Test individual components, functions, and modules in isolation
- **Integration Tests**: Test interactions between multiple components or services
- **API Tests**: Test API endpoints and ensure they follow contract specifications
- **UI Component Tests**: Test UI components rendering and behavior
- **End-to-End Tests**: Test complete user flows from beginning to end

We use Jest as our primary testing framework, along with Testing Library for React component tests, and MSW (Mock Service Worker) for mocking API responses during testing.

## Types of Tests

### Unit Tests

Located in `/tests/server` and `/tests/client` directories, these test individual functions, components, and modules in isolation. Each unit should be focused on a specific piece of functionality.

### Integration Tests

Located in `/tests/integration` directory, these test the interactions between different parts of the system. This ensures components work together correctly.

Key integration test areas:

- Authentication flow (`auth.test.ts`)
- Map functionality (`map.test.ts`)
- Ticket purchase flow (`ticket-purchase.test.ts`)

### UI Component Tests

Located in `/tests/client/components`, these test UI components for correct rendering and behavior. They verify that:

- Components render correctly with different props
- User interactions result in expected UI changes
- State is managed correctly within components

### API Tests

These tests verify that API endpoints return expected responses. They check:

- HTTP status codes
- Response formats and contents
- Error handling behavior
- Authorization requirements

### Custom Tests

We also have custom test scripts for specific features:

- `run-test-reviews.js`: Tests the review system functionality
- `pre-deploy-tests.js`: Runs comprehensive pre-deployment tests

## Running Tests

### Running All Tests

To run all tests:

```bash
npx jest
```

### Running Specific Test Categories

To run only integration tests:

```bash
npx jest --testMatch="**/tests/integration/**/*.+(ts|tsx|js)"
```

To run only UI component tests:

```bash
npx jest --testMatch="**/tests/client/**/*.+(ts|tsx|js)"
```

To run only server unit tests:

```bash
npx jest --testMatch="**/tests/server/**/*.+(ts|tsx|js)"
```

### Running Individual Test Files

To run a specific test file:

```bash
npx jest tests/integration/map.test.ts
```

### Running Pre-Deployment Tests

Our pre-deployment test suite performs comprehensive validation:

```bash
bash deploy.sh
```

This script runs all tests and verifies the application is ready for deployment.

## Pre-Deployment Testing

Before deploying, our automated tests verify:

1. **TypeScript Type Checking**: Ensures type safety throughout the codebase
2. **Unit and Integration Tests**: Confirms all components work as expected individually and together
3. **Critical API Endpoints**: Verifies that critical API endpoints are functioning
4. **Map Functionality**: Tests that the map view displays events correctly
5. **Ticket Purchase Flow**: Confirms the complete purchase flow works properly
6. **Production Build**: Ensures the application builds successfully for production

The deployment script (`deploy.sh`) runs this comprehensive verification process and only approves deployment if all tests pass.

## Continuous Integration

For ongoing development, it's recommended to:

1. Run tests before each commit
2. Always run the full test suite before deploying
3. Add new tests whenever implementing new features or fixing bugs

## Adding New Tests

### Adding Unit Tests

1. Add a new test file in the appropriate directory (`/tests/client` or `/tests/server`)
2. Follow the existing pattern for test structure
3. Use Jest's test, describe, and expect functions
4. Mock dependencies as needed

### Adding Integration Tests

1. Add a new test file in `/tests/integration`
2. Test interactions between multiple components
3. Use MSW to mock API responses if needed
4. Focus on testing complete user flows

### Adding UI Component Tests

1. Add a new test file in `/tests/client/components`
2. Use Testing Library to render and interact with components
3. Test different prop combinations and states
4. Verify correct rendering and user interaction behavior

## Testing Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it
2. **Keep tests independent**: Tests should not depend on each other
3. **Mock external dependencies**: Use mocks for APIs, databases, etc.
4. **Use descriptive test names**: Test names should describe what they're testing
5. **Follow AAA pattern**: Arrange, Act, Assert
6. **Test edge cases**: Consider invalid inputs, empty states, error conditions
7. **Maintain test coverage**: Aim for high test coverage, especially for critical paths

By following these guidelines, we maintain a robust testing strategy that ensures the quality and reliability of the Ticket Bazaar application.
