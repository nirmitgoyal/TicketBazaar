import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle API access control and bypass Vite development server
 * This prevents HTML responses for API endpoints and restricts access in production
 */
export function apiBypassMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if this is an API request
  if (req.path.startsWith('/api/')) {
    // In production, restrict API access on the ticketbazaar.co.in domain
    const isProduction = process.env.NODE_ENV === 'production';
    const host = req.get('host') || '';
    const isProductionDomain = host.includes('ticketbazaar.co.in');
    
    // Allow all auth routes even in production
    const isAuthRoute = req.path.startsWith('/api/auth');
    
    if (isProduction && isProductionDomain && !isAuthRoute) {
      res.status(403).json({
        success: false,
        message: 'API access is restricted in production',
        status: 403
      });
      return; // Don't call next() - stop the middleware chain
    }
    
    // Set headers to ensure JSON response for allowed API requests
    res.setHeader('Content-Type', 'application/json');
    // Add flag to indicate this is an API request
    (req as any).isApiRequest = true;
  }
  next();
}

/**
 * Middleware to handle API route not found
 */
export function apiNotFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.path}`,
      status: 404
    });
  }
  next();
}