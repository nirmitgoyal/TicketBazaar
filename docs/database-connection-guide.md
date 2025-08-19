# Database Connection Configuration

This document explains the database connection configuration implemented to resolve AWS RDS connection timeout issues.

## Problem Solved

The production environment was experiencing `CONNECT_TIMEOUT` errors when connecting to AWS RDS PostgreSQL instances. The previous configuration used a 10-second connection timeout which was insufficient for AWS RDS connections.

## Solution Overview

### Adaptive Connection Timeouts

The system now automatically detects the database provider and sets appropriate timeouts:

- **AWS RDS**: 30 seconds connect timeout
- **Other Production (e.g., Heroku)**: 20 seconds connect timeout  
- **Development/Test**: 10 seconds connect timeout

### Detection Logic

AWS RDS is detected by checking if `amazonaws.com` is present in the `DATABASE_URL`:

```typescript
const isAWSRDS = process.env.DATABASE_URL?.includes('amazonaws.com') || false;
```

### Connection Pool Settings

Production environments get enhanced connection pool settings:

```typescript
const connectionConfig = {
  max: isProduction ? 15 : 10, // Increased pool size for production
  idle_timeout: isProduction ? 60 : 20, // Longer idle timeout for production
  connect_timeout: isAWSRDS ? 30 : (isProduction ? 20 : 10), // Much longer for AWS RDS
  max_lifetime: isProduction ? 3600 : null, // Connection lifetime in production
};
```

## Files Modified

1. **`server/db.ts`** - Main database configuration with adaptive timeouts
2. **`server/auth.ts`** - Session store configuration for different environments
3. **`server/production-setup.ts`** - SSL configuration for AWS RDS vs Heroku
4. **`scripts/init-test-db.ts`** - Test database initialization with improved timeouts

## New Utilities

### Database Health Check (`server/utils/db-health.ts`)

Provides utilities for monitoring database connectivity:

- `checkDatabaseHealth()` - Comprehensive health check
- `retryDatabaseOperation()` - Retry logic with exponential backoff
- `testDatabaseConnection()` - Simple connection test

### Database Initialization (`scripts/init-db-connection.ts`)

New script for testing database connectivity with proper error handling:

```bash
npm run test-db-connection
```

## Usage

### Testing Database Connection

```bash
# Test database connection with current environment
npm run test-db-connection

# Test with specific DATABASE_URL
DATABASE_URL="postgres://..." npm run test-db-connection
```

### Health Check in Code

```typescript
import { checkDatabaseHealth } from './server/utils/db-health.js';

const health = await checkDatabaseHealth();
if (health.isConnected) {
  console.log(`Database healthy - ${health.connectionTime}ms`);
} else {
  console.error(`Database unhealthy - ${health.error}`);
}
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (production, development, test)

## Troubleshooting

If you still experience connection timeouts:

1. Check AWS RDS security groups and VPC configuration
2. Verify SSL certificate configuration
3. Monitor RDS performance metrics
4. Consider increasing timeout values further if needed
5. Use the health check utilities to diagnose issues

## Monitoring

The health check utilities provide detailed timing information:

- Connection establishment time
- Query execution time  
- Error details and timestamps

This data can be used to monitor database performance and identify issues early.