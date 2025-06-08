# Comprehensive E2E Testing Framework

This testing framework implements realistic, full-stack end-to-end tests that simulate detailed manual QA processes, focusing on complete user journeys rather than isolated units.

## Test Architecture

### Core Principles
- **User Journey Focus**: Tests reflect end-to-end flows, not fragmented components
- **Rich Assertions**: Descriptive messages that validate both backend state and frontend UI
- **Visual Debugging**: Automatic screenshots and videos on failure
- **Stable Selectors**: Uses data-testid attributes for reliable element targeting
- **Reusable Functions**: Common flows abstracted into helper utilities

## Test Categories

### 1. Navigation & Routing (`01-navigation-routing.spec.ts`)
- Page navigation with correct content rendering
- Invalid URL handling with graceful fallbacks
- Navigation state maintenance during transitions
- Direct URL access to protected routes
- Responsive navigation across viewport sizes

### 2. Form Validation (`02-form-validation.spec.ts`)
- Valid form submissions with success transitions
- Empty field validation (client-side and server-side)
- Invalid format handling (dates, numbers, emails)
- Excessive input length management
- Unicode and special character support
- Form state preservation during navigation
- Network error handling with retry mechanisms

### 3. Real-Time Features (`03-websocket-realtime.spec.ts`)
- WebSocket connection establishment
- Live update rendering
- Disconnection and reconnection handling
- Data consistency after reconnection
- Real-time notification delivery

### 4. Interactive Map (`04-interactive-map.spec.ts`)
- Map rendering with event markers
- User interactions (zoom, pan, click)
- Marker click event details display
- Location-based filtering
- Map-list synchronization
- Error handling for map loading failures

### 5. UI Animations (`05-ui-animations.spec.ts`)
- Smooth page transitions
- Modal animation timing
- Responsive design across viewports
- Form submission loading states
- Hover effect animations
- Scroll-triggered animations and lazy loading

### 6. Error Handling (`06-error-handling.spec.ts`)
- 400 Bad Request with user-friendly messages
- 401 Unauthorized with authentication prompts
- 404 Not Found with proper fallbacks
- 500 Server Error with graceful degradation
- Network timeout handling
- Retry mechanisms for failed requests

### 7. User Journeys (`07-user-journeys.spec.ts`)
- Complete ticket discovery and contact flow
- End-to-end ticket listing process
- Search and filtering workflows
- Authentication flow handling
- Mobile user experience
- Interruption recovery scenarios
- Concurrent action handling

## Helper Utilities

### TestUtils Class (`tests/helpers/test-utils.ts`)
Provides comprehensive helper methods for:
- Navigation between pages
- Authentication state management
- Form filling and submission
- Error validation
- Map interactions
- UI state validation
- Animation timing
- Network simulation
- Responsive testing
- Screenshot capture

### DataGenerators (`tests/helpers/data-generators.ts`)
Generates test data for:
- Valid ticket listings
- Invalid form submissions
- Long input stress testing
- Unicode character testing
- Contact messages
- Viewport configurations

### APIMock (`tests/helpers/api-mock.ts`)
API mocking utilities for:
- Authentication success/failure
- Event data responses
- Server error simulation
- Network delay simulation
- Mock cleanup

## Running Tests

### Quick Smoke Tests
```bash
./tests/scripts/run-tests.sh quick
```

### Specific Test Categories
```bash
./tests/scripts/run-tests.sh forms
./tests/scripts/run-tests.sh maps
./tests/scripts/run-tests.sh ui
./tests/scripts/run-tests.sh errors
./tests/scripts/run-tests.sh journeys
```

### Complete Test Suite
```bash
./tests/scripts/run-tests.sh all
```

## Test Configuration

### Browser Support
- Chromium (primary)
- Firefox (cross-browser validation)
- Mobile viewport testing (Pixel 5 simulation)

### Reporting
- HTML reports with detailed failure analysis
- JSON results for CI/CD integration
- Line output for development
- Screenshot and video capture on failures
- Trace files for debugging

### Environment Requirements
- Node.js 18+ 
- Application server running on localhost:5000
- Playwright browsers installed

## Data-TestID Strategy

All interactive elements include `data-testid` attributes for reliable targeting:

### Navigation
- `data-testid="navigation"` - Main navigation header
- `data-testid="nav-home"` - Home navigation button
- `data-testid="nav-map"` - Map navigation button
- `data-testid="nav-list-ticket"` - List ticket navigation
- `data-testid="nav-profile"` - Profile navigation
- `data-testid="mobile-menu"` - Mobile navigation menu
- `data-testid="hamburger-menu"` - Mobile menu toggle

### Forms
- `data-testid="ticket-listing-form"` - Main ticket listing form
- `data-testid="ticket-title"` - Ticket title input
- `data-testid="ticket-description"` - Description textarea
- `data-testid="ticket-venue"` - Venue input
- `data-testid="ticket-date"` - Date input
- `data-testid="ticket-price"` - Price input
- `data-testid="ticket-category"` - Category select

### Content Areas
- `data-testid="hero-section"` - Homepage hero
- `data-testid="event-grid"` - Event listings grid
- `data-testid="event-card"` - Individual event cards
- `data-testid="ticket-card"` - Individual ticket cards
- `data-testid="google-map"` - Map container
- `data-testid="map-marker"` - Map markers

### Modals and Overlays
- `data-testid="event-modal"` - Event detail modal
- `data-testid="contact-modal"` - Contact seller modal
- `data-testid="loading-spinner"` - Loading indicators
- `data-testid="error-message"` - Error displays
- `data-testid="success-message"` - Success notifications

## Best Practices

### Test Structure
1. Each test file focuses on a specific feature area
2. Tests are organized by user journey rather than technical components
3. Setup and teardown handle clean state management
4. Assertions include descriptive failure messages

### Reliability
1. Wait for elements to be visible before interaction
2. Handle timing issues with appropriate waits
3. Use stable selectors (data-testid) over CSS classes
4. Implement retry logic for flaky network operations

### Maintainability
1. Abstract common operations into helper functions
2. Use page object patterns for complex interactions
3. Keep test data generation separate from test logic
4. Document expected behaviors clearly

### Performance
1. Run tests in parallel where possible
2. Use headless browsers for faster execution
3. Optimize wait times and timeouts
4. Clean up resources after test completion

This framework provides comprehensive coverage of user workflows while maintaining reliability and maintainability for long-term testing success.