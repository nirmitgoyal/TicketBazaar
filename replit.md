# TicketBazaar - P2P Ticket Marketplace

## Overview

TicketBazaar is a comprehensive peer-to-peer ticket marketplace platform designed specifically for the Indian market. The application enables direct transactions between buyers and sellers without platform transaction fees, focusing on trust-building through social verification and geographic intelligence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with optimized code splitting and lazy loading
- **Mobile-First**: Progressive Web App (PWA) capabilities with touch-optimized interfaces

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js framework
- **Language**: TypeScript throughout the stack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **Session Storage**: Memory store for development, configurable for production
- **Real-time**: WebSocket integration for live notifications

### Database Design
- **ORM**: Drizzle with typed schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Caching**: In-memory caching with TTL for performance optimization
- **Optimization**: Advanced query builders and batch processing utilities

## Key Components

### Authentication & Security
- **Multi-factor Authentication**: Email/phone verification with optional Instagram linking
- **Session Management**: Secure session handling with configurable cookie settings
- **Rate Limiting**: Comprehensive rate limiting across all endpoints
- **Fraud Detection**: AI-powered verification and risk assessment
- **Input Validation**: Zod schema validation for type safety

### Ticket Management
- **P2P Listings**: Direct seller-to-buyer ticket listings with embedded event information
- **Geographic Intelligence**: Google Maps integration with venue discovery
- **Social Verification**: Instagram profile linking for trust building
- **Smart Search**: Advanced filtering with autocomplete and trend analysis
- **Popularity Tracking**: Real-time metrics and trending indicators

### Communication System
- **Contact Requests**: Structured buyer-seller communication
- **WhatsApp Integration**: Direct messaging capabilities
- **Email Notifications**: SendGrid integration for transactional emails
- **Real-time Updates**: WebSocket notifications for instant updates

### Performance Infrastructure
- **Error Boundaries**: Comprehensive error recovery at component and route levels
- **Performance Monitoring**: Core Web Vitals tracking and memory leak detection
- **Virtual Rendering**: Efficient handling of large datasets (10,000+ items)
- **Lazy Loading**: Optimized image loading with blur placeholders
- **Advanced Caching**: Multi-level caching with intelligent TTL management

## Data Flow

### User Journey
1. **Registration/Authentication**: User creates account with email/phone verification
2. **Profile Setup**: Optional Instagram linking for social verification
3. **Ticket Browsing**: Search and filter tickets with geographic and category preferences
4. **Communication**: Contact sellers through structured request system
5. **Transaction**: Direct P2P negotiation and exchange

### Data Processing
1. **Ticket Creation**: Sellers create listings with event details and pricing
2. **Search & Discovery**: Advanced indexing and caching for fast retrieval
3. **Fraud Detection**: AI-powered risk assessment and verification
4. **Analytics**: Popularity metrics and trending calculations
5. **Cleanup**: Automated cleanup of expired tickets and data

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage
- **Google Maps API**: Geographic services and venue discovery
- **SendGrid**: Email delivery service

### Optional Integrations
- **Google OAuth**: Social login capabilities
- **Instagram API**: Profile verification features
- **WhatsApp Business API**: Direct messaging
- **Honeybadger**: Error tracking and monitoring
- **Firebase**: Analytics and performance monitoring

### Development Tools
- **Playwright**: End-to-end testing framework
- **Jest**: Unit testing with TypeScript support
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Studio**: Database management interface

## Deployment Strategy

### Build Process
- **Client Build**: Vite optimization with manual chunking for vendor libraries
- **Server Build**: ESBuild compilation to single distribution file
- **Asset Management**: Static file serving with cache control headers
- **Environment Validation**: Zod-based environment variable validation

### Production Configuration
- **Heroku Deployment**: Configured with PostgreSQL addon
- **SSL/TLS**: Secure connections with proper certificate handling
- **Session Security**: Production-ready session configuration
- **Rate Limiting**: Production-grade rate limiting with memory store
- **Error Handling**: Comprehensive error tracking and recovery

### Scaling Considerations
- **Database Optimization**: Indexed queries and connection pooling
- **Caching Strategy**: Multi-level caching with TTL management
- **WebSocket Scaling**: Horizontal scaling support for real-time features
- **CDN Integration**: Static asset delivery optimization

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Updated footer with improved text alignment and GSTIN number (092500308978TRN) for public compliance display
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```