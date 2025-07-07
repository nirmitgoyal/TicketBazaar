# Google OAuth Fix for TicketBazaar Production

## Problem Summary
Google OAuth signin stopped working on the production domain `https://ticketbazaar.co.in/`. This is a common issue when OAuth configurations are not properly set up for production environments.

## Root Causes Identified

### 1. **Callback URL Configuration**
- **Issue**: The callback URL was set as a relative path `/api/auth/google/callback` which works in development but can cause issues in production
- **Fix**: Updated to use absolute URLs for production: `https://ticketbazaar.co.in/api/auth/google/callback`

### 2. **Domain Detection Logic**
- **Issue**: Production domain detection was limited and might not work correctly in all deployment scenarios
- **Fix**: Enhanced domain detection with multiple fallback methods

### 3. **Session Cookie Configuration**
- **Issue**: Cookie settings not optimized for OAuth flow in production with HTTPS
- **Fix**: Updated session cookies to use `sameSite: "none"` for production to allow OAuth redirects

### 4. **Missing Environment Variables**
- **Issue**: Production environment might be missing required OAuth credentials
- **Fix**: Added comprehensive diagnostics to identify missing variables

## Changes Made

### 1. Enhanced `server/auth.ts`

#### Production Domain Detection
```typescript
// Enhanced domain detection with multiple methods
const isProductionDomain = process.env.REPLIT_DOMAINS?.includes('ticketbazaar.co.in') || 
                           process.env.NODE_ENV === 'production' && !process.env.REPL_ID ||
                           process.env.DOMAIN === 'ticketbazaar.co.in' ||
                           process.env.PRODUCTION_DOMAIN === 'ticketbazaar.co.in';
```

#### Dynamic Callback URL
```typescript
// Use absolute URL for production
if (isProductionDomain || process.env.NODE_ENV === 'production') {
  const productionDomain = process.env.PRODUCTION_DOMAIN || 'ticketbazaar.co.in';
  callbackURL = `https://${productionDomain}/api/auth/google/callback`;
} else {
  callbackURL = "/api/auth/google/callback";
}
```

#### Improved Session Configuration
```typescript
cookie: {
  secure: isProductionDomain || process.env.NODE_ENV === 'production',
  sameSite: isProductionDomain ? "none" : "lax", // Allow OAuth redirects
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  domain: isProductionDomain ? '.ticketbazaar.co.in' : undefined
},
proxy: true // Trust proxy headers
```

#### Enhanced Logging
- Added comprehensive logging for OAuth flow debugging
- Logs request headers, callback URLs, and domain detection status

### 2. Created OAuth Diagnostics Tool

#### New Script: `scripts/diagnose-oauth.ts`
- Comprehensive environment variable checking
- Domain detection diagnostics
- Google OAuth app configuration instructions
- Production-specific recommendations

#### Usage
```bash
npm run diagnose:oauth
```

## Google OAuth App Configuration Requirements

### Required Settings in Google Cloud Console

1. **Authorized JavaScript Origins**
   ```
   https://ticketbazaar.co.in
   http://localhost:3000 (for development)
   ```

2. **Authorized Redirect URIs**
   ```
   https://ticketbazaar.co.in/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback (for development)
   ```

3. **OAuth Consent Screen**
   - App Name: TicketBazaar
   - Authorized Domain: `ticketbazaar.co.in`
   - Scopes: email, profile, openid

## Environment Variables Required

### Production Environment
```bash
# Required for OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-secure-session-secret

# Production domain detection
PRODUCTION_DOMAIN=ticketbazaar.co.in
NODE_ENV=production

# Database
DATABASE_URL=your-production-database-url
```

## Deployment Checklist

### 1. Verify Environment Variables
```bash
# Run diagnostics
npm run diagnose:oauth
```

### 2. Check Google OAuth App Configuration
- Ensure `https://ticketbazaar.co.in/api/auth/google/callback` is in authorized redirect URIs
- Verify `ticketbazaar.co.in` is in authorized domains
- Confirm OAuth consent screen is configured

### 3. Test OAuth Flow
1. Navigate to `https://ticketbazaar.co.in/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify successful login

### 4. Monitor Logs
- Check server logs for OAuth-related errors
- Look for `[GOOGLE OAUTH]` and `[AUTH]` log entries
- Verify domain detection is working correctly

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch" Error
**Solution**: Update Google OAuth app redirect URIs to include exact production URL

### Issue: Session not persisting after OAuth
**Solution**: Check that `SESSION_SECRET` is set and cookies are configured correctly

### Issue: CORS errors during OAuth
**Solution**: Verify `sameSite` cookie setting and CORS configuration

### Issue: Domain detection not working
**Solution**: Set `PRODUCTION_DOMAIN=ticketbazaar.co.in` environment variable

## Testing Commands

```bash
# Run OAuth diagnostics
npm run diagnose:oauth

# Test in development
npm run dev

# Build and test production build
npm run build
npm run start:prod
```

## Security Considerations

1. **HTTPS Only**: OAuth only works with HTTPS in production
2. **Secure Cookies**: Production uses secure cookies with proper domain settings
3. **CSRF Protection**: State parameter enabled for OAuth requests
4. **Session Security**: Strong session secret required

## Monitoring and Debugging

### Key Log Messages to Monitor
```
[AUTH] Google OAuth Strategy configured successfully
[AUTH] Production Domain Detection: {...}
[GOOGLE OAUTH] Starting authentication for profile: ...
[GOOGLE OAUTH] Authentication successful for user: ...
```

### Debug Mode
Set environment variable for verbose logging:
```bash
DEBUG=oauth:*
```

## Next Steps

1. Deploy the updated code to production
2. Run the OAuth diagnostics script
3. Verify Google OAuth app configuration
4. Test the complete OAuth flow
5. Monitor logs for any remaining issues

The OAuth system should now work correctly on `https://ticketbazaar.co.in/` with proper production configurations.
