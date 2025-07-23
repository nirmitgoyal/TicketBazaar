# 🤖 GitHub Copilot Development Guide for TicketBazaar

## 🚀 Quick Start Commands

### Development
```bash
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
```

### Testing
```bash
npm run test               # Run Playwright E2E tests
npm run test:e2e-ui        # Run tests with UI
```

### Database
```bash
npm run db:push            # Push schema changes
npm run db:migrate         # Run migrations
npm run wait-for-db        # Wait for database connection
```



## 🏗️ Architecture Overview

### Frontend (`client/`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React Query + Context
- **Routing**: Wouter

### Backend (`server/`)
- **Runtime**: Node.js 20 + Express.js
- **Language**: TypeScript
- **Build Tool**: ESBuild
- **Authentication**: Passport.js (Google OAuth + Local)
- **File Upload**: Multer

### Database
- **Engine**: PostgreSQL 17.4
- **ORM**: Drizzle ORM + Drizzle Kit
- **Schema**: `shared/schema.ts`
- **Migrations**: `migrations/` directory

### Testing
- **Framework**: Playwright
- **Tests**: `tests/e2e/` directory
- **Browsers**: Chromium, Firefox, WebKit

## 🔧 Key Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database configuration
- `playwright.config.ts` - Test configuration

## 🎯 Main Features

### Event Management
- Event creation and editing
- Ticket generation with QR codes
- Event discovery with geo-location
- Real-time updates via WebSocket

### User System
- Google OAuth authentication
- Local email/password authentication
- User profiles and preferences
- Session management

### Payment Processing
- Stripe integration (primary)
- Razorpay integration (secondary)
- Secure payment handling
- Transaction tracking

### File Management
- Image uploads for events
- File storage optimization
- Image processing and resizing

## 🗄️ Database Schema Key Tables

- `users` - User accounts and profiles
- `events` - Event information
- `tickets` - Ticket records
- `orders` - Purchase transactions
- `sessions` - User sessions

## 🌍 Environment Variables

Check `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session encryption
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth
- `VITE_GOOGLE_MAPS_API_KEY` - Maps integration

## 🚨 Development Notes

- Database URL: `postgresql://postgres:postgres@localhost:5432/ticketbazaar_test`
- Development server runs on port 5000 (configurable)
- Build outputs go to `dist/` directory
- All API routes are in `server/routes/`
- React components are in `client/src/components/`

---
*Generated for GitHub Copilot Coding Agent Environment*
