# Honeybadger Error Tracking Setup

Honeybadger has been successfully installed and configured in your Node.js application for comprehensive error tracking and monitoring.

## What's Installed

- **@honeybadger-io/js** package for Node.js error tracking
- Automatic error reporting for unhandled exceptions
- Express middleware integration for request context
- Custom error handlers with user context

## Configuration

Honeybadger is configured in `server/honeybadger.ts` with the following features:

### Environment Variables Required

To enable Honeybadger error tracking, you need to set these environment variables:

- `HONEYBADGER_API_KEY` - Your Honeybadger project API key (required)
- `HONEYBADGER_REVISION` - Git revision for deployment tracking (optional)

### Features Configured

1. **Automatic Error Reporting** - All unhandled exceptions are automatically reported
2. **Request Context** - Errors include request details (URL, method, params, user info)
3. **User Tracking** - Errors are associated with authenticated users
4. **Development Mode** - Enhanced logging in development environment

## Getting Your API Key

1. Sign up for a Honeybadger account at https://www.honeybadger.io/
2. Create a new project or use an existing one
3. Copy your API key from the project settings
4. Add it to your environment variables

## Usage Examples

### Manual Error Reporting

```typescript
import { notifyError, notifyErrorAsync } from './server/honeybadger';

// Fire-and-forget error reporting
await notifyError(new Error('Something went wrong'), {
  custom_context: 'additional info'
});

// Promise-based error reporting (for serverless)
await notifyErrorAsync(error, { userId: 123 });
```

### Setting User Context

```typescript
import { setUserContext } from './server/honeybadger';

// Set user context for error tracking
await setUserContext(userId, userEmail);
```

### Custom Context

```typescript
import { setContext } from './server/honeybadger';

// Add custom context to all subsequent errors
await setContext({
  feature: 'ticket-search',
  experiment: 'new-algorithm'
});
```

## Deployment Tracking

To track deployments and link errors to specific versions:

```bash
# Set environment variables for deployment
export HONEYBADGER_ENV="production"
export HONEYBADGER_REVISION="$(git rev-parse HEAD)"
export HONEYBADGER_REPOSITORY="$(git config --get remote.origin.url)"

# Deploy tracking API call
curl -g "https://api.honeybadger.io/v1/deploys?deploy[environment]=$HONEYBADGER_ENV&deploy[local_username]=$USER&deploy[revision]=$HONEYBADGER_REVISION&deploy[repository]=$HONEYBADGER_REPOSITORY&api_key=$HONEYBADGER_API_KEY"
```

## Benefits for Your Ticket Marketplace

- **User Experience Monitoring** - Track errors affecting ticket purchases and transfers
- **Payment Error Tracking** - Monitor payment processing issues
- **Authentication Issues** - Track login and verification problems
- **Performance Insights** - Identify slow or failing API endpoints
- **Deployment Safety** - Link errors to specific code changes