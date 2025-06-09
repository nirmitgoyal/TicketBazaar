# Component Documentation

## Table of Contents
- [Core Components](#core-components)
- [UI Components](#ui-components)
- [Maps Components](#maps-components)
- [Schema Components](#schema-components)
- [Hooks](#hooks)
- [Contexts](#contexts)
- [Utilities](#utilities)

## Core Components

### EventCard
**Location:** `client/src/components/event-card.tsx`

A comprehensive card component for displaying event information with interactive features.

**Props:**
```typescript
interface EventCardProps {
  event: Ticket;
  onContactSeller?: () => void;
  onViewDetails?: () => void;
  showContactButton?: boolean;
  className?: string;
}
```

**Features:**
- Event image with fallback handling
- Price display with original price comparison
- Trust score integration
- Seller verification badges
- Real-time availability updates
- Responsive design with mobile optimization

**Usage:**
```tsx
<EventCard 
  event={ticket}
  onContactSeller={() => setShowContactModal(true)}
  onViewDetails={() => navigate(`/event/${ticket.id}`)}
  showContactButton={true}
/>
```

### TicketCard
**Location:** `client/src/components/ticket-card.tsx`

Detailed ticket listing component with seller information and verification status.

**Props:**
```typescript
interface TicketCardProps {
  ticket: Ticket;
  seller?: User;
  onContact?: () => void;
  showFullDetails?: boolean;
}
```

**Features:**
- Comprehensive ticket information display
- Seller trust score and verification status
- QR code display for verified tickets
- Price comparison with market rates
- Contact seller functionality
- Responsive layout

### SearchBar
**Location:** `client/src/components/search-bar.tsx`

Advanced search component with intelligent suggestions and filters.

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}
```

**Features:**
- Real-time search suggestions
- Category and location filters
- Price range filtering
- Date range selection
- Recent search history
- Voice search capability (mobile)

### FilterDropdown
**Location:** `client/src/components/filter-dropdown.tsx`

Comprehensive filtering component for event search and discovery.

**Features:**
- Multi-category selection
- Price range slider
- Date range picker
- Location-based filtering
- Trending/popular filters
- Clear all functionality

### VenueMap
**Location:** `client/src/components/venue-map.tsx`

Interactive venue map component with seat selection and heat mapping.

**Props:**
```typescript
interface VenueMapProps {
  eventId: number;
  onSeatSelect?: (seatId: string) => void;
  selectedSeats?: string[];
  showHeatMap?: boolean;
}
```

**Features:**
- Interactive seat selection
- Heat map visualization showing popularity
- Zoom and pan controls
- Section highlighting
- Price overlay on seats
- Accessibility support

## UI Components

### TrustScoreMeter
**Location:** `client/src/components/trust-score-meter.tsx`

Visual representation of seller trustworthiness with detailed breakdown.

**Props:**
```typescript
interface TrustScoreMeterProps {
  score: number;
  reviews: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Features:**
- Animated progress indicator
- Color-coded scoring (red/yellow/green)
- Breakdown of score components
- Review count display
- Tooltip with detailed information

### VerificationBadge
**Location:** `client/src/components/verification-badge.tsx`

Displays verification status with appropriate icons and colors.

**Props:**
```typescript
interface VerificationBadgeProps {
  isVerified: boolean;
  verificationType?: 'phone' | 'email' | 'instagram' | 'identity';
  showLabel?: boolean;
}
```

### TicketVerification
**Location:** `client/src/components/ticket-verification.tsx`

Comprehensive ticket verification component with QR code scanning.

**Features:**
- QR code scanner integration
- Verification status display
- Authenticity checking
- Error handling for invalid tickets
- Success/failure animations

### ContactRequestModal
**Location:** `client/src/components/contact-request-modal.tsx`

Modal component for initiating contact between buyers and sellers.

**Props:**
```typescript
interface ContactRequestModalProps {
  ticket: Ticket;
  seller: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}
```

**Features:**
- Pre-filled message templates
- Character limit indicator
- Seller information display
- Safety guidelines
- Real-time validation

## Maps Components

### GoogleMapsProvider
**Location:** `client/src/components/maps/GoogleMapsProvider.tsx`

Context provider for Google Maps integration with error handling and fallbacks.

**Features:**
- API key management
- Loading state handling
- Error boundary integration
- Fallback to static maps
- Performance optimization

### MapFallback
**Location:** `client/src/components/maps/MapFallback.tsx`

Fallback component when Google Maps is unavailable.

**Features:**
- Static map display
- Location information
- Directions link
- Error messaging
- Graceful degradation

## Schema Components

### OrganizationSchema
**Location:** `client/src/components/schema/organization-schema.tsx`

SEO-optimized structured data for organization information.

### BreadcrumbSchema
**Location:** `client/src/components/schema/breadcrumb-schema.tsx`

Generates structured data for navigation breadcrumbs.

## Hooks

### useAuth
**Location:** `client/src/hooks/use-auth.tsx`

Authentication hook with user state management.

**Returns:**
```typescript
interface AuthHook {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
}
```

### useWebSocket
**Location:** `client/src/hooks/use-websocket.tsx`

WebSocket connection management with automatic reconnection.

**Features:**
- Automatic connection management
- Message queue during disconnection
- Real-time event handling
- Connection status monitoring

### useTicketView
**Location:** `client/src/hooks/use-ticket-view.ts`

Tracks ticket viewing analytics for user engagement.

**Features:**
- View tracking
- Analytics integration
- Privacy-compliant data collection
- Performance optimization

### useSearchHints
**Location:** `client/src/hooks/use-search-hints.ts`

Provides intelligent search suggestions based on user behavior.

**Features:**
- Real-time suggestions
- Popular searches
- Location-based hints
- Search history

### useMobile
**Location:** `client/src/hooks/use-mobile.tsx`

Responsive design hook for mobile detection and optimization.

**Returns:**
```typescript
interface MobileHook {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}
```

## Contexts

### AtmosphereContext
**Location:** `client/src/contexts/AtmosphereContext.tsx`

Manages atmospheric effects and sound for enhanced user experience.

**Features:**
- Background music management
- Sound effect triggers
- Volume control
- User preference storage

## Utilities

### Logger
**Location:** `client/src/utils/logger.ts`

Centralized logging utility with different log levels.

**Features:**
- Environment-aware logging
- Error reporting integration
- Performance metrics
- User action tracking

### Performance
**Location:** `client/src/utils/performance.ts`

Performance monitoring and optimization utilities.

**Features:**
- Page load metrics
- Component render timing
- Memory usage tracking
- Performance recommendations

### SEO Utils
**Location:** `client/src/utils/seo-utils.ts`

SEO optimization utilities for meta tags and structured data.

**Features:**
- Dynamic meta tag generation
- Open Graph optimization
- Twitter Card support
- Structured data helpers

## Best Practices

### Component Guidelines
1. **Props Validation:** Always use TypeScript interfaces for props
2. **Error Boundaries:** Wrap components in error boundaries for graceful failure
3. **Loading States:** Include loading states for better UX
4. **Accessibility:** Follow WCAG guidelines for accessibility
5. **Performance:** Use React.memo for expensive components

### State Management
1. **Local State:** Use useState for component-specific state
2. **Global State:** Use Context API for shared state
3. **Server State:** Use React Query for server data
4. **Form State:** Use React Hook Form for form management

### Styling Guidelines
1. **Tailwind CSS:** Primary styling system
2. **Component Libraries:** Use shadcn/ui components
3. **Responsive Design:** Mobile-first approach
4. **Animations:** Use Framer Motion for complex animations

### Testing Recommendations
1. **Unit Tests:** Test individual components
2. **Integration Tests:** Test component interactions
3. **E2E Tests:** Use Playwright for end-to-end testing
4. **Visual Tests:** Screenshot testing for UI consistency

## Component Hierarchy

```
App
├── Router
│   ├── HomePage
│   │   ├── SearchBar
│   │   ├── FilterDropdown
│   │   └── EventCard[]
│   ├── EventDetailsPage
│   │   ├── VenueMap
│   │   ├── TicketCard[]
│   │   └── ContactRequestModal
│   ├── ProfilePage
│   │   ├── TrustScoreMeter
│   │   └── VerificationBadge
│   └── TicketVerificationPage
│       └── TicketVerification
├── GoogleMapsProvider
├── AtmosphereContext
└── ErrorBoundary
```