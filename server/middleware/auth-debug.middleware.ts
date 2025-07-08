import { Request, Response, NextFunction } from 'express';

/**
 * Authentication debugging middleware
 * Logs detailed information about the OAuth flow
 */
export function authDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only log auth-related routes
  if (req.path.includes('/auth') || req.path.includes('/login')) {
    console.log('\n=== AUTH DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Query:', req.query);
    console.log('Session ID:', req.sessionID);
    console.log('Session:', {
      isAuthenticated: !!req.user,
      userId: req.user?.id,
      returnTo: req.session.returnTo,
      cookie: req.session.cookie
    });
    console.log('Headers:', {
      host: req.headers.host,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent']
    });
    console.log('Protocol:', req.protocol);
    console.log('Secure:', req.secure);
    console.log('=================\n');
  }
  
  next();
}

/**
 * OAuth error handler middleware
 * Provides detailed error information for debugging
 */
export function oauthErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (req.path.includes('/auth')) {
    console.error('\n=== OAUTH ERROR ===');
    console.error('Error Type:', err.name || 'Unknown');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Stack:', err.stack);
    
    // Handle specific OAuth errors
    if (err.name === 'TokenError') {
      console.error('Token Error Details:', {
        code: err.code,
        message: err.message,
        details: 'This usually means the authorization code is invalid or expired'
      });
    } else if (err.name === 'InternalOAuthError') {
      console.error('Internal OAuth Error:', {
        message: err.message,
        innerError: err.oauthError
      });
    }
    
    console.error('==================\n');
  }
  
  next(err);
}