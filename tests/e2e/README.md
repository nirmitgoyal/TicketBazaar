# End-to-End Test Suite

This comprehensive end-to-end test suite simulates real human behavior on the full-stack web application using Playwright. The tests cover all major user flows, edge cases, and cross-browser compatibility scenarios.

## Test Suite Overview

### Test Categories

1. **Homepage & Navigation** (`01-homepage-navigation.spec.ts`)
   - Page loading and responsiveness
   - Navigation functionality
   - Search interface
   - Page transitions with animations
   - Analytics tracking

2. **Authentication Flow** (`02-authentication-flow.spec.ts`)
   - Login/registration forms
   - Google OAuth integration
   - Session management
   - Profile completion
   - Password reset functionality

3. **Search & Filtering** (`03-search-and-filters.spec.ts`)
   - Search functionality with autocomplete
   - Advanced filtering options
   - Sorting mechanisms
   - Mobile search interface
   - Search state preservation

4. **Map Interactions** (`04-map-interactions.spec.ts`)
   - Google Maps integration
   - Zoom and pan interactions
   - Marker interactions and info windows
   - Mobile gesture support
   - Location-based filtering

5. **WebSocket Real-time** (`05-websocket-realtime.spec.ts`)
   - WebSocket connection establishment
   - Real-time ticket updates
   - Live messaging
   - User presence indicators
   - Connection recovery

6. **File Upload** (`06-file-upload-functionality.spec.ts`)
   - Drag and drop file uploads
   - File type and size validation
   - Upload progress indication
   - Mobile file handling
   - Error recovery

7. **Form Validation** (`07-form-validation-edge-cases.spec.ts`)
   - Comprehensive input validation
   - Edge case handling
   - Network error scenarios
   - Special character support
   - Concurrent validation

8. **Ticket Purchase Flow** (`08-ticket-purchase-flow.spec.ts`)
   - Complete user journey from search to contact
   - Seller profile reviews
   - Ticket verification process
   - Mobile purchase experience
   - Analytics event tracking

9. **Accessibility Compliance** (`09-accessibility-only.spec.ts`)
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast validation
   - Focus management
   - Semantic HTML structure

10. **Cross-Browser Compatibility** (`10-cross-browser-compatibility.spec.ts`)
    - Browser-specific feature testing
    - Layout consistency
    - JavaScript API compatibility
    - Touch event handling
    - Vendor prefix support

## Test Features

### Realistic User Behavior Simulation
- Human-like typing patterns with variable delays
- Mouse movement simulation before clicks
- Touch gesture support for mobile devices
- Realistic form filling patterns
- Network condition simulation

### Comprehensive Coverage
- Happy path scenarios
- Edge cases and error conditions
- Cross-browser compatibility
- Mobile and desktop experiences
- Accessibility requirements
- Performance benchmarks

### Advanced Testing Capabilities
- WebSocket connection testing
- File upload with drag-and-drop
- Google Maps interaction testing
- Analytics event verification
- Session state management
- Network error simulation

## Running the Tests

### Prerequisites
- Node.js and npm installed
- Application server running on localhost:5000
- Playwright browsers installed

### Installation
```bash
npx playwright install
```

### Running All Tests
```bash
npx playwright test
```

### Running Specific Test Categories
```bash
# Run only authentication tests
npx playwright test tests/e2e/specs/02-authentication-flow.spec.ts

# Run only mobile tests
npx playwright test --project="Mobile Chrome"

# Run only performance tests
npx playwright test tests/e2e/specs/09-performance-accessibility.spec.ts
```

### Running Tests in Different Browsers
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# All browsers
npx playwright test
```

### Debug Mode
```bash
# Run tests in headed mode with slow motion
npx playwright test --headed --slowMo=1000

# Debug specific test
npx playwright test --debug tests/e2e/specs/01-homepage-navigation.spec.ts
```

## Test Configuration

### Browser Projects
- **Desktop Chrome**: Standard desktop experience
- **Desktop Firefox**: Cross-browser compatibility
- **Desktop Safari**: WebKit engine testing
- **Mobile Chrome**: Android mobile experience
- **Mobile Safari**: iOS mobile experience

### Test Environment
- **Base URL**: http://localhost:5000
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Parallel**: Full parallelization except on CI

### Reporting
- **HTML Report**: Comprehensive visual report with screenshots
- **JSON Report**: Machine-readable test results
- **Line Reporter**: Console output for CI/CD

## Test Data and Fixtures

### Test Users
- Valid user credentials for authentication testing
- Different user roles (buyer, seller)
- Edge case email/phone formats

### Test Events and Tickets
- Realistic event data with proper dates
- Various price ranges and categories
- Different venue locations with coordinates

### File Fixtures
- Sample PDF and image files for upload testing
- Invalid file types for validation testing
- Large files for performance testing

## Best Practices

### Test Organization
- Each spec file focuses on a specific feature area
- Tests are independent and can run in any order
- Shared utilities in `test-helpers.ts`
- Centralized test data in `fixtures/`

### Error Handling
- Graceful handling of missing elements
- Network error simulation and recovery
- Timeout management for slow operations
- Screenshot capture on failures

### Maintenance
- Page Object Model for reusable components
- Data-driven tests using fixtures
- Environment-specific configurations
- Regular test data cleanup

## Continuous Integration

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run dev &
    npx playwright test
    
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Reports
- HTML reports with screenshots and videos
- Test result artifacts for debugging
- Performance metrics tracking
- Accessibility violation reports

## Troubleshooting

### Common Issues
1. **Server not running**: Ensure `npm run dev` is active
2. **Browser not found**: Run `npx playwright install`
3. **Tests timing out**: Check network conditions and server performance
4. **Element not found**: Verify selector specificity and page load timing

### Debug Steps
1. Run tests in headed mode to see browser interactions
2. Add `page.pause()` for interactive debugging
3. Check browser console for JavaScript errors
4. Verify test data and fixtures are available

## Contributing

### Adding New Tests
1. Follow existing naming conventions
2. Use TestHelpers for common operations
3. Add appropriate test data to fixtures
4. Include both positive and negative scenarios
5. Test across different browsers and devices

### Test Maintenance
- Regular review of test stability
- Update selectors as UI evolves
- Refresh test data periodically
- Monitor test execution times
- Update browser compatibility matrix