import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure API routes bypass Vite development server
 * This prevents HTML responses for API endpoints
 */
export function apiBypassMiddleware(req: Request, res: Response, next: NextFunction) {
  // Mark API requests to prevent Vite from intercepting them
  if (req.path.startsWith('/api/')) {
    // Set headers to ensure JSON response
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