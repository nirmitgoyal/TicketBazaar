# Testing Documentation

## Table of Contents
- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Test Data Management](#test-data-management)
- [Continuous Integration](#continuous-integration)

## Testing Strategy

### Testing Pyramid
```
              E2E Tests
           (Playwright - 10%)
         ┌─────────────────┐
        │   User Workflows  │
       └─────────────────────┘
      
     Integration Tests
    (API + Database - 20%)
   ┌─────────────────────┐
  │   Service Integration │
 └───────────────────────┘

Unit Tests
(Jest/Vitest - 70%)
┌─────────────────────────────┐
│ Components, Hooks, Services │
└─────────────────────────────┘
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user journeys and payment flows
- **Performance Tests**: API response times < 200ms

## Unit Testing

### Frontend Component Testing
```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventCard } from '../components/EventCard';

const mockEvent = {
  id: 1,
  title: 'Sunburn Festival 2024',
  price: 5000,
  originalPrice: 4500,
  venue: 'Vagator Beach, Goa',
  date: '2024-12-28T18:00:00.000Z',
  sellerId: 25,
  city: 'Goa',
  category: 'Music',
  status: 'available',
  verificationCode: 'SUN2024001',
  qrCode: 'data:image/png;base64,test',
  trending: true,
  sellingFast: false,
  createdAt: '2024-01-01T00:00:00.000Z'
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('EventCard Component', () => {
  it('displays event information correctly', () => {
    renderWithProviders(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Sunburn Festival 2024')).toBeInTheDocument();
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
    expect(screen.getByText('Vagator Beach, Goa')).toBeInTheDocument();
  });

  it('shows trending badge when event is trending', () => {
    renderWithProviders(<EventCard event={mockEvent} />);
    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('calls onContactSeller when contact button is clicked', () => {
    const onContactSeller = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onContactSeller={onContactSeller} />
    );
    
    fireEvent.click(screen.getByText('Contact Seller'));
    expect(onContactSeller).toHaveBeenCalledTimes(1);
  });

  it('handles missing optional fields gracefully', () => {
    const eventWithoutOptionals = {
      ...mockEvent,
      imageUrl: undefined,
      seatSection: undefined
    };
    
    renderWithProviders(<EventCard event={eventWithoutOptionals} />);
    expect(screen.getByTestId('event-card')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// __tests__/hooks/use-auth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('initializes with no user when not authenticated', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Not authenticated' })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('successfully logs in user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password'
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Service Unit Testing
```typescript
// __tests__/services/ticket.service.test.ts
import { TicketService } from '../services/ticket.service';
import { MockStorage } from '../__mocks__/storage';

describe('TicketService', () => {
  let ticketService: TicketService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    ticketService = new TicketService(mockStorage);
  });

  describe('createTicket', () => {
    it('creates ticket with valid data', async () => {
      const ticketData = {
        title: 'Test Event',
        price: 100,
        sellerId: 1,
        venue: 'Test Venue',
        date: new Date('2024-12-31'),
        category: 'Music',
        city: 'Mumbai'
      };

      const result = await ticketService.createTicket(ticketData);

      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Event');
      expect(result.verificationCode).toBeDefined();
      expect(mockStorage.createTicket).toHaveBeenCalledWith(
        expect.objectContaining(ticketData)
      );
    });

    it('throws error for past event date', async () => {
      const ticketData = {
        title: 'Past Event',
        price: 100,
        sellerId: 1,
        venue: 'Test Venue',
        date: new Date('2020-01-01'),
        category: 'Music',
        city: 'Mumbai'
      };

      await expect(ticketService.createTicket(ticketData))
        .rejects.toThrow('Event date must be in the future');
    });

    it('generates unique verification codes', async () => {
      const tickets = await Promise.all([
        ticketService.createTicket({ /* ticket data */ }),
        ticketService.createTicket({ /* ticket data */ })
      ]);

      expect(tickets[0].verificationCode).not.toBe(tickets[1].verificationCode);
    });
  });
});
```

## Integration Testing

### API Endpoint Testing
```typescript
// __tests__/integration/tickets.api.test.ts
import request from 'supertest';
import { app } from '../server';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/test-db';

describe('Tickets API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clear database tables before each test
    await clearTestData();
  });

  describe('POST /api/tickets', () => {
    it('creates a new ticket with valid data', async () => {
      const userData = await createTestUser();
      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'password'
        })
        .expect(200);

      const ticketData = {
        title: 'Integration Test Event',
        price: 1500,
        venue: 'Test Venue',
        date: '2024-12-31T18:00:00.000Z',
        category: 'Music',
        city: 'Mumbai',
        description: 'Test event description'
      };

      const response = await agent
        .post('/api/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body.title).toBe(ticketData.title);
      expect(response.body.sellerId).toBe(userData.id);
      expect(response.body.verificationCode).toBeDefined();
    });

    it('rejects unauthenticated requests', async () => {
      const ticketData = {
        title: 'Unauthorized Event',
        price: 1500
      };

      await request(app)
        .post('/api/tickets')
        .send(ticketData)
        .expect(401);
    });

    it('validates required fields', async () => {
      const userData = await createTestUser();
      const agent = await loginUser(userData);

      const invalidTicketData = {
        title: '', // Empty title
        price: -100 // Negative price
      };

      const response = await agent
        .post('/api/tickets')
        .send(invalidTicketData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });
  });

  describe('GET /api/tickets', () => {
    it('returns paginated ticket list', async () => {
      // Create test tickets
      await createTestTickets(25);

      const response = await request(app)
        .get('/api/tickets?limit=10&offset=0')
        .expect(200);

      expect(response.body.length).toBe(10);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });

    it('filters tickets by category', async () => {
      await createTestTickets([
        { category: 'Music' },
        { category: 'Sports' },
        { category: 'Music' }
      ]);

      const response = await request(app)
        .get('/api/tickets?category=Music')
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(ticket => {
        expect(ticket.category).toBe('Music');
      });
    });
  });
});
```

### Database Integration Testing
```typescript
// __tests__/integration/database.test.ts
import { db } from '../server/db';
import { users, tickets, contactRequests } from '../shared/schema';
import { eq } from 'drizzle-orm';

describe('Database Integration', () => {
  beforeEach(async () => {
    await clearAllTables();
  });

  describe('User-Ticket Relationships', () => {
    it('maintains referential integrity', async () => {
      // Create user
      const [user] = await db.insert(users).values({
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword: 'hashed'
      }).returning();

      // Create ticket
      const [ticket] = await db.insert(tickets).values({
        sellerId: user.id,
        title: 'Test Event',
        price: 100,
        venue: 'Test Venue',
        date: new Date('2024-12-31'),
        category: 'Music',
        city: 'Mumbai',
        verificationCode: 'TEST001',
        qrCode: 'test-qr'
      }).returning();

      // Verify relationship
      const ticketWithSeller = await db
        .select()
        .from(tickets)
        .leftJoin(users, eq(tickets.sellerId, users.id))
        .where(eq(tickets.id, ticket.id));

      expect(ticketWithSeller[0].users?.name).toBe('Test User');
    });

    it('prevents orphaned tickets when user is deleted', async () => {
      const [user] = await db.insert(users).values({
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword: 'hashed'
      }).returning();

      await db.insert(tickets).values({
        sellerId: user.id,
        title: 'Test Event',
        price: 100,
        venue: 'Test Venue',
        date: new Date('2024-12-31'),
        category: 'Music',
        city: 'Mumbai',
        verificationCode: 'TEST001',
        qrCode: 'test-qr'
      });

      // Attempt to delete user should fail due to foreign key constraint
      await expect(
        db.delete(users).where(eq(users.id, user.id))
      ).rejects.toThrow();
    });
  });
});
```

## End-to-End Testing

### Critical User Journey Testing
```typescript
// tests/e2e/ticket-purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Ticket Purchase Flow', () => {
  test('complete buyer journey from search to contact', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Find Tickets');

    // 2. Search for events
    await page.fill('[data-testid=search-input]', 'Sunburn Festival');
    await page.click('[data-testid=search-button]');
    
    // 3. Verify search results
    await expect(page.locator('[data-testid=event-card]')).toBeVisible();
    await expect(page.locator('text=Sunburn Festival')).toBeVisible();

    // 4. Apply filters
    await page.click('[data-testid=filter-dropdown]');
    await page.check('[data-testid=filter-music]');
    await page.click('[data-testid=apply-filters]');

    // 5. View event details
    await page.click('[data-testid=event-card]:first-child');
    await expect(page.locator('[data-testid=event-details]')).toBeVisible();

    // 6. Check ticket information
    await expect(page.locator('[data-testid=ticket-price]')).toBeVisible();
    await expect(page.locator('[data-testid=seller-info]')).toBeVisible();

    // 7. Register as new user (if not logged in)
    await page.click('[data-testid=contact-seller-button]');
    
    if (await page.locator('[data-testid=login-modal]').isVisible()) {
      await page.click('[data-testid=register-link]');
      await page.fill('[data-testid=register-email]', 'test@example.com');
      await page.fill('[data-testid=register-name]', 'Test User');
      await page.fill('[data-testid=register-password]', 'SecurePass123!');
      await page.click('[data-testid=register-submit]');
      
      await expect(page.locator('[data-testid=registration-success]')).toBeVisible();
    }

    // 8. Send contact request
    await page.fill('[data-testid=contact-message]', 
      'Hi, I am interested in purchasing this ticket. Is it still available?');
    await page.click('[data-testid=send-contact-request]');

    // 9. Verify success
    await expect(page.locator('[data-testid=contact-success]')).toBeVisible();
    await expect(page.locator('text=Contact request sent')).toBeVisible();
  });

  test('seller can manage contact requests', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'seller@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');

    // Navigate to profile
    await page.click('[data-testid=user-menu]');
    await page.click('[data-testid=profile-link]');

    // Check contact requests tab
    await page.click('[data-testid=contact-requests-tab]');
    await expect(page.locator('[data-testid=contact-request-item]')).toBeVisible();

    // Respond to contact request
    await page.click('[data-testid=view-request]:first-child');
    await page.click('[data-testid=accept-request]');
    
    await expect(page.locator('[data-testid=request-accepted]')).toBeVisible();
  });
});
```

### Performance E2E Testing
```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load times meet performance budgets', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  test('search results load quickly', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.fill('[data-testid=search-input]', 'concert');
    await page.click('[data-testid=search-button]');
    await page.waitForSelector('[data-testid=search-results]');
    
    const searchTime = Date.now() - startTime;
    expect(searchTime).toBeLessThan(1000); // 1 second budget
  });

  test('maps load within performance budget', async ({ page }) => {
    await page.goto('/map');
    
    const startTime = Date.now();
    await page.waitForSelector('[data-testid=google-map]');
    
    const mapLoadTime = Date.now() - startTime;
    expect(mapLoadTime).toBeLessThan(2000); // 2 second budget
  });
});
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Browse tickets"
    weight: 70
    flow:
      - get:
          url: "/api/events"
      - think: 2
      - get:
          url: "/api/tickets"
          qs:
            limit: 20
            offset: 0

  - name: "Search tickets"
    weight: 20
    flow:
      - get:
          url: "/api/events/search"
          qs:
            q: "concert"
            category: "Music"

  - name: "User authentication"
    weight: 10
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password"
      - get:
          url: "/api/auth/user"
```

### Database Performance Testing
```typescript
// __tests__/performance/database.test.ts
import { performance } from 'perf_hooks';
import { db } from '../server/db';
import { tickets, users } from '../shared/schema';

describe('Database Performance', () => {
  test('ticket search query performance', async () => {
    // Create test data
    await seedLargeDataset(10000); // 10k tickets

    const startTime = performance.now();
    
    const results = await db
      .select()
      .from(tickets)
      .where(eq(tickets.category, 'Music'))
      .limit(20);
    
    const queryTime = performance.now() - startTime;
    
    expect(queryTime).toBeLessThan(100); // < 100ms
    expect(results.length).toBeGreaterThan(0);
  });

  test('complex join query performance', async () => {
    const startTime = performance.now();
    
    const results = await db
      .select({
        ticketTitle: tickets.title,
        sellerName: users.name,
        sellerRating: users.rating
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.sellerId, users.id))
      .where(eq(tickets.status, 'available'))
      .orderBy(desc(tickets.createdAt))
      .limit(50);
    
    const queryTime = performance.now() - startTime;
    expect(queryTime).toBeLessThan(200); // < 200ms
  });
});
```

## Security Testing

### Authentication Security Tests
```typescript
// __tests__/security/auth.test.ts
import request from 'supertest';
import { app } from '../server';

describe('Authentication Security', () => {
  test('prevents SQL injection in login', async () => {
    const maliciousPayload = {
      email: "admin@example.com'; DROP TABLE users; --",
      password: "password"
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(maliciousPayload)
      .expect(400);

    expect(response.body.error).toContain('validation');
  });

  test('rate limits authentication attempts', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    // Make multiple failed attempts
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/auth/login')
        .send(loginData);
    }

    // 6th attempt should be rate limited
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(429);

    expect(response.body.error).toContain('rate limit');
  });

  test('validates password strength', async () => {
    const weakPasswordData = {
      email: 'test@example.com',
      name: 'Test User',
      password: '123' // Weak password
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(weakPasswordData)
      .expect(400);

    expect(response.body.error).toContain('password');
  });
});
```

## Test Data Management

### Test Database Setup
```typescript
// tests/helpers/test-db.ts
import { db } from '../../server/db';
import { users, tickets, contactRequests } from '../../shared/schema';

export async function setupTestDatabase() {
  // Create test tables if they don't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS test_users AS 
    SELECT * FROM users WHERE 1=0
  `);
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS test_tickets AS 
    SELECT * FROM tickets WHERE 1=0
  `);
}

export async function cleanupTestDatabase() {
  await db.delete(contactRequests);
  await db.delete(tickets);
  await db.delete(users);
}

export async function createTestUser(overrides = {}) {
  const userData = {
    email: 'test@example.com',
    name: 'Test User',
    hashedPassword: await bcrypt.hash('password', 10),
    isVerified: true,
    rating: 4.5,
    ...overrides
  };

  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function createTestTickets(count: number) {
  const tickets = Array.from({ length: count }, (_, i) => ({
    sellerId: 1,
    title: `Test Event ${i + 1}`,
    price: 1000 + i * 100,
    venue: `Test Venue ${i + 1}`,
    date: new Date('2024-12-31'),
    category: i % 2 === 0 ? 'Music' : 'Sports',
    city: 'Mumbai',
    verificationCode: `TEST${String(i + 1).padStart(3, '0')}`,
    qrCode: `test-qr-${i + 1}`
  }));

  return db.insert(tickets).values(tickets).returning();
}
```

## Continuous Integration

### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ticket_bazaar_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    strategy:
      matrix:
        node-version: [22.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Setup test database
      run: npm run db:push
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ticket_bazaar_test

    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ticket_bazaar_test

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ticket_bazaar_test

    - name: Upload test reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-reports
        path: |
          coverage/
          test-results/
          playwright-report/
```

### Test Reporting
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts}',
    'shared/**/*.{ts}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ]
};
```