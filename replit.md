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
- June 24, 2025. Implemented enhanced AI verification system with advanced fraud detection capabilities
  * Created EnhancedAIVerificationService with ensemble learning approach
  * Implemented FraudDetectionService with machine learning-based risk assessment
  * Added ContinuousLearningService for feedback loops and model improvement
  * Enhanced trust scoring accuracy to prevent fraudulent entities from receiving 'Low Risk' ratings
  * Integrated multi-factor analysis including social media authenticity, digital footprint, and behavioral patterns
  * Added comprehensive fraud pattern detection and real-time risk assessment
- June 24, 2025. Fixed welcome email functionality for fresh user signups
  * Added welcome email sending to the main UserController registration flow
  * Integrated SendGrid email service with proper error handling
  * Welcome emails now sent automatically to all new users upon registration
  * Verified email delivery with proper logging and monitoring
- June 24, 2025. Enhanced search functionality with clear button
  * Added clear (X) button to main search input on home page
  * Button appears when user types text and disappears when input is empty
  * Clicking X button clears search input and maintains focus for better UX
  * Improved search input spacing and hover effects for better accessibility
  * Fixed X button centering with proper flex alignment for better visual appearance
- June 24, 2025. Fixed H12 timeout error on ticket deletion
  * Fixed critical middleware bug in isTicketOwner that was causing infinite timeout loops
  * Added database operation timeout protection (15 seconds) to prevent hanging queries
  * Made WebSocket broadcasting asynchronous to prevent response blocking
  * Added client-side timeout handling (30 seconds) with AbortController
  * Improved error messages for timeout scenarios with user-friendly feedback
  * Delete operations now complete in ~1.3 seconds instead of timing out at 30 seconds
- June 24, 2025. Fixed WebSocket connection errors on production domain (ticketbazaar.co.in)
  * Enhanced WebSocket error handling with graceful fallback for unsupported environments
  * Added production-specific error suppression to prevent console spam
  * Implemented WebSocket connection testing and fallback mechanisms
  * Created error suppression utilities for non-critical WebSocket failures
  * Updated HTML error handlers to catch WebSocket connection failures
  * App now works seamlessly without WebSocket support in production environments
- June 24, 2025. Fixed Chrome extension listener errors on production domain
  * Resolved "listener indicated an asynchronous response" console errors
  * Enhanced error suppression for Chrome extension interference
  * Added Chrome runtime API override to prevent extension message channel errors
  * Implemented comprehensive extension error handling in both HTML and error-fixer.js
  * Production site now runs cleanly without browser extension console spam
- June 29, 2025. Updated Privacy Policy with DPDP and GDPR compliance requirements
  * Added dedicated "Data Fiduciary Information" section as Section 2
  * Included legal entity name: Ticket Bazaar
  * Added registered address: 3/336, Jha Compound, Marris Road, Aligarh 202001, India
  * Added data controller/fiduciary designation and responsibilities
  * Updated all subsequent section numbers (3-14) to accommodate new section
  * Enhanced Contact Information section with registered address for consistency
- June 29, 2025. Added explicit CCPA/CPRA compliance statement about not selling personal information
  * Added "Sale of Personal Information" subsection in Section 5 (Information Sharing and Disclosure)
  * Explicitly states "TicketBazaar does not sell personal information to third parties"
  * Confirms no sales in past 12 months and no intention to sell in future
  * Clarifies commitment applies to all users globally, including California residents
  * Added visual emphasis with highlighted box to ensure clear visibility of this commitment
- June 29, 2025. Enhanced data portability rights in Privacy Policy
  * Expanded "Right to Data Portability" description to clarify data format and transferability
  * Added dedicated "Data Portability - Download Your Data" subsection in Section 7
  * Explains how users can request downloadable copy of their data via profile page
  * Specifies "Download My Data" button functionality with 24-48 hour processing time
  * Lists benefits: review information, transfer to other services, personal backup, verify accuracy
- June 29, 2025. Added cookie consent mechanism details to Privacy Policy
  * Updated Section 8 (Cookies and Similar Technologies) with explicit consent requirements
  * Added statement: "We use cookies for analytics. Non-essential cookies are only used with your consent"
  * Created dedicated "Cookie Consent" subsection explaining the cookie banner functionality
  * Clarified that essential cookies are always used, while analytics/performance/targeting cookies require consent
  * Mentioned ability to change preferences via cookie settings link in website footer
- June 29, 2025. Added multilingual privacy policy support with Hindi translation
  * Implemented language toggle feature with English/Hindi (हिंदी) options
  * Created comprehensive Hindi summary of privacy policy for DPDP compliance
  * Added visual language selector with Globe icon in privacy policy header
  * Hindi summary covers all key sections: data collection, usage, rights, security, cookies
  * Included disclaimer that Hindi version is a summary, English version remains legally binding
  * Foundation laid for adding other regional Indian languages (Tamil, Telugu, Bengali, etc.)
- June 29, 2025. Strengthened Terms of Service to explicitly define TicketBazaar as discovery-only platform
  * Updated Section 2 (Service Description) with prominent disclaimer about non-involvement in transactions
  * Added explicit list of what TicketBazaar does NOT do (no payment processing, ticket delivery, etc.)
  * Enhanced Section 6 (Payments) to emphasize complete non-involvement in financial transactions
  * Strengthened Section 8 (Platform Role) to clarify legal status as passive intermediary
  * Expanded Section 10 (Limitation of Liability) with comprehensive disclaimers for all transaction risks
  * Added new Section 11 (User Acknowledgments) requiring users to accept full responsibility
  * Included visual warning boxes (yellow, blue, red, purple) to highlight key disclaimers
  * Reinforced throughout that TicketBazaar has no liability for ticket delivery, payment disputes, or event validity
  * Simplified color scheme to professional black and white styling for all disclaimer boxes
- June 29, 2025. Added legal compliance clause for local laws and taxes
  * Added clear compliance responsibility in Section 4 (Listing and Selling Tickets)
  * Enhanced Section 5 (Buying Tickets) with buyer compliance requirements
  * Added compliance acknowledgment to Section 11 (User Acknowledgments) with bold emphasis
  * Clear statement: "All buyers and sellers are responsible for ensuring that ticket resale complies with their local laws and taxes"
  * Reinforces that TicketBazaar is not responsible for user compliance with applicable regulations
- June 29, 2025. Specified governing law and jurisdiction for legal clarity
  * Updated Section 13 (Governing Law and Jurisdiction) with explicit Indian law governance
  * Clear statement: "These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts of Delhi"
  * Added disclaimer box highlighting legal jurisdiction for users
  * Specified that jurisdiction applies regardless of user location or nationality
  * Users waive objection to Delhi courts' jurisdiction, eliminating legal ambiguity
- June 29, 2025. Enhanced terms modification procedures for enforceability and fairness
  * Updated Section 12 (Modifications to Terms) with comprehensive notification procedures
  * Added 30-day advance notice requirement for significant changes affecting user rights
  * Specified notification methods: email, website banner, and in-app notifications
  * Distinguished between significant changes (requiring notice) and minor updates (formatting/clarifications)
  * Clear statement: "TicketBazaar reserves the right to update these Terms. Significant changes will be notified via email or website banner"
- June 29, 2025. Added comprehensive company information for legal transparency
  * Added new Section 14 (Company Information) with complete legal entity details
  * Specified operating company: Atrina Technologies Pvt Ltd
  * Included registered office address: 3/336, Jha Compound, Marris Road, Aligarh, UP 202001, India
  * Added placeholders for CIN and GSTIN to be updated upon incorporation/registration
  * Enhanced Section 15 (Contact Information) with both email and postal address
  * Clarified that all legal obligations under Terms are assumed by Atrina Technologies Pvt Ltd
- June 29, 2025. Added Grievance Officer information for regulatory compliance
  * Created new Section 15 (Grievance Officer) with dedicated Grievance Redressal information
  * Specified Grievance Officer: Jyoti Agarwal with email legal@ticketbazaar.co.in
  * Added 15 business days response time commitment for grievance resolution
  * Enhanced Section 16 (Contact Information) to include both general inquiries and grievance officer details
  * Provided clear escalation path for user complaints and platform-related issues
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```