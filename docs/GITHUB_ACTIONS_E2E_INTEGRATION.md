# GitHub Actions E2E Testing Integration

This document outlines the comprehensive GitHub Actions CI/CD pipeline integration with end-to-end testing for the Ticket Bazaar application.

## Workflow Overview

### 1. Main CI Workflow (`ci.yml`)

**Triggers:** Push to main, Pull requests to main

**Jobs:**
- **Unit Tests**: Jest unit and integration tests with PostgreSQL
- **E2E Tests**: Cross-browser testing (Chrome, Firefox, Safari)
- **Mobile E2E Tests**: iOS Safari and Android Chrome simulation
- **Performance Tests**: Core Web Vitals and accessibility validation
- **Build Verification**: Production build validation

**Features:**
- Matrix strategy for browser compatibility
- PostgreSQL service containers
- Comprehensive test data seeding
- Artifact uploads for test reports and videos
- Parallel execution with fail-fast disabled

### 2. PR Validation Workflow (`pr-validation.yml`)

**Triggers:** Pull request events (opened, synchronize, reopened)

**Jobs:**
- **Quick Validation**: TypeScript checking, linting, build verification
- **Critical E2E Tests**: Essential user flow validation
- **Security & Performance Check**: Vulnerability scanning and performance baseline
- **Mobile Compatibility**: Mobile-specific validation
- **PR Validation Summary**: Comprehensive status reporting

**Features:**
- Fast feedback for pull requests
- Security audit integration
- Performance regression detection
- Mobile-first validation

### 3. Deployment Workflow (`deploy.yml`)

**Triggers:** Push to main, Manual workflow dispatch

**Jobs:**
- **Pre-deployment Tests**: Full cross-browser E2E validation
- **Mobile Production Validation**: Production-ready mobile testing
- **Production Performance Benchmark**: Performance baseline establishment
- **Deploy Staging**: Staging environment deployment
- **Staging Validation**: Post-staging deployment testing
- **Deploy Production**: Production deployment
- **Post-deployment Validation**: Production smoke tests

**Features:**
- Multi-environment deployment strategy
- Production-like testing environments
- Comprehensive validation gates
- Deployment rollback safety

### 4. Status Checks Workflow (`status-checks.yml`)

**Triggers:** Push to main, Pull requests to main

**Jobs:**
- **Branch Protection Check**: Commit format and file validation
- **Code Quality Gates**: TypeScript compilation and build verification
- **Test Coverage Gates**: Unit test coverage and critical E2E validation
- **Security Compliance**: Security scanning and best practices
- **Performance Baseline**: Performance regression detection

**Features:**
- Required status checks for branch protection
- Code quality enforcement
- Security compliance validation
- Performance monitoring

## Test Execution Strategy

### Browser Matrix Testing
```yaml
strategy:
  fail-fast: false
  matrix:
    browser: [chromium, firefox, webkit]
```

### Mobile Device Testing
```yaml
strategy:
  matrix:
    device: ['Mobile Chrome', 'Mobile Safari']
```

### Database Service Integration
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ticketbazaar_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Environment Configuration

### Test Database Setup
```bash
npm run db:push
npm run seed:users
npm run seed:events
npm run seed:tickets
```

### Application Server Startup
```bash
npm run dev &
sleep 30
curl --retry 10 --retry-connrefused --retry-delay 5 http://localhost:5000/api/health
```

### Environment Variables
- `NODE_ENV`: test/staging/production
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `GOOGLE_MAPS_API_KEY`: Google Maps integration

## Artifact Management

### Test Reports
- HTML reports with screenshots and videos
- JSON results for programmatic analysis
- Performance metrics and benchmarks
- Mobile compatibility reports

### Retention Policies
- Test reports: 30 days
- Failure videos: 30 days
- Build artifacts: 7-30 days based on environment
- Performance benchmarks: 90 days

## Quality Gates

### Unit Testing
- Jest test suite execution
- Code coverage thresholds
- TypeScript type checking

### E2E Testing
- Cross-browser compatibility validation
- Mobile device simulation
- Real user behavior simulation
- Performance benchmark compliance

### Security
- Dependency vulnerability scanning
- Hardcoded secret detection
- Security best practice validation

### Performance
- Core Web Vitals measurement
- Page load time benchmarks
- Memory usage monitoring
- Network condition simulation

## Branch Protection Rules

### Required Status Checks
- Branch Protection Check
- Code Quality Gates
- Test Coverage Gates
- Security Compliance
- Performance Baseline

### Merge Requirements
- All status checks must pass
- At least one approving review
- Up-to-date with base branch
- No merge conflicts

## Notification Strategy

### Success Notifications
- Build completion summaries
- Test execution reports
- Deployment confirmations

### Failure Notifications
- Test failure details with screenshots
- Build error diagnostics
- Security vulnerability alerts
- Performance regression warnings

## Local Development Integration

### Running Tests Locally
```bash
# Install Playwright browsers
npx playwright install

# Run full test suite
npx playwright test

# Run specific environment tests
npx playwright test --config=playwright.staging.config.ts
npx playwright test --config=playwright.production.config.ts
```

### Debug Mode
```bash
# Interactive debugging
npx playwright test --debug

# Headed mode with slow motion
npx playwright test --headed --slowMo=1000
```

## Required GitHub Secrets

To enable full functionality of the CI/CD pipeline, configure these secrets in your GitHub repository:

- `DATABASE_URL`: PostgreSQL connection string for production testing
- `SESSION_SECRET`: Secure session encryption key
- `GOOGLE_MAPS_API_KEY`: Google Maps API key for map testing
- `STAGING_URL`: Staging environment URL
- `PRODUCTION_URL`: Production environment URL

## Security Considerations

### Secret Management
- Store sensitive data in GitHub Secrets
- Rotate secrets regularly
- Use environment-specific secrets
- Audit secret access logs

### Test Data Security
- Use non-production test data
- Sanitize sensitive information
- Implement data cleanup procedures
- Monitor test environment access

This integration ensures comprehensive validation of the Ticket Bazaar application across all supported browsers and devices while maintaining high standards for security, performance, and user experience.