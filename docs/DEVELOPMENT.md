# Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Architecture](#code-architecture)
- [Database Development](#database-development)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Performance Guidelines](#performance-guidelines)

## Getting Started

### Prerequisites
- Node.js 22.x
- PostgreSQL 15+
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd ticket-bazaar

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Development Scripts
```bash
# Development server with hot reload
npm run dev

# Database operations
npm run db:push          # Push schema changes
npm run db:generate      # Generate migration files
npm run db:seed          # Seed database with sample data

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:watch       # Run tests in watch mode

# Code quality
npm run lint             # ESLint checking
npm run type-check       # TypeScript validation
npm run format           # Prettier formatting

# Build and production
npm run build            # Build for production
npm start                # Start production server
```

## Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Convention
```
feat: add new feature
fix: resolve bug in component
docs: update API documentation
style: format code
refactor: improve component structure
test: add unit tests
chore: update dependencies
```

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

## Code Architecture

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── maps/       # Map-related components
│   │   │   └── schema/     # SEO schema components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utility libraries
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   └── utils/              # Server utilities
├── shared/                 # Shared TypeScript definitions
│   └── schema.ts           # Database schema and types
├── scripts/                # Build and utility scripts
├── tests/                  # Testing suites
└── docs/                   # Documentation
```

### Design Patterns

#### Repository Pattern
```typescript
// server/services/ticket.service.ts
export class TicketService {
  constructor(private storage: IStorage) {}

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    // Validation logic
    // Business rules
    return this.storage.createTicket(ticketData);
  }
}
```

#### Controller Pattern
```typescript
// server/controllers/ticket.controller.ts
export class TicketController extends BaseController {
  async createTicket(req: Request, res: Response) {
    try {
      const ticketData = this.validateRequest(req.body, insertTicketSchema);
      const ticket = await this.ticketService.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
```

## Database Development

### Schema Management
```typescript
// shared/schema.ts
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Migration Workflow
```bash
# Make schema changes in shared/schema.ts
# Generate migration
npm run db:generate

# Review generated migration
# Apply migration
npm run db:push
```

### Data Seeding
```typescript
// scripts/db-seed.ts
async function seedDatabase() {
  // Insert sample users
  const users = await db.insert(usersTable).values([
    { email: "user1@example.com", name: "User One" },
  ]).returning();

  // Insert sample tickets
  await db.insert(ticketsTable).values([
    { sellerId: users[0].id, title: "Concert Ticket" },
  ]);
}
```

### Query Optimization
```typescript
// Efficient queries with joins
const ticketsWithSellers = await db
  .select()
  .from(tickets)
  .leftJoin(users, eq(tickets.sellerId, users.id))
  .where(eq(tickets.status, 'available'))
  .limit(20);

// Use indexes for better performance
CREATE INDEX idx_tickets_seller_id ON tickets(seller_id);
CREATE INDEX idx_tickets_status ON tickets(status);
```

## Frontend Development

### Component Development
```typescript
// components/EventCard.tsx
interface EventCardProps {
  event: Ticket;
  onContactSeller?: () => void;
}

export function EventCard({ event, onContactSeller }: EventCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">₹{event.price}</p>
        <Button onClick={onContactSeller}>Contact Seller</Button>
      </CardContent>
    </Card>
  );
}
```

### State Management
```typescript
// hooks/use-tickets.ts
export function useTickets() {
  return useQuery({
    queryKey: ['/api/tickets'],
    queryFn: () => fetch('/api/tickets').then(res => res.json())
  });
}

// Form handling
export function useTicketForm() {
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketListingSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: TicketFormData) => 
      apiRequest('/api/tickets', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    }
  });

  return { form, mutation };
}
```

### Routing
```typescript
// App.tsx
function Router() {
  return (
    <Router>
      <Route path="/" component={HomePage} />
      <Route path="/events/:id" component={EventDetailsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/tickets/new" component={ListTicketPage} />
    </Router>
  );
}
```

### Performance Optimization
```typescript
// Lazy loading
const EventDetailsPage = lazy(() => import('./pages/event-details'));

// Memoization
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => 
    processExpensiveData(data), [data]
  );
  
  return <div>{processedData}</div>;
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedTicketList = ({ tickets }) => (
  <List
    height={600}
    itemCount={tickets.length}
    itemSize={120}
    itemData={tickets}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <TicketCard ticket={data[index]} />
      </div>
    )}
  </List>
);
```

## Backend Development

### API Development
```typescript
// routes/ticket.routes.ts
export const ticketRoutes = Router();

ticketRoutes.get('/', ticketController.getAllTickets);
ticketRoutes.post('/', isAuthenticated, ticketController.createTicket);
ticketRoutes.get('/:id', ticketController.getTicketById);
ticketRoutes.patch('/:id', isAuthenticated, ticketController.updateTicket);
ticketRoutes.delete('/:id', isAuthenticated, ticketController.deleteTicket);
```

### Middleware Development
```typescript
// middleware/validation.middleware.ts
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed' });
    }
  };
}

// middleware/auth.middleware.ts
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}
```

### Error Handling
```typescript
// middleware/error.middleware.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('API Error', error, {
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details
    });
  }

  res.status(500).json({
    error: 'Internal server error'
  });
}
```

## Testing

### Unit Testing
```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from '../EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    price: 100,
    sellerId: 1
  };

  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });

  it('calls onContactSeller when button clicked', () => {
    const onContactSeller = jest.fn();
    render(<EventCard event={mockEvent} onContactSeller={onContactSeller} />);
    
    fireEvent.click(screen.getByText('Contact Seller'));
    expect(onContactSeller).toHaveBeenCalled();
  });
});
```

### Integration Testing
```typescript
// __tests__/api/tickets.test.ts
describe('Ticket API', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('creates a new ticket', async () => {
    const ticketData = {
      title: 'Test Event',
      price: 100,
      sellerId: 1
    };

    const response = await request(app)
      .post('/api/tickets')
      .send(ticketData)
      .expect(201);

    expect(response.body.title).toBe('Test Event');
  });
});
```

### End-to-End Testing
```typescript
// tests/e2e/ticket-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and view ticket listing', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  // Create ticket
  await page.goto('/tickets/new');
  await page.fill('[data-testid=title]', 'Concert Ticket');
  await page.fill('[data-testid=price]', '100');
  await page.click('[data-testid=submit]');

  // Verify ticket appears in listings
  await page.goto('/');
  await expect(page.locator('text=Concert Ticket')).toBeVisible();
});
```

## Code Quality

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true
  }
}
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "prefer-const": "error"
  }
}
```

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are included for new functionality
- [ ] Performance implications considered
- [ ] Security vulnerabilities addressed
- [ ] Accessibility guidelines followed
- [ ] Documentation updated

## Performance Guidelines

### Frontend Performance
```typescript
// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));

// Image optimization
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Event"
  width={300}
  height={200}
/>

// Bundle analysis
npm run build -- --analyze
```

### Backend Performance
```typescript
// Database query optimization
const tickets = await db
  .select({
    id: ticketsTable.id,
    title: ticketsTable.title,
    price: ticketsTable.price,
    sellerName: usersTable.name
  })
  .from(ticketsTable)
  .leftJoin(usersTable, eq(ticketsTable.sellerId, usersTable.id))
  .where(eq(ticketsTable.status, 'available'))
  .limit(20);

// Caching
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
});

// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Monitoring
```typescript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'navigation') {
      console.log('Page load time:', entry.duration);
    }
  });
});

performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
```

## Development Tools

### VS Code Extensions
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Auto Rename Tag
- GitLens
- Thunder Client (API testing)

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Lighthouse
- Web Vitals

### Debugging
```typescript
// Client-side debugging
console.log('Debug info:', data);
debugger; // Breakpoint in browser

// Server-side debugging
import debug from 'debug';
const log = debug('app:tickets');
log('Processing ticket creation');

// React Query debugging
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <QueryClient>
        <App />
      </QueryClient>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```