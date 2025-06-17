# TicketBazaar - Secure Peer-to-Peer Ticket Marketplace

**A revolutionary ticket resale platform that connects buyers and sellers directly, eliminating intermediaries and making event access affordable and secure across India.**

## 🎯 What is TicketBazaar?

TicketBazaar is a modern peer-to-peer marketplace designed specifically for the Indian market, where people can safely buy and sell tickets for events, movies, sports, concerts, and transportation. Unlike traditional ticket resale platforms that charge hefty fees, TicketBazaar enables direct connections between buyers and sellers with zero transaction fees.

### The Problem We Solve

In India's bustling event scene, tickets often sell out quickly through official channels, leaving many eager attendees empty-handed. Traditional resale platforms charge 15-25% fees, making already expensive tickets even more costly. TicketBazaar addresses these issues by:

- **Eliminating middleman fees** - Direct peer-to-peer transactions
- **Building trust through verification** - Social media linked profiles and rating systems
- **Enabling fair pricing** - Market-driven pricing without platform markups
- **Providing safe communication** - Structured contact and negotiation system
- **Supporting local markets** - Focus on Indian cities and cultural events

### Key Innovations

- **🤝 Pure P2P Model**: Connect directly with sellers/buyers without platform transaction fees
- **📱 Social Verification**: Instagram profile linking ensures authentic user identities
- **🗺️ Location Intelligence**: Google Maps integration with venue discovery and directions
- **💬 Real-time Communication**: WebSocket-powered instant messaging for quick negotiations
- **🎨 Mobile-First Design**: Optimized for Indian mobile usage patterns and data constraints
- **🚌 Multi-Modal Support**: Events, movies, sports, buses, trains, and flight tickets 

## 🏗️ Architecture Diagrams

### 1. High-Level Architecture Diagram

```mermaid
graph TB
    %% Client Layer
    subgraph "Client Layer"
        WEB[Web Browser]
        PWA[Progressive Web App]
        MOB[Mobile Devices]
    end

    %% Frontend Application
    subgraph "Frontend Application (React/TypeScript)"
        UI[User Interface Layer]
        ROUTER[Router - Wouter]
        STATE[State Management - TanStack Query]
        AUTH_CLIENT[Auth Context]
        WS_CLIENT[WebSocket Client]
    end

    %% Backend Services
    subgraph "Backend Services (Node.js/Express)"
        API[API Gateway]
        AUTH_SERVER[Authentication Service]
        TICKET_SVC[Ticket Service]
        USER_SVC[User Service]
        AI_SVC[AI Verification Service]
        FRAUD_SVC[Fraud Detection Service]
        WS_SERVER[WebSocket Server]
    end

    %% Database Layer
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL Database)]
        CACHE[Redis Cache]
        SESSION[Session Store]
    end

    %% External Services
    subgraph "External Services"
        GOOGLE[Google OAuth & Maps]
        STRIPE[Stripe Payments]
        WHATSAPP[WhatsApp Business]
        INSTAGRAM[Instagram API]
        HONEYBADGER[Honeybadger Monitoring]
    end

    %% Infrastructure
    subgraph "Infrastructure"
        REPLIT[Replit Hosting]
        CDN[Content Delivery Network]
        MONITORING[Performance Monitoring]
    end

    %% Connections
    WEB --> UI
    PWA --> UI
    MOB --> UI
    
    UI --> ROUTER
    ROUTER --> STATE
    STATE --> API
    AUTH_CLIENT --> AUTH_SERVER
    WS_CLIENT --> WS_SERVER
    
    API --> AUTH_SERVER
    API --> TICKET_SVC
    API --> USER_SVC
    API --> AI_SVC
    API --> FRAUD_SVC
    
    AUTH_SERVER --> POSTGRES
    TICKET_SVC --> POSTGRES
    USER_SVC --> POSTGRES
    AI_SVC --> POSTGRES
    FRAUD_SVC --> POSTGRES
    
    AUTH_SERVER --> SESSION
    API --> CACHE
    
    AUTH_SERVER --> GOOGLE
    TICKET_SVC --> STRIPE
    USER_SVC --> WHATSAPP
    USER_SVC --> INSTAGRAM
    API --> HONEYBADGER
    
    REPLIT --> API
    CDN --> UI
    MONITORING --> API
```

### 2. Low-Level Architecture Diagram

```mermaid
graph TB
    %% Frontend Modules
    subgraph "Frontend Architecture"
        subgraph "Pages Layer"
            HOME[Home Page]
            TICKET_DETAIL[Ticket Detail]
            LIST_TICKET[List Ticket]
            PROFILE[User Profile]
            LOGIN[Login/Register]
        end
        
        subgraph "Components Layer"
            TICKET_CARD[Ticket Card]
            SEARCH_BAR[Search Bar]
            MAP_COMP[Venue Map]
            VERIFICATION[Verification Modal]
            PAYMENT[Payment Components]
        end
        
        subgraph "Hooks & Context"
            USE_AUTH[useAuth Hook]
            USE_WS[useWebSocket Hook]
            USE_ANALYTICS[useAnalytics Hook]
            ATMOSPHERE_CTX[Atmosphere Context]
        end
        
        subgraph "Utils & Libraries"
            API_CLIENT[API Client]
            QUERY_CLIENT[Query Client]
            UTILS[Utility Functions]
            ANIMATIONS[Animation Library]
        end
    end

    %% Backend Modules
    subgraph "Backend Architecture"
        subgraph "Route Layer"
            AUTH_ROUTES[Auth Routes]
            TICKET_ROUTES[Ticket Routes]
            USER_ROUTES[User Routes]
            AI_ROUTES[AI Verification Routes]
            POPULARITY_ROUTES[Popularity Routes]
        end
        
        subgraph "Controller Layer"
            TICKET_CTRL[Ticket Controller]
            USER_CTRL[User Controller]
            BASE_CTRL[Base Controller]
        end
        
        subgraph "Service Layer"
            TICKET_SERVICE[Ticket Service]
            USER_SERVICE[User Service]
            AI_SERVICE[AI Verification Service]
            FRAUD_SERVICE[Fraud Detection Service]
            WS_SERVICE[WebSocket Service]
            CLEANUP_SERVICE[Cleanup Service]
        end
        
        subgraph "Middleware Layer"
            AUTH_MW[Auth Middleware]
            RATE_LIMIT[Rate Limiting]
            ERROR_MW[Error Middleware]
            FRAUD_MW[Fraud Protection]
            VALIDATION[Validation Middleware]
        end
        
        subgraph "Data Access Layer"
            STORAGE[Storage Interface]
            OPTIMIZED_STORAGE[Optimized Storage]
            QUERY_BUILDER[Query Builder]
            CACHE_MANAGER[Cache Manager]
        end
    end

    %% Database Schema
    subgraph "Database Schema"
        USERS_TBL[(Users Table)]
        TICKETS_TBL[(Tickets Table)]
        CONTACT_REQ[(Contact Requests)]
        FEEDBACK_TBL[(User Feedback)]
        TICKET_VIEWS[(Ticket Views)]
        POPULARITY[(Ticket Popularity)]
    end

    %% Key Data Flows
    HOME --> TICKET_CARD
    TICKET_CARD --> TICKET_DETAIL
    LIST_TICKET --> TICKET_ROUTES
    LOGIN --> AUTH_ROUTES
    
    TICKET_ROUTES --> TICKET_CTRL
    AUTH_ROUTES --> USER_CTRL
    TICKET_CTRL --> TICKET_SERVICE
    USER_CTRL --> USER_SERVICE
    
    TICKET_SERVICE --> STORAGE
    USER_SERVICE --> STORAGE
    AI_SERVICE --> STORAGE
    STORAGE --> TICKETS_TBL
    STORAGE --> USERS_TBL
    
    AUTH_MW --> USER_SERVICE
    RATE_LIMIT --> ALL_ROUTES[All Routes]
    ERROR_MW --> ALL_ROUTES
    
    WS_SERVICE --> WS_CLIENT
    FRAUD_SERVICE --> FRAUD_MW
    CLEANUP_SERVICE --> POPULARITY
```

### 3. Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Gateway
    participant AUTH as Auth Service
    participant TS as Ticket Service
    participant DB as Database
    participant EXT as External Services

    Note over U, EXT: User Registration & Authentication Flow
    U->>FE: Register/Login
    FE->>API: POST /auth/login
    API->>AUTH: Validate credentials
    AUTH->>DB: Query user data
    AUTH->>EXT: Google OAuth (optional)
    AUTH-->>API: User session
    API-->>FE: Authentication token
    FE-->>U: Dashboard

    Note over U, EXT: Ticket Listing Flow
    U->>FE: Create ticket listing
    FE->>API: POST /tickets
    API->>TS: Validate ticket data
    TS->>DB: Store ticket
    TS->>EXT: AI verification
    TS-->>API: Ticket created
    API-->>FE: Success response
    FE-->>U: Listing confirmation

    Note over U, EXT: Search & Discovery Flow
    U->>FE: Search tickets
    FE->>API: GET /tickets/search
    API->>TS: Query with filters
    TS->>DB: Optimized search
    TS-->>API: Results
    API-->>FE: Ticket listings
    FE-->>U: Search results
```

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript Frontend                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Pages      │ │ Components   │ │   Hooks      │            │
│  │              │ │              │ │              │            │
│  │ • Home       │ │ • EventCard  │ │ • useAuth    │            │
│  │ • EventMap   │ │ • TicketCard │ │ • useSocket  │            │
│  │ • Profile    │ │ • VenueMap   │ │ • useToast   │            │
│  │ • MyTickets  │ │ • SeatMap    │ │ • useAnalytics│           │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Contexts   │ │     Utils    │ │   Services   │            │
│  │              │ │              │ │              │            │
│  │ • Auth       │ │ • API Client │ │ • Analytics  │            │
│  │ • Atmosphere │ │ • Animations │ │ • Firebase   │            │
│  │ • Theme      │ │ • Validation │ │ • Socket     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Express.js + TypeScript Backend                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Routes     │ │ Controllers  │ │ Middleware   │            │
│  │              │ │              │ │              │            │
│  │ • /auth      │ │ • UserCtrl   │ │ • Auth       │            │
│  │ • /events    │ │ • EventCtrl  │ │ • Validation │            │
│  │ • /tickets   │ │ • TicketCtrl │ │ • Error      │            │
│  │ • /reviews   │ │ • ReviewCtrl │ │ • CORS       │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Services   │ │  WebSocket   │ │   Storage    │            │
│  │              │ │              │ │              │            │
│  │ • EventSvc   │ │ • Real-time  │ │ • Database   │            │
│  │ • TicketSvc  │ │ • Messaging  │ │ • Session    │            │
│  │ • UserSvc    │ │ • Notifications│ │ • File Store│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database with Drizzle ORM                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Users     │ │   Tickets    │ │   Reviews    │            │
│  │              │ │              │ │              │            │
│  │ • Profile    │ │ • Event Data │ │ • Ratings    │            │
│  │ • Auth       │ │ • Pricing    │ │ • Comments   │            │
│  │ • Social     │ │ • Location   │ │ • Feedback   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Contact    │ │ Ticket Views │ │   Sessions   │            │
│  │   Requests   │ │              │ │              │            │
│  │              │ │ • Analytics  │ │ • Auth State │            │
│  │ • P2P Comms  │ │ • Tracking   │ │ • Security   │            │
│  │ • Messaging  │ │ • Insights   │ │ • Persistence│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Google OAuth │ │ Google Maps  │ │   Stripe     │            │
│  │              │ │              │ │              │            │
│  │ • SSO Login  │ │ • Venues     │ │ • Payments   │            │
│  │ • Profile    │ │ • Geocoding  │ │ • Billing    │            │
│  │ • Security   │ │ • Directions │ │ • Refunds    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Firebase   │ │  WhatsApp    │ │  Instagram   │            │
│  │              │ │   Business   │ │              │            │
│  │ • Analytics  │ │              │ │ • Profile    │            │
│  │ • Monitoring │ │ • Messaging  │ │ • Verification│            │
│  │ • Crashlytics│ │ • Notifications│ │ • Social     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 How TicketBazaar Works

### For Ticket Sellers
1. **List Your Tickets**: Upload ticket details, set your price, choose transfer method
2. **Get Discovered**: Your listing appears in relevant searches with location and event filters
3. **Connect with Buyers**: Receive contact requests from interested buyers
4. **Negotiate Safely**: Use our platform's messaging system to discuss price and meetup
5. **Complete Transaction**: Meet in person, transfer digitally, or ship - your choice
6. **Build Reputation**: Receive ratings that help you sell faster in the future

### For Ticket Buyers
1. **Search Events**: Find tickets using smart filters (location, price, date, category)
2. **Browse Listings**: View detailed ticket information with seller profiles
3. **Send Contact Requests**: Connect with sellers through our secure messaging system
4. **Negotiate Terms**: Discuss pricing, meetup location, and transfer method
5. **Complete Purchase**: Meet seller and verify ticket authenticity
6. **Leave Reviews**: Rate your experience to help the community

## 🌟 Core Features

### 🎪 Intelligent Event Discovery
- **Smart Search Engine**: AI-powered search with natural language processing
- **Advanced Filtering**: Location radius, price range, date flexibility, event categories
- **Venue Integration**: Interactive Google Maps with venue details and directions
- **Real-time Availability**: Live updates on ticket quantities and pricing trends
- **Personalized Recommendations**: Algorithm-driven suggestions based on user preferences

### 🤝 Peer-to-Peer Marketplace
- **Zero Transaction Fees**: Direct buyer-seller connections without platform charges
- **Structured Communication**: Professional contact request system with buyer profiles
- **Flexible Negotiation**: Built-in offer/counter-offer system with price history
- **Multiple Transfer Methods**: In-person meetups, digital transfers, secure shipping
- **Location-Based Meetups**: Suggested safe public meeting locations

### 🛡️ Trust & Security System
- **Multi-Layer Verification**: Google OAuth + Instagram profile linking mandatory
- **Bilateral Rating System**: Both buyers and sellers rate each other after transactions
- **Profile Transparency**: View user history, ratings, and social media verification
- **Secure Communication**: All initial contact happens through platform messaging
- **Fraud Detection**: User behavior analytics and community reporting system

### 📱 Mobile-First Experience
- **Progressive Web App**: Fast, app-like experience that works offline
- **Touch-Optimized Interface**: Gesture navigation and mobile-friendly controls
- **Real-time Notifications**: WebSocket-powered instant updates
- **GPS Integration**: Find nearby events and optimal meetup locations
- **Low Bandwidth Optimized**: Efficient for Indian mobile data plans

## 🛠 Technology Stack & Architecture

### Frontend Architecture
```
React 18 + TypeScript + Vite
├── State Management: TanStack React Query + Context API
├── Styling: Tailwind CSS + Framer Motion + shadcn/ui
├── Routing: Wouter (lightweight React router)
├── Forms: React Hook Form + Zod validation
├── UI Components: Complete Radix UI ecosystem
├── Maps: @react-google-maps/api
├── Audio: Custom hover music system
├── SEO: React Helmet for meta management
└── Real-time: WebSocket client with reconnection
```

### Backend Architecture
```
Node.js 22 + Express + TypeScript + TSX
├── Database: PostgreSQL (NeonDB) + Drizzle ORM
├── Authentication: Passport.js (Local + Google OAuth ready)
├── Session Management: express-session + connect-pg-simple
├── WebSocket: ws library for real-time communication
├── File Upload: Multer for image handling
├── Validation: Zod schemas with drizzle-zod
├── Error Handling: Centralized error middleware
├── Search System: Intelligent search functionality
├── Payment Ready: Stripe + Razorpay integration
└── Testing: Jest with TypeScript support
```

### Database Schema Design
```
PostgreSQL Tables:
├── users (Profile, Auth, Social links)
├── tickets (Event data + Ticket listings)
├── contact_requests (P2P communication)
├── user_reviews (Rating & feedback system)
├── user_feedback (Platform feedback)
└── ticket_views (Analytics & tracking)
```

## 🏗️ Deep Technical Implementation

### Database Architecture & Relations

The platform uses a sophisticated PostgreSQL schema with Drizzle ORM that optimizes for peer-to-peer transactions:

#### Core Tables Structure
```sql
-- Users table with social verification
users {
  id: serial primary key
  email: varchar unique
  name: varchar
  profilePicture: text
  phone: varchar
  instagram: varchar           -- Instagram verification
  googleId: varchar           -- OAuth integration
  avgRating: numeric(3,2)     -- Calculated average rating
  totalRatings: integer       -- Rating count for credibility
  isPhoneVerified: boolean
  isInstagramVerified: boolean
  createdAt: timestamp
}

-- Tickets as event containers (no separate events table)
tickets {
  id: serial primary key
  sellerId: integer → users.id
  eventTitle: varchar         -- Event name
  eventDescription: text      -- Event details
  eventVenue: varchar         -- Venue name
  eventDate: timestamp        -- Event date/time
  eventCategory: varchar      -- Movies, Sports, Concerts, etc.
  eventCity: varchar          -- City location
  latitude: numeric           -- GPS coordinates
  longitude: numeric
  ticketType: varchar         -- VIP, General, etc.
  originalPrice: numeric      -- Face value
  sellingPrice: numeric       -- Seller's price
  quantity: integer           -- Available tickets
  transferMethod: varchar     -- InPerson, Digital, Mail
  additionalInfo: text        -- Seller notes
  isVerified: boolean         -- Platform verification
  verificationCode: varchar   -- QR code data
  qrCode: text               -- Base64 QR image
  status: varchar            -- Available, Sold, Expired
  trending: boolean          -- Algorithm flag
  sellingFast: boolean       -- Scarcity indicator
  createdAt: timestamp
}

-- P2P communication system
contact_requests {
  id: serial primary key
  ticketId: integer → tickets.id
  buyerId: integer → users.id
  sellerId: integer → users.id
  message: text              -- Buyer's initial message
  offerPrice: numeric        -- Buyer's offer
  status: varchar            -- Pending, Approved, Rejected
  buyerPhone: varchar        -- Shared after approval
  sellerResponse: text       -- Seller's reply
  createdAt: timestamp
  respondedAt: timestamp
}

-- Bilateral rating system
user_reviews {
  id: serial primary key
  contactRequestId: integer → contact_requests.id
  reviewerId: integer → users.id    -- Who wrote the review
  revieweeId: integer → users.id    -- Who is being reviewed
  rating: integer                   -- 1-5 stars
  comment: text                     -- Written feedback
  reviewType: varchar               -- Buyer, Seller
  createdAt: timestamp
}

-- Analytics and user behavior
ticket_views {
  id: serial primary key
  userId: integer → users.id
  ticketId: integer → tickets.id
  viewedAt: timestamp
  sessionDuration: integer
  deviceType: varchar
}
```

#### Advanced Query Optimizations
```sql
-- Indexes for performance
CREATE INDEX idx_tickets_city_category ON tickets(eventCity, eventCategory);
CREATE INDEX idx_tickets_date_status ON tickets(eventDate, status);
CREATE INDEX idx_contact_requests_status ON contact_requests(status, createdAt);
CREATE INDEX idx_user_reviews_reviewee ON user_reviews(revieweeId, rating);

-- Composite indexes for search
CREATE INDEX idx_tickets_search ON tickets USING GIN(
  to_tsvector('english', eventTitle || ' ' || eventDescription || ' ' || eventVenue)
);
```

### API Architecture & Data Flow

#### RESTful API Design
```typescript
// Core API Routes with detailed functionality

// Authentication & User Management
POST   /api/auth/register          // User registration with Google OAuth
POST   /api/auth/login             // Login with email/password or OAuth
POST   /api/auth/logout            // Secure session termination
GET    /api/auth/me                // Current user profile
PATCH  /api/users/profile          // Update profile information
PATCH  /api/users/instagram        // Link Instagram for verification
PATCH  /api/users/phone            // Add/verify phone number

// Event Discovery & Search
GET    /api/events                 // List all events with pagination
GET    /api/events/search          // Advanced search with filters
GET    /api/events/category/:cat   // Category-specific events
GET    /api/events/trending        // Algorithm-based trending events
GET    /api/events/nearby          // GPS-based location search
GET    /api/search/hints           // AI-powered search suggestions

// Ticket Management
POST   /api/tickets               // Create new ticket listing
GET    /api/tickets/:id           // Get specific ticket details
GET    /api/tickets/event/:title  // All tickets for specific event
GET    /api/tickets/my            // Seller's ticket listings
PATCH  /api/tickets/:id           // Update ticket information
DELETE /api/tickets/:id           // Remove ticket listing
POST   /api/tickets/:id/verify    // Verify ticket authenticity

// Peer-to-Peer Communication
POST   /api/contact-requests      // Send contact request to seller
GET    /api/contact-requests/sent // Buyer's sent requests
GET    /api/contact-requests/received // Seller's received requests
PATCH  /api/contact-requests/:id  // Approve/deny contact request
GET    /api/contact-requests/:id  // Get detailed request information
DELETE /api/contact-requests/:id  // Cancel contact request

// Review & Rating System
POST   /api/reviews               // Create user review after transaction
GET    /api/reviews/user/:userId  // Get reviews for specific user
GET    /api/reviews/by/:reviewerId // Reviews written by user
PATCH  /api/reviews/:id           // Update existing review
DELETE /api/reviews/:id           // Delete review (author only)
GET    /api/reviews/stats/:userId // Get user rating statistics

// Analytics & Insights
POST   /api/ticket-views          // Record ticket view for analytics
GET    /api/ticket-views/my       // User's viewing history
GET    /api/analytics/popular     // Popular events and tickets
GET    /api/analytics/trends      // Market trends and insights

// Data Privacy & GDPR Compliance
GET    /api/data-privacy/export/:userId   // Export all user data
DELETE /api/data-privacy/delete/:userId   // Delete all user data
GET    /api/data-privacy/policy           // Get privacy policy
POST   /api/data-privacy/consent          // Update consent preferences
```

#### Real-time WebSocket Events
```typescript
// WebSocket event system for instant communication
interface WebSocketEvents {
  // Contact request notifications
  'contact-request-received': {
    requestId: number;
    buyerName: string;
    ticketTitle: string;
    offerPrice: number;
  };
  
  // Response notifications
  'contact-request-approved': {
    requestId: number;
    sellerPhone: string;
    sellerName: string;
    meetupSuggestions: Location[];
  };
  
  // Real-time ticket updates
  'ticket-status-changed': {
    ticketId: number;
    newStatus: string;
    affectedUsers: number[];
  };
  
  // System notifications
  'new-review-received': {
    reviewId: number;
    rating: number;
    reviewerName: string;
  };
}
```

### Security Implementation

#### Multi-Layer Authentication
```typescript
// Passport.js strategy configuration
const GoogleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Auto-populate user profile from Google data
  const userData = {
    googleId: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
    profilePicture: profile.photos[0].value
  };
  
  const user = await storage.createOrUpdateUser(userData);
  return done(null, user);
});

// Session security configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new (require('connect-pg-simple')(session))({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions'
  }),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
```

#### Data Validation & Sanitization
```typescript
// Zod schemas for robust validation
export const ticketListingSchema = z.object({
  eventTitle: z.string().min(3).max(200),
  eventVenue: z.string().min(3).max(200),
  eventDate: z.string().datetime(),
  eventCategory: z.enum(['Movies', 'Sports', 'Concerts', 'Theater', 'Bus', 'Train', 'Flight']),
  originalPrice: z.number().positive().max(100000),
  sellingPrice: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(20),
  transferMethod: z.enum(['InPerson', 'Digital', 'Mail']),
  additionalInfo: z.string().max(1000).optional()
});

export const contactRequestSchema = z.object({
  ticketId: z.number().int().positive(),
  message: z.string().min(10).max(500),
  offerPrice: z.number().positive().optional(),
  buyerPhone: z.string().regex(/^[6-9]\d{9}$/) // Indian mobile format
});
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL 14 or higher (or use NeonDB cloud)
- Google OAuth credentials
- Google Maps API key

### Quick Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd ticketbazaar

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# Edit .env with your actual values:
# - DATABASE_URL (PostgreSQL connection string)
# - SESSION_SECRET (cryptographically secure key)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (OAuth)
# - VITE_GOOGLE_MAPS_API_KEY (for maps functionality)

# 4. Initialize database schema
npm run db:push

# 5. Start development server
npm run dev

# The app will be available at http://localhost:5000
```

### Environment Variables Setup

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ticketbazaar

# Session Security
SESSION_SECRET=your-super-secure-random-string-here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Maps API (Enable Maps JavaScript API)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional: Error Monitoring
HONEYBADGER_API_KEY=your-honeybadger-key

# Optional: AI Features


# Optional: Payment Integration
STRIPE_SECRET_KEY=your-stripe-secret-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## 📱 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server
npm run preview         # Preview production build locally

# Database Management
npm run db:push         # Push schema changes to database
npm run db:generate     # Generate migration files
npm run db:migrate      # Run pending migrations
npm run db:studio       # Open Drizzle Studio (database GUI)

# Testing & Quality
npm test                # Run Jest test suite
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run Playwright end-to-end tests
npm run typecheck       # TypeScript type checking
npm run lint            # ESLint code linting

# Database Seeding (Development)
tsx scripts/init-db.ts                    # Initialize database tables
tsx scripts/seed-users.ts                 # Create sample user accounts
tsx scripts/seed-realistic-events.ts      # Add realistic Indian events
tsx scripts/seed-tickets.ts               # Generate ticket listings
tsx scripts/fetch-events.ts               # Fetch events from external sources
```

### Development Database Setup

```bash
# Option 1: Local PostgreSQL
createdb ticketbazaar
psql ticketbazaar -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Option 2: Use NeonDB (Recommended)
# Sign up at https://neon.tech
# Create a database and copy the connection string to DATABASE_URL

# Initialize schema
npm run db:push

# Seed with sample data
tsx scripts/init-db.ts
tsx scripts/seed-realistic-events.ts
```

## 🧪 Testing Strategy

### Test Architecture
```
tests/
├── unit/                    # Unit tests for individual functions
│   ├── auth.test.ts        # Authentication logic
│   ├── validation.test.ts  # Zod schema validation
│   └── storage.test.ts     # Database operations
├── integration/            # API integration tests
│   ├── tickets.test.ts     # Ticket CRUD operations
│   ├── users.test.ts       # User management
│   └── reviews.test.ts     # Review system
├── e2e/                    # End-to-end tests
│   ├── user-journey.spec.ts # Complete user flows
│   ├── ticket-listing.spec.ts # Ticket creation/management
│   └── p2p-communication.spec.ts # Contact requests
└── fixtures/               # Test data and utilities
    ├── test-data.ts        # Sample data generators
    └── test-helpers.ts     # Common test utilities
```

### Running Tests
```bash
# Unit and integration tests
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report

# End-to-end tests
npm run test:e2e           # Run Playwright tests
npm run test:e2e:headed    # Run tests with browser UI
npm run test:e2e:debug     # Debug mode with inspector
```

## 🌐 Deployment

### Production Deployment on Replit

The project is optimized for Replit deployment with zero configuration:

1. **Import to Replit**: Fork or import the repository
2. **Set Environment Variables**: Add required secrets in Replit Secrets
3. **Deploy**: Click the Deploy button in Replit

### Manual Deployment

```bash
# Build for production
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your-production-db-url
export SESSION_SECRET=your-production-secret

# Start production server
npm start
```

### Environment-Specific Configurations

```typescript
// Production optimizations are automatically applied
const isProduction = process.env.NODE_ENV === 'production';

// Security enhancements
if (isProduction) {
  app.set('trust proxy', 1); // Trust reverse proxy
  app.use(helmet()); // Security headers
  app.use(compression()); // Gzip compression
}
```

## 🔧 Advanced Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### Google Maps API Setup
1. Enable Maps JavaScript API in Google Cloud Console
2. Create an API key
3. Restrict the key to your domains for security
4. Add to environment variables as `VITE_GOOGLE_MAPS_API_KEY`

### Database Optimization
```sql
-- Performance monitoring queries
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('users', 'tickets', 'contact_requests');

-- Index usage analysis
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow TypeScript strict mode and ESLint rules
2. **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
3. **Testing**: Write tests for new features and bug fixes
4. **Documentation**: Update README and code comments for significant changes

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm test && npm run test:e2e`)
5. Update documentation if needed
6. Commit with descriptive messages
7. Push to your fork and submit a pull request

### Code Review Checklist

- [ ] Code follows TypeScript and React best practices
- [ ] All tests pass and coverage is maintained
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Responsive design maintained
- [ ] Accessibility standards met

## 📋 Project Roadmap

### Phase 1: Core P2P Platform ✅
- User authentication and profiles
- Ticket listing and discovery
- Contact request system
- Basic review system

### Phase 2: Enhanced Trust & Safety (Current)
- Instagram verification integration
- Advanced fraud detection
- Dispute resolution system
- Comprehensive user analytics

### Phase 3: Market Expansion
- WhatsApp Business API integration
- Payment gateway integration (Stripe/Razorpay)
- Multi-language support
- Mobile app development

### Phase 4: Advanced Features
- AI-powered price recommendations
- Blockchain ticket verification
- Group buying functionality
- Event organizer partnerships

## 📞 Support & Community

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas
- **Security**: Report security vulnerabilities privately to security@ticketbazaar.com
- **Documentation**: Comprehensive docs available in `/docs` directory

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Indian event community**
