import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with proper authentication
  if (req.path.startsWith('/api/') && req.isAuthenticated?.()) {
    // For authenticated API requests, check origin
    const origin = req.get('Origin') || req.get('Referer');
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5000',
      'https://' + process.env.REPLIT_DOMAINS?.split(',')[0]
    ].filter(Boolean);

    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return res.status(403).json({ error: 'Invalid origin' });
    }
    return next();
  }

  // For form submissions, check CSRF token
  const token = req.body._csrf || req.get('X-CSRF-Token');
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

/**
 * Provide CSRF token to client
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.csrfToken) {
    req.session!.csrfToken = generateCSRFToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}