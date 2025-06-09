# Ticket Bazaar - P2P Ticket Resale Platform

A cutting-edge peer-to-peer ticket resale platform for the Indian event market, delivering a secure and intelligent marketplace for ticket transactions with advanced technological integrations.

## 🌟 Key Features

### Core Functionality
- **Secure P2P Ticket Trading**: Direct buyer-seller interactions with comprehensive verification
- **Advanced Verification System**: Multi-layer QR code verification and authenticity checks
- **Real-time Price Intelligence**: AI-driven dynamic pricing based on demand patterns
- **Interactive Venue Maps**: Google Maps integration with seat selection and heat-map visualization
- **Multi-city Coverage**: 50+ Indian cities with location-based filtering
- **Smart Recommendations**: ML-powered event suggestions based on user preferences

### Security & Trust Infrastructure
- **Multi-Factor Authentication**: Instagram OAuth, Google OAuth, and phone verification
- **Trust Score Algorithm**: Community-driven rating system with weighted feedback
- **Ticket Authentication**: QR code verification with blockchain-inspired security
- **Real-time Fraud Detection**: AI-powered pattern recognition for suspicious activities
- **Escrow Protection**: Secure payment processing with automated dispute resolution
- **Data Encryption**: End-to-end encryption for sensitive user information

### Advanced User Experience
- **Progressive Web App**: Offline-first architecture with service worker caching
- **Real-time Communication**: WebSocket-powered live chat and notifications
- **Voice Search**: Speech-to-text search functionality for mobile users
- **Smart Filters**: AI-enhanced search with predictive suggestions
- **Social Integration**: Seamless sharing across multiple social platforms
- **Accessibility**: WCAG 2.1 AA compliant design with screen reader support

## 🛠 Technology Stack

### Frontend Architecture
```
React 18 + TypeScript + Vite
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
├── Authentication: Passport.js (Local + Google OAuth)
├── File Upload: Multer with cloud storage
├── Session Management: Redis-compatible store
├── Error Tracking: Honeybadger integration
├── Payment Processing: Stripe + Razorpay
└── Real-time: WebSocket server with clustering
```

### Infrastructure & DevOps
```
Deployment: Replit + Heroku ready
├── Database: NeonDB PostgreSQL with connection pooling
├── CI/CD: GitHub Actions with automated testing
├── Testing: Playwright E2E + Vitest unit tests
├── Monitoring: Honeybadger error tracking
├── Analytics: Google Analytics 4 integration
└── Security: Environment-based secrets management
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL database
- Environment variables configured

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ticket-bazaar
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Database Setup**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Development Server**:
   ```bash
   npm run dev
   ```

   Access the application at `http://localhost:5000`

### Production Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── controllers/       # Business logic controllers
│   ├── services/          # Service layer
│   ├── middleware/        # Express middleware
│   └── utils/             # Server utilities
├── shared/                # Shared TypeScript definitions
│   └── schema.ts          # Database schema and types
├── scripts/               # Utility scripts
├── tests/                 # Testing suite
└── migrations/            # Database migrations
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payment Processing
STRIPE_SECRET_KEY="your-stripe-secret-key"
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_SECRET="your-razorpay-secret"

# External Services
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
HONEYBADGER_API_KEY="your-honeybadger-api-key"

# Application
NODE_ENV="development"
PORT="5000"
```

## 🧪 Testing

### End-to-End Testing
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e-ui
```

### Unit Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Database Testing
```bash
# Test database connectivity
npm run test:db
```

## 📊 Database Schema

### Core Entities

- **Users**: User profiles with verification status
- **Tickets**: Ticket listings with event details
- **Contact Requests**: P2P communication between users
- **User Reviews**: Community feedback system
- **Ticket Views**: Analytics tracking for listings

### Key Relationships

- Users can have multiple tickets and contact requests
- Tickets belong to sellers and can have multiple contact requests
- Reviews are created for completed transactions
- All entities include audit trails and timestamps

## 🔐 Security Features

### Authentication
- Multi-provider OAuth (Google, Instagram)
- Session-based authentication with secure cookies
- Password hashing with bcrypt
- Rate limiting on authentication endpoints

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- XSS protection with content security policies
- CSRF protection with tokens

### Payment Security
- PCI-compliant payment processing
- Escrow service for secure transactions
- Fraud detection and prevention
- Encrypted payment data storage

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

### Ticket Management
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/tickets` - Create ticket listing
- `GET /api/tickets/user/:userId` - Get user's tickets

### User Interactions
- `POST /api/contact-requests` - Create contact request
- `GET /api/contact-requests/user/:userId` - Get user's requests
- `POST /api/reviews` - Submit user review
- `GET /api/reviews/user/:userId` - Get user reviews

## 🚢 Deployment

### Replit Deployment
The application is optimized for Replit deployment with automatic configuration.

### Heroku Deployment
1. Create Heroku application
2. Configure environment variables
3. Deploy using Git or GitHub integration

### Docker Deployment
```bash
# Build Docker image
docker build -t ticket-bazaar .

# Run container
docker run -p 5000:5000 --env-file .env ticket-bazaar
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation for new features

## 📈 Performance Monitoring

### Built-in Analytics
- User interaction tracking
- Performance metrics collection
- Error logging and alerting
- Real-time usage statistics

### Monitoring Tools
- Honeybadger for error tracking
- Google Analytics for user analytics
- Database query performance monitoring
- API response time tracking

## 🔄 Version History

### Current Version: 2.0.0
- Enhanced security features
- Improved user experience
- Advanced verification system
- Real-time notifications

### Previous Versions
- v1.5.0: Payment integration
- v1.0.0: Initial release with core features

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 📄 License

This project is proprietary software. All rights reserved.

---

**Ticket Bazaar** - Revolutionizing ticket resale in India with security, transparency, and user-centric design.