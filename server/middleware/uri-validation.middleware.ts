import { Request, Response, NextFunction } from 'express';
import { log } from '../utils';

/**
 * Middleware to handle malformed URI parameters that can cause URIError
 * This prevents the server from crashing when receiving invalid URL encodings
 * 
 * This middleware must be added early in the middleware chain to catch 
 * URI decoding errors before they cause the application to crash
 */
export function uriValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get the raw URL before Express processes it
    const rawUrl = req.url;
    
    // Test if the URL can be decoded safely
    // This will throw URIError if the encoding is malformed
    decodeURIComponent(rawUrl);
    
    // Additional validation for common malformed patterns
    if (rawUrl.includes('%c0') || rawUrl.includes('%C0')) {
      throw new URIError('Invalid null byte encoding');
    }
    
    // Test for other potentially problematic encodings
    if (rawUrl.match(/%[0-9A-Fa-f]{0,1}$/)) {
      throw new URIError('Incomplete percent encoding');
    }
    
    // If we reach here, the URI is valid
    next();
  } catch (error) {
    // Handle URIError specifically
    if (error instanceof URIError) {
      const requestUrl = req.url;
      log(`Invalid URI detected: ${requestUrl} - ${error.message}`);
      
      // Return a 400 Bad Request response for malformed URIs
      return res.status(400).json({
        success: false,
        message: 'Invalid URL encoding',
        error: 'Bad Request',
        status: 400
      });
    }
    
    // For other errors, pass them to the next error handler
    next(error);
  }
}