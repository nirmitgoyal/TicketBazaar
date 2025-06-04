# TicketBazaar - Peer-to-Peer Ticket Marketplace

A cutting-edge peer-to-peer ticket resale platform for the Indian market, enabling direct user connections and seamless event discovery across major metropolitan cities.

## 🌟 Project Overview

TicketBazaar revolutionizes ticket reselling in India by eliminating traditional intermediaries and enabling direct peer-to-peer transactions. The platform serves as a trusted marketplace where users can list, discover, and purchase tickets for events, movies, sports, and transportation across Indian cities.

### Key Innovations
- **Pure P2P Model**: No transaction fees - users connect directly
- **Social Verification**: Instagram-based profile verification system
- **Location Intelligence**: Google Maps integration with venue discovery
- **Real-time Communication**: WebSocket-powered instant messaging
- **Mobile-First Design**: Optimized for Indian mobile usage patterns
- **Multi-Modal Transport**: Support for buses, trains, flights, and events

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

## 🚀 Core Features

### 🎪 Event Discovery & Management
- **Smart Search**: AI-powered search with location-based filtering
- **Category Support**: Movies, Sports, Concerts, Bus/Train tickets
- **Venue Mapping**: Interactive Google Maps with seat visualization
- **Real-time Updates**: Live ticket availability and pricing
- **Trending Events**: Algorithm-driven popular event recommendations

### 👥 Peer-to-Peer Marketplace
- **Direct Connections**: Zero-fee peer-to-peer ticket transactions
- **Contact Requests**: Structured buyer-seller communication system
- **Price Negotiation**: Built-in offer and counter-offer mechanism
- **Meeting Coordination**: Location-based meetup suggestions
- **Transfer Methods**: Support for in-person, electronic, and mail transfers

### 🔒 Trust & Safety
- **Social Verification**: Mandatory Instagram profile linking
- **Rating System**: Bilateral user rating and review system
- **Identity Verification**: Google OAuth with social media validation
- **Secure Communication**: Platform-mediated initial contact
- **Fraud Prevention**: User behavior analytics and reporting

### 📱 Mobile-Optimized Experience
- **Responsive Design**: PWA-ready mobile-first interface
- **Touch Interactions**: Gesture-based navigation and controls
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time updates via WebSocket
- **Location Services**: GPS integration for nearby events

## 🛠 Technology Stack

### Frontend Architecture
```
React 18 + TypeScript
├── State Management: React Query + Context API
├── Styling: Tailwind CSS + Framer Motion
├── Routing: Wouter (lightweight React router)
├── Forms: React Hook Form + Zod validation
├── UI Components: Radix UI + shadcn/ui
├── Maps: @react-google-maps/api
├── Analytics: Firebase Analytics
└── Real-time: WebSocket client
```

### Backend Architecture
```
Node.js + Express + TypeScript
├── Database: PostgreSQL + Drizzle ORM
├── Authentication: Passport.js + Google OAuth
├── Session Management: express-session + connect-pg-simple
├── WebSocket: ws library for real-time communication
├── File Upload: Multer for image handling
├── Validation: Zod schemas throughout
├── Error Handling: Centralized error middleware
└── Testing: Jest + Supertest
```

### Database Schema
```
PostgreSQL Tables:
├── users (Profile, Auth, Social links)
├── tickets (Event data + Ticket listings)
├── contact_requests (P2P communication)
├── user_reviews (Rating & feedback system)
├── user_feedback (Platform feedback)
└── ticket_views (Analytics & tracking)
```

## 🌐 Data Flow Architecture

```
User Interaction Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │────│   React     │────│ React Query │
│             │    │ Components  │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Events │────│   Hooks     │────│ API Client  │
│ (clicks,    │    │ (useAuth,   │    │ (fetch      │
│  forms)     │    │  useSocket) │    │  wrapper)   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                    ┌─────────────┐
                                    │   Express   │
                                    │   Server    │
                                    └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
          ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
          │   Routes    │           │ Middleware  │           │ Controllers │
          │ (Express    │           │ (Auth,      │           │ (Business   │
          │  routing)   │           │ Validation) │           │  Logic)     │
          └─────────────┘           └─────────────┘           └─────────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                                    ┌─────────────┐
                                    │  Services   │
                                    │ (Data layer │
                                    │  interface) │
                                    └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
          ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
          │ PostgreSQL  │           │  WebSocket  │           │  External   │
          │  Database   │           │   Service   │           │    APIs     │
          │ (Drizzle    │           │ (Real-time  │           │ (Google,    │
          │   ORM)      │           │  messaging) │           │  Stripe)    │
          └─────────────┘           └─────────────┘           └─────────────┘
```

## 🎯 User Journey & Features

### 📱 Core User Flows

#### 1. **User Registration & Onboarding**
```
New User Journey:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │───▶│   Google    │───▶│  Complete   │
│    Page     │    │   OAuth     │    │   Profile   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Browse Mode │    │Auto Profile │    │ Instagram   │
│ (Anonymous) │    │ Population  │    │Verification │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                    ┌─────────────┐
                                    │   Ready to  │
                                    │ List/Browse │
                                    │   Tickets   │
                                    └─────────────┘
```

#### 2. **Ticket Listing Process**
```
Seller Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Select Event │───▶│Enter Ticket │───▶│Set Transfer │
│   Category  │    │  Details    │    │   Method    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Set Location │    │Upload Proof │    │ Publish &   │
│  & Venue    │    │(Optional)   │    │Go Live      │
└─────────────┘    └─────────────┘    └─────────────┘
```

#### 3. **Ticket Discovery & Purchase**
```
Buyer Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Search    │───▶│ Filter by   │───▶│  Browse     │
│   Events    │    │Location/    │    │  Results    │
│             │    │Date/Price   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Select Ticket│───▶│Send Contact │───▶│ Negotiate & │
│ & View      │    │  Request    │    │   Meet      │
│ Details     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

#### 4. **Peer-to-Peer Communication**
```
P2P Communication Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Buyer Sends  │───▶│Seller Gets  │───▶│ Seller      │
│Contact      │    │Notification │    │ Reviews &   │
│Request      │    │             │    │ Responds    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Direct Chat  │───▶│Arrange      │───▶│Complete     │
│Opens via    │    │Meeting/     │    │Transaction &│
│WhatsApp/    │    │Transfer     │    │Leave Review │
│Phone        │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🏛️ Detailed Project Structure

### Frontend Component Architecture
```
client/src/
├── components/
│   ├── ui/                          # Base UI components (shadcn/ui)
│   │   ├── button.tsx              # Customizable button component
│   │   ├── input.tsx               # Form input with validation
│   │   ├── card.tsx                # Content container component
│   │   ├── dialog.tsx              # Modal dialog system
│   │   └── toast.tsx               # Notification system
│   │
│   ├── ticket-card.tsx             # Individual ticket display
│   ├── event-card.tsx              # Event information layout
│   ├── venue-map.tsx               # Google Maps integration
│   ├── ticket-heatmap.tsx          # Seat availability visualization
│   ├── seller-contact-card.tsx     # Seller profile information
│   ├── search-bar.tsx              # Intelligent search interface
│   ├── filter-dropdown.tsx         # Advanced filtering options
│   ├── real-time-notifications.tsx # WebSocket notifications
│   ├── social-share.tsx            # Social media sharing
│   └── mobile-nav.tsx              # Mobile navigation menu
│
├── pages/
│   ├── home.tsx                    # Main marketplace dashboard
│   ├── event-details.tsx           # Detailed event information
│   ├── event-map.tsx               # Map-based event discovery
│   ├── list-ticket.tsx             # Ticket creation form
│   ├── my-tickets.tsx              # User's ticket management
│   ├── profile.tsx                 # User profile & settings
│   ├── complete-profile.tsx        # Profile completion flow
│   ├── ticket-verification.tsx     # Ticket validation page
│   ├── login.tsx                   # Authentication page
│   ├── register.tsx                # User registration
│   ├── privacy-policy.tsx          # Privacy policy page
│   └── terms-of-service.tsx        # Terms of service
│
├── hooks/
│   ├── use-auth.tsx                # Authentication state management
│   ├── use-websocket.tsx           # Real-time communication
│   ├── use-search-hints.ts         # AI-powered search suggestions
│   ├── use-ticket-view.ts          # User analytics tracking
│   ├── use-mobile.tsx              # Mobile device detection
│   ├── use-analytics.tsx           # Firebase analytics
│   └── use-error-handler.ts        # Global error handling
│
├── contexts/
│   ├── AtmosphereContext.tsx       # Event atmosphere & theming
│   └── AuthContext.tsx             # User authentication state
│
├── lib/
│   ├── api.ts                      # HTTP client configuration
│   ├── animations.ts               # Framer Motion animation presets
│   ├── queryClient.ts              # React Query configuration
│   ├── utils.ts                    # Utility functions
│   ├── socket-fix.ts               # WebSocket connection utilities
│   ├── firebase.ts                 # Firebase configuration
│   └── protected-route.tsx         # Route protection component
│
└── assets/
    ├── instagram-logo.png          # Brand assets
    └── ticket-icon.svg             # Application icons
```

### Backend Service Architecture
```
server/
├── routes/
│   ├── auth.routes.ts              # Authentication endpoints
│   ├── event.routes.ts             # Event management API
│   ├── ticket.routes.ts            # Ticket CRUD operations
│   ├── review.routes.ts            # Rating & review system
│   ├── contact-requests.ts         # P2P communication endpoints
│   ├── search-hints.ts             # AI search suggestion API
│   ├── data-privacy.ts             # GDPR compliance endpoints
│   ├── ticket-views.ts             # Analytics tracking
│   └── recommendations.ts          # Event recommendation engine
│
├── controllers/
│   ├── base.controller.ts          # Base controller with common methods
│   ├── user.controller.ts          # User management operations
│   ├── event.controller.ts         # Event business logic
│   ├── ticket.controller.ts        # Ticket operations & validation
│   └── review.controller.ts        # Review system management
│
├── services/
│   ├── event.service.ts            # Event data processing
│   ├── ticket.service.ts           # Ticket business rules
│   ├── user.service.ts             # User profile management
│   ├── websocket.service.ts        # Real-time messaging service
│   ├── ai-search-hints.service.ts  # AI-powered search
│   └── error.service.ts            # Error handling service
│
├── middleware/
│   ├── auth.middleware.ts          # Authentication verification
│   ├── validation.middleware.ts    # Request validation with Zod
│   └── error.middleware.ts         # Global error handling
│
├── auth.ts                         # Passport.js configuration
├── storage.ts                      # Database abstraction layer
├── db.ts                           # Database connection
├── event-fetcher.ts                # External event data fetching
└── vite.ts                         # Development server setup
```

## 📊 Database Schema Deep Dive

### Core Tables Structure
```sql
-- Users table with social verification
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,                    -- WhatsApp for direct contact
    instagram TEXT NOT NULL,          -- Mandatory for verification
    google_id TEXT UNIQUE,
    rating DOUBLE PRECISION DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    preferred_contact_method TEXT DEFAULT 'whatsapp'
);

-- Tickets with embedded event data (P2P model)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    
    -- Embedded event information
    event_title TEXT NOT NULL,
    event_description TEXT,
    venue TEXT NOT NULL,
    venue_address TEXT,
    event_date TIMESTAMP NOT NULL,
    category TEXT NOT NULL,           -- movies, sports, events, buses
    event_image_url TEXT,
    trending BOOLEAN DEFAULT FALSE,
    selling_fast BOOLEAN DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city TEXT,
    
    -- Ticket specifics
    section TEXT NOT NULL,
    row TEXT,
    seat TEXT,
    price DOUBLE PRECISION NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'available',  -- available, contacted, sold, expired
    is_transferrable BOOLEAN DEFAULT TRUE,
    transfer_method TEXT NOT NULL,    -- in-person, electronic, mail
    additional_info TEXT,
    show_contact_info BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Contact requests for P2P communication
CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',    -- pending, approved, denied, completed
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,
    contact_method TEXT NOT NULL,     -- whatsapp, phone, email, instagram
    message TEXT NOT NULL,
    offered_price DOUBLE PRECISION,
    meeting_location TEXT,
    preferred_time TEXT
);

-- User reviews based on contact requests
CREATE TABLE user_reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    contact_request_id INTEGER,
    rating INTEGER NOT NULL,          -- 1-5 scale
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User feedback for platform improvement
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ticket_id INTEGER,
    feedback_type TEXT NOT NULL,      -- positive, negative, suggestion, report
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',    -- pending, reviewed, addressed
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Ticket view analytics
CREATE TABLE ticket_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    ticket_id INTEGER NOT NULL,
    viewed_at TIMESTAMP DEFAULT NOW(),
    source TEXT,                      -- search, map, direct, recommendation
    user_agent TEXT
);
```

## 🔄 API Documentation

### Authentication Endpoints
```typescript
// Auth Routes - Secure user authentication and profile management
POST   /api/auth/register       // User registration with validation
POST   /api/auth/login          // Email/password authentication
GET    /api/auth/google         // Google OAuth initiation
GET    /api/auth/google/callback // OAuth callback handling
POST   /api/auth/logout         // Secure user logout
GET    /api/auth/user          // Get current authenticated user
PATCH  /api/auth/profile       // Update user profile information
```

### Event & Ticket Management
```typescript
// Event Routes - Event discovery and management
GET    /api/events             // List all events with pagination
GET    /api/events/:id         // Get specific event details
GET    /api/events/search      // Advanced search with filters
GET    /api/events/trending    // Get trending events by region
GET    /api/events/categories  // Get available event categories
GET    /api/events/nearby      // Location-based event discovery

// Ticket Routes - Comprehensive ticket management
GET    /api/tickets            // List tickets with advanced filtering
POST   /api/tickets            // Create new ticket listing
GET    /api/tickets/:id        // Get detailed ticket information
PATCH  /api/tickets/:id        // Update ticket (seller authorization)
DELETE /api/tickets/:id        // Delete ticket (seller authorization)
GET    /api/tickets/my         // Get user's active tickets
GET    /api/tickets/sold       // Get user's sold tickets
GET    /api/tickets/event/:eventId // Get all tickets for event
POST   /api/tickets/:id/verify // Verify ticket authenticity
```

### Peer-to-Peer Communication System
```typescript
// Contact Request Routes - Facilitate buyer-seller communication
POST   /api/contact-requests           // Send contact request with message
GET    /api/contact-requests/sent      // User's outgoing requests
GET    /api/contact-requests/received  // User's incoming requests
PATCH  /api/contact-requests/:id       // Approve/deny contact request
GET    /api/contact-requests/:id       // Get detailed request information
DELETE /api/contact-requests/:id       // Cancel contact request

// Review Routes - User rating and feedback system
POST   /api/reviews                    // Create user review after transaction
GET    /api/reviews/user/:userId       // Get reviews for specific user
GET    /api/reviews/by/:reviewerId     // Reviews written by user
PATCH  /api/reviews/:id                // Update existing review
DELETE /api/reviews/:id                // Delete review (author only)
GET    /api/reviews/stats/:userId      // Get user rating statistics
```

### Analytics & Data Privacy
```typescript
// Analytics Routes - User behavior tracking
POST   /api/ticket-views              // Record ticket view for analytics
GET    /api/ticket-views/my           // User's viewing history
GET    /api/analytics/popular         // Popular events and tickets
GET    /api/search/hints              // AI-powered search suggestions

// Data Privacy Routes - GDPR compliance
GET    /api/data-privacy/export/:userId    // Export all user data
DELETE /api/data-privacy/delete/:userId    // Delete all user data
GET    /api/data-privacy/policy            // Get privacy policy
POST   /api/data-privacy/consent           // Update consent preferences
```

### Real-time WebSocket Events
```typescript
// WebSocket Event Types for real-time communication
interface WebSocketEvents {
  // Contact and messaging events
  'contact_request_received': {
    requestId: number;
    fromUser: User;
    ticketId: number;
    message: string;
  };
  
  'contact_request_responded': {
    requestId: number;
    status: 'approved' | 'denied';
    sellerContact?: ContactInfo;
  };
  
  // Ticket status updates
  'ticket_sold': {
    ticketId: number;
    sellerId: number;
    eventTitle: string;
  };
  
  'ticket_updated': {
    ticketId: number;
    changes: Partial<Ticket>;
  };
  
  // User presence and activity
  'user_online': { userId: number };
  'user_offline': { userId: number };
  'typing_indicator': {
    userId: number;
    contactRequestId: number;
  };
  
  // System notifications
  'system_maintenance': {
    message: string;
    scheduledTime: Date;
  };
}
```

## 🌐 Deployment & Infrastructure

### Production Environment Setup
```bash
# Essential Production Environment Variables
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-cryptographically-secure-session-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# External Service Integration
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Payment Processing (Optional - Pure P2P model doesn't require payment processing)
# STRIPE_PUBLIC_KEY=pk_live_your-stripe-public-key
# STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key

# Firebase Analytics & Monitoring
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# WhatsApp Business Integration (Optional)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-business-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-whatsapp-business-account-id
```

## 🌐 Heroku Deployment

### Prerequisites

1. Heroku CLI installed
2. Git repository initialized
3. Heroku account

### Deployment Steps

1. **Create Heroku App**

   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL Database**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
   heroku config:set GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Optional: Only needed if implementing future payment features
   # heroku config:set STRIPE_PUBLIC_KEY=your_stripe_public_key
   # heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Deploy**

   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Initialize Database**
   ```bash
   heroku run npm run db:push
   ```

### Required Environment Variables

| Variable               | Description                                            | Required |
| ---------------------- | ------------------------------------------------------ | -------- |
| `DATABASE_URL`         | PostgreSQL connection string (auto-provided by Heroku) | Yes      |
| `SESSION_SECRET`       | Secret for session management                          | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                                 | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                             | Yes      |
| `STRIPE_PUBLIC_KEY`    | Stripe publishable key (P2P model - optional)         | No       |
| `STRIPE_SECRET_KEY`    | Stripe secret key (P2P model - optional)              | No       |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key                                    | Yes      |

### Optional API Keys (Future Features)

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `WHATSAPP_ACCESS_TOKEN`        | WhatsApp Business API token  |
| `WHATSAPP_PHONE_NUMBER_ID`     | WhatsApp phone number ID     |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp business account ID |

## 🧪 Testing & Quality Assurance

### Testing Strategy
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests

# Pre-deployment health checks
npm run health-check
```

### Test Coverage Areas
```
├── Unit Tests (Jest + Testing Library)
│   ├── Component rendering and behavior
│   ├── Hook functionality and state management
│   ├── Utility function validation
│   ├── API client error handling
│   └── Form validation logic
│
├── Integration Tests (Supertest)
│   ├── Authentication flow end-to-end
│   ├── Database operations and migrations
│   ├── API endpoint functionality
│   ├── WebSocket connection handling
│   └── External service integration
│
├── End-to-End Tests (Puppeteer)
│   ├── Complete user registration journey
│   ├── Ticket listing and discovery flow
│   ├── P2P communication process
│   ├── Mobile responsiveness validation
│   └── Performance benchmarking
│
└── Security Tests
    ├── Input validation and sanitization
    ├── Authentication bypass attempts
    ├── SQL injection prevention
    ├── XSS attack protection
    └── Rate limiting effectiveness
```

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Git

### Step-by-Step Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd ticketbazaar

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL for PostgreSQL connection
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# - GOOGLE_MAPS_API_KEY
# - SESSION_SECRET

# 4. Initialize database
npm run db:push

# 5. Seed sample data (optional)
npm run seed:realistic-events

# 6. Start development server
npm run dev
```

### Development Scripts
```bash
# Core development commands
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database management
npm run db:push         # Push schema changes
npm run db:studio       # Open Drizzle Studio
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data

# Code quality
npm run lint            # ESLint checking
npm run format          # Prettier formatting
npm run type-check      # TypeScript validation

# Testing
npm run test            # Run all tests
npm run test:watch      # Watch mode testing
npm run test:coverage   # Coverage reports
```

## 🔒 Security & Privacy Features

### Authentication Security
- **Google OAuth 2.0**: Secure single sign-on integration
- **Session Management**: Encrypted session storage with PostgreSQL
- **Password Security**: Bcrypt hashing with salt rounds
- **Rate Limiting**: API endpoint protection against abuse
- **CSRF Protection**: Cross-site request forgery prevention

### Data Protection
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: Content sanitization and CSP headers
- **HTTPS Enforcement**: TLS encryption for all communications
- **Environment Security**: Sensitive data in environment variables

### Privacy Compliance
- **GDPR Compliance**: User data export and deletion capabilities
- **Consent Management**: Granular permission controls
- **Data Minimization**: Only collect necessary user information
- **Audit Logging**: Track data access and modifications
- **Anonymization**: Option to browse without registration

## 📱 Mobile & Progressive Web App

### Mobile Optimizations
- **Responsive Design**: Tailwind CSS breakpoints for all devices
- **Touch Interface**: Gesture-based navigation and interactions
- **Performance**: Optimized bundle size and lazy loading
- **Offline Support**: Service worker for basic offline functionality
- **Push Notifications**: Real-time updates via WebSocket

### PWA Features
```json
// manifest.json configuration
{
  "name": "TicketBazaar",
  "short_name": "TicketBazaar",
  "description": "P2P Ticket Marketplace for India",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🚀 Performance & Monitoring

### Performance Optimizations
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for non-critical components
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: React Query for data caching
- **Bundle Analysis**: Webpack bundle analyzer integration

### Monitoring & Analytics
```typescript
// Firebase Analytics integration
interface AnalyticsEvents {
  'ticket_listed': { category: string; price: number; city: string };
  'search_performed': { query: string; filters: object };
  'contact_request_sent': { ticketId: number; method: string };
  'user_registration': { method: 'google' | 'email' };
  'page_view': { page: string; duration: number };
}

// Performance monitoring
const performanceMetrics = {
  pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
  timeToFirstByte: performance.timing.responseStart - performance.timing.requestStart,
  domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
};
```

### Database Performance
```sql
-- Optimized indexes for common queries
CREATE INDEX CONCURRENTLY idx_tickets_search ON tickets 
USING GIN (to_tsvector('english', event_title || ' ' || venue || ' ' || city));

CREATE INDEX CONCURRENTLY idx_tickets_location ON tickets (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_tickets_date_category ON tickets (event_date, category)
WHERE status = 'available';

CREATE INDEX CONCURRENTLY idx_contact_requests_active ON contact_requests (seller_id, status)
WHERE status IN ('pending', 'approved');
```

## 🛠 Troubleshooting & Common Issues

### Development Issues

#### Google Maps Not Loading
```bash
# Check API key configuration
echo $GOOGLE_MAPS_API_KEY

# Verify API key has required permissions:
# - Maps JavaScript API
# - Geocoding API
# - Places API
```

#### Database Connection Issues
```bash
# Check PostgreSQL connection
npm run db:check

# Reset database if corrupted
npm run db:reset
npm run db:push
npm run seed:realistic-events
```

#### WebSocket Connection Problems
```javascript
// Check WebSocket connection in browser console
const ws = new WebSocket('ws://localhost:5000');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

### Production Issues

#### Performance Monitoring
```bash
# Check server health
curl -f http://your-app.herokuapp.com/api/health

# Monitor database performance
heroku pg:info
heroku pg:diagnose
```

#### Error Tracking
```bash
# View application logs
heroku logs --tail

# Check specific error patterns
heroku logs --grep="ERROR"
```

### Common Error Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `GOOGLE_MAPS_API_KEY not found` | Missing API key | Add key to environment variables |
| `Session store disconnected` | Database connection issue | Check DATABASE_URL configuration |
| `OAuth callback error` | Incorrect redirect URI | Update Google OAuth settings |
| `WebSocket connection failed` | Port configuration | Verify PORT environment variable |
| `Database migration failed` | Schema conflicts | Run `npm run db:reset` |

## 📊 Development Metrics & KPIs

### User Engagement Metrics
- **Daily Active Users (DAU)**: User login and activity tracking
- **Conversion Rate**: Browse to contact request ratio
- **Transaction Success**: Contact to completion rate
- **User Retention**: 7-day and 30-day return rates
- **Platform Growth**: New user registration trends

### Technical Performance KPIs
- **API Response Time**: Average < 200ms for critical endpoints
- **Database Query Performance**: 95th percentile < 500ms
- **WebSocket Connection Uptime**: > 99.5% availability
- **Error Rate**: < 0.1% for user-facing operations
- **Mobile Performance Score**: Lighthouse score > 90

## 🤝 Contributing Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive typing
- **ESLint + Prettier**: Automated code formatting and linting
- **Conventional Commits**: Structured commit message format
- **Branch Protection**: Required PR reviews and status checks

### Pull Request Process
1. Fork repository and create feature branch
2. Implement changes with comprehensive tests
3. Update documentation for new features
4. Ensure all CI checks pass
5. Submit PR with detailed description

## 📄 License & Legal

**MIT License** - Open source project with commercial use permitted

### Third-Party Licenses
- React: MIT License
- Google Maps API: Commercial license required
- Stripe: Commercial terms of service
- Firebase: Google Cloud Platform terms

---

**Built with ❤️ for the Indian market** | **Last Updated**: June 2025
