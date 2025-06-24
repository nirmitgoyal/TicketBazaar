# TicketBazaar - P2P Ticket Marketplace

## Overview

TicketBazaar is a comprehensive peer-to-peer ticket marketplace platform built for the Indian market. It facilitates direct buyer-seller connections for event tickets while ensuring security, trust, and fair pricing. The platform eliminates middleman fees and provides advanced verification, fraud detection, and real-time communication features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite with advanced optimization and code splitting
- **Mobile-First**: Progressive Web App (PWA) with touch optimizations

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Session Management**: Express-session with memory store for development
- **Real-time Communication**: WebSocket server for instant messaging
- **API Design**: RESTful APIs with comprehensive rate limiting

### Security Infrastructure
- **Rate Limiting**: Multi-tiered rate limiting per endpoint type
- **Fraud Detection**: AI-powered verification and risk assessment
- **Input Validation**: Zod schemas for type-safe validation
- **Session Security**: Secure session management with CSRF protection
- **Error Handling**: Honeybadger integration for production monitoring

## Key Components

### User Management
- Multi-level user verification (email, phone, government ID, Instagram)
- Trust scoring system with response time tracking
- Country-specific localization (timezone, language, currency)
- Privacy controls with GDPR-compliant data export/deletion

### Ticket Management
- Embedded event information in ticket listings (P2P model)
- Category-based organization (Concert, Sports, Theater, etc.)
- Advanced search with location-based filtering
- Real-time popularity tracking and trending indicators
- Image upload support with compression and optimization

### Communication System
- Contact request workflow with anti-spam protection
- WebSocket-powered real-time messaging
- WhatsApp integration for direct seller contact
- Email notifications via SendGrid
- Meeting location suggestions with Google Maps integration

### Geographic Features
- Google Maps API integration for venue discovery
- Multi-city support across India
- Location-based search with bounding box filtering
- Venue autocomplete and address validation

## Data Flow

### Ticket Creation Flow
1. User authentication validation
2. Ticket data validation with Zod schemas
3. Image upload and optimization (if provided)
4. Database insertion with automatic timestamp
5. Cache invalidation for related searches
6. Real-time notification to interested users

### Search and Discovery Flow
1. Query parsing and validation
2. Cache lookup for recent search results (2-minute TTL)
3. Database query with optimized filters and pagination
4. Result enrichment with popularity metrics
5. Response caching for identical future queries

### Contact Request Flow
1. Fraud detection assessment
2. Rate limiting based on user verification level
3. Contact request creation in database
4. Email notification to seller via SendGrid
5. Real-time WebSocket notification
6. Response tracking for trust score calculation

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage
- **Google Maps API**: Location services and venue discovery
- **SendGrid**: Email delivery service

### Optional Integrations
- **Google OAuth**: Social authentication
- **Instagram API**: Profile verification
- **Honeybadger**: Error monitoring and alerting
- **WhatsApp Business API**: Direct messaging
- **Firebase**: Analytics and additional features

### Development Dependencies
- **Playwright**: End-to-end testing framework
- **Jest**: Unit testing framework
- **ESBuild**: Production bundling
- **Drizzle Kit**: Database migration management

## Deployment Strategy

### Development Environment
- Replit-optimized with hot module replacement
- PostgreSQL 16 with automatic provisioning
- Environment variable management via `.env` files
- Vite development server with API proxy

### Production Deployment
- Multi-platform support (Heroku, Railway, custom VPS)
- Automated build process with `deploy.sh` script
- Database migration handling
- Static asset optimization and CDN integration
- Health check endpoints and monitoring

### Environment Configuration
- Comprehensive environment validation
- Fallback values for optional services
- Security-first configuration with mandatory secrets
- Multi-stage deployment with staging environment support

## Changelog

- June 24, 2025: PostgreSQL 17.4 compatibility optimization completed
  - Updated database connection pool for PostgreSQL 17.4 performance
  - Implemented optimized full-text search with websearch_to_tsquery
  - Created PostgreSQL 17.4 specific indexes and functions
  - Enhanced popularity tracking with bulk update operations
  - Added materialized views for analytics performance
  - Verified 100% compatibility with PostgreSQL 17.4 features
- June 24, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.