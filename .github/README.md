# GitHub Actions CI/CD Pipeline

This repository uses GitHub Actions to run comprehensive E2E tests and maintain code quality through automated testing workflows.

## Workflow Overview

### 1. E2E Tests (`e2e-tests.yml`)
**Triggers:** Push to main/develop, Pull requests, Daily at 2 AM UTC

**Test Matrix:**
- Test Suites: navigation, forms, realtime, maps, ui, errors, journeys  
- Browsers: Chromium, Firefox
- Total: 14 parallel test jobs

**Features:**
- Parallel execution for faster feedback
- Cross-browser compatibility testing
- Automated failure screenshots
- Test result artifacts
- Daily regression testing

### 2. Test Quality Gates (`test-quality-gates.yml`)
**Triggers:** Pull requests, Push to main

**Quality Checks:**
- Code linting and type checking
- Smoke tests for critical paths
- Form validation verification
- Error handling validation
- Responsive design testing

**Purpose:** Prevents broken code from merging by running essential tests

### 3. Performance Tests (`performance-tests.yml`)
**Triggers:** Push to main, Weekly schedule, Manual dispatch

**Performance Validation:**
- Load testing with concurrent users
- Animation performance benchmarks
- Resource usage monitoring
- Memory leak detection

### 4. Visual Regression Tests (`visual-regression-tests.yml`)
**Triggers:** Pull requests, Push to main

**Visual Validation:**
- Screenshot comparison
- UI consistency checking
- Layout regression detection
- Cross-browser visual parity

### 5. Test Deployment Pipeline (`test-deployment.yml`)
**Triggers:** Push to main, Manual dispatch

**Deployment Flow:**
1. Deploy to staging environment
2. Run staging smoke tests
3. Deploy to production (if staging passes)
4. Run production health checks
5. Alert on deployment failures

### 6. Test Status Check (`test-status-check.yml`)
**Triggers:** Pull requests, Push to main/develop

**Framework Health:**
- Verifies all test files exist
- Validates test framework integrity
- Provides test coverage summary
- Comments test status on PRs

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Database
- `TEST_DATABASE_URL` - Test database connection string
- `STAGING_DATABASE_URL` - Staging database connection
- `PRODUCTION_DATABASE_URL` - Production database connection

### API Keys
- `STAGING_API_KEY` - Staging environment API key
- `PRODUCTION_API_KEY` - Production environment API key

### Deployment URLs
- `STAGING_URL` - Staging environment URL
- `PRODUCTION_URL` - Production environment URL

## Test Categories in CI

### Navigation & Routing
- Page navigation verification
- URL handling and redirects
- Protected route access
- Responsive navigation

### Form Validation
- Input validation testing
- Error message verification
- Network error handling
- Data persistence

### Real-time Features
- WebSocket connection testing
- Live update validation
- Disconnection recovery
- Message delivery

### Interactive Maps
- Map rendering verification
- User interaction testing
- Marker functionality
- Location filtering

### UI Animations
- Transition smoothness
- Loading state handling
- Responsive breakpoints
- Animation timing

### Error Handling
- HTTP status code responses
- User-friendly error messages
- Fallback mechanisms
- Recovery workflows

### User Journeys
- Complete workflow testing
- Multi-step processes
- Authentication flows
- Mobile experience

## Monitoring and Alerts

### Failure Notifications
- Automatic issue creation for production failures
- PR comments for test failures
- Visual regression alerts
- Performance degradation warnings

### Artifact Management
- Test results stored for 7-30 days
- Screenshot evidence for failures
- Performance benchmarks
- Visual comparison images

## Local Development

### Running Tests Locally
```bash
# Quick smoke tests
npm run test:smoke

# Specific test category
npm run test:forms

# Full test suite
npm run test:e2e

# Performance tests
npm run test:performance
```

### Pre-commit Validation
```bash
# Run quality gates locally
npm run test:quality-gates

# Visual regression update
npm run test:visual -- --update-snapshots
```

## Branch Protection

Main and develop branches are protected with required status checks:
- Test Quality Gates must pass
- E2E test matrix must complete successfully
- Visual regression tests must pass
- Performance tests must not degrade

## Troubleshooting

### Test Failures
1. Check test artifacts for screenshots and videos
2. Review test logs for specific error messages
3. Verify environment configuration
4. Check database connectivity

### CI/CD Issues
1. Validate all required secrets are configured
2. Ensure deployment environments are accessible
3. Check browser installation and dependencies
4. Verify application build and startup

### Performance Problems
1. Review performance test artifacts
2. Check resource usage patterns
3. Analyze memory consumption
4. Validate concurrent user handling

This comprehensive testing pipeline ensures high code quality, prevents regressions, and maintains application reliability across all user scenarios.