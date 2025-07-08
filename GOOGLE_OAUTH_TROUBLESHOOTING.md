# Google OAuth 2.0 Troubleshooting Guide

## Quick Diagnostics

Visit `/oauth-test` in your browser to run automated diagnostics that will:
- Check your browser environment
- Test authentication endpoints
- Verify session handling
- Display current auth status

## Common Issues & Solutions

### 1. **Redirect URI Mismatch Error**

**Symptoms:**
- Error: "The redirect URI in the request does not match the ones authorized"
- Google shows "Error 400: redirect_uri_mismatch"

**Solution:**
1. Check your current callback URL:
   ```bash
   tsx scripts/google-oauth-diagnostics.ts
   ```

2. Add the EXACT callback URL to Google Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services > Credentials
   - Click on your OAuth 2.0 Client ID
   - Add these Authorized redirect URIs:
     ```
     https://your-replit-domain.replit.dev/api/auth/google/callback
     https://ticketbazaar.co.in/api/auth/google/callback
     http://localhost:3000/api/auth/google/callback
     ```

### 2. **Invalid Client Error**

**Symptoms:**
- Error: "Invalid client"
- Authentication fails immediately

**Solution:**
1. Verify environment variables are set:
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. Ensure credentials match the OAuth app in Google Console
3. Check that you're using credentials from the correct project

### 3. **Session Not Persisting**

**Symptoms:**
- User gets logged out immediately
- Authentication loop occurs
- Session cookie not being set

**Solution:**
1. Clear all cookies for your domain
2. Check browser console for cookie warnings
3. Ensure cookies are enabled in browser
4. For production, verify HTTPS is being used

### 4. **Token Exchange Failed**

**Symptoms:**
- Error: "TokenError: invalid_grant"
- "Authorization code is invalid or expired"

**Solution:**
1. This usually means the auth code was used twice or expired
2. Clear browser cookies and try again
3. Ensure you're not hitting the back button during OAuth flow
4. Check that your server time is synchronized

### 5. **CORS/HTTPS Issues**

**Symptoms:**
- Network errors in browser console
- "Mixed content" warnings
- Cookies not being sent

**Solution:**
1. For production, ensure all URLs use HTTPS
2. Check cookie settings in `server/auth.ts`:
   ```typescript
   cookie: {
     secure: process.env.NODE_ENV === 'production',
     httpOnly: true,
     sameSite: 'lax'
   }
   ```

## Environment-Specific Configuration

### Development (Replit)
```env
# Let the app auto-detect Replit domain
# Don't set GOOGLE_CALLBACK_URL unless needed
```

### Production
```env
GOOGLE_CALLBACK_URL=https://ticketbazaar.co.in/api/auth/google/callback
NODE_ENV=production
```

## Debug Checklist

1. **Check Environment Variables**
   ```bash
   # All these should be set
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   echo $SESSION_SECRET
   echo $DATABASE_URL
   ```

2. **Verify Google Console Setup**
   - [ ] OAuth consent screen configured
   - [ ] Application type: Web application
   - [ ] Authorized redirect URIs added
   - [ ] Application published (not in testing mode)

3. **Test Authentication Flow**
   ```bash
   # Watch server logs
   npm run dev
   
   # In another terminal, test endpoints
   curl http://localhost:3000/api/auth/user
   ```

4. **Monitor Browser Network Tab**
   - Open DevTools > Network tab
   - Click "Sign in with Google"
   - Watch for:
     - `/api/auth/google` redirect
     - Google OAuth consent screen
     - `/api/auth/google/callback` return
     - Final redirect to your app

## Console Logs to Watch For

### Successful Flow:
```
[GOOGLE OAUTH] Using Replit development callback URL
Setting up Google OAuth strategy
Is Replit: true
Google OAuth Callback URL: https://your-domain/api/auth/google/callback
=== INITIATING GOOGLE OAUTH ===
=== GOOGLE OAUTH CALLBACK ===
=== GOOGLE PROFILE RECEIVED ===
User logged in successfully: user@example.com
```

### Failed Flow:
```
[AUTH] Authentication error: TokenError
[AUTH] Token exchange failed - likely invalid/expired authorization code
```

## Testing Tools

1. **Run OAuth Diagnostics:**
   ```bash
   tsx scripts/google-oauth-diagnostics.ts
   ```

2. **Visit OAuth Test Page:**
   ```
   https://your-domain/oauth-test
   ```

3. **Manual Testing:**
   - Open incognito/private browser window
   - Clear all cookies
   - Try logging in
   - Check browser console for errors

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all URLs
- [ ] Set proper cookie domain
- [ ] Add production callback URL to Google Console
- [ ] Test with real domain, not localhost
- [ ] Enable secure cookies
- [ ] Verify session persistence

## Still Having Issues?

1. Check server logs for detailed error messages
2. Run the diagnostic script: `tsx scripts/google-oauth-diagnostics.ts`
3. Visit `/oauth-test` for browser-based diagnostics
4. Clear all browser data and try again
5. Verify Google OAuth app is not in "Testing" mode