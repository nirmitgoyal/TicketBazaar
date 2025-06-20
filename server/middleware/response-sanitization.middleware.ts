import { Request, Response, NextFunction } from "express";

/**
 * Sanitize response data to prevent information disclosure
 */
export function sanitizeResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Remove sensitive fields from user objects
    if (data && typeof data === 'object') {
      data = sanitizeObject(data);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Remove sensitive fields from objects
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = { ...obj };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.sessionId;
    delete sanitized.ipAddress;
    delete sanitized.userAgent;
    
    // Sanitize nested objects
    for (const key in sanitized) {
      if (sanitized[key] && typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize error responses to prevent information leakage
 */
export function sanitizeErrorResponse(err: any, req: Request, res: Response, next: NextFunction) {
  // Log full error details internally
  console.error('Error:', err);
  
  // Return sanitized error to client
  const statusCode = err.statusCode || err.status || 500;
  
  let message = 'An error occurred';
  if (statusCode < 500) {
    // Client errors - safe to show message
    message = err.message || message;
  } else {
    // Server errors - hide details in production
    if (process.env.NODE_ENV !== 'production') {
      message = err.message || message;
    }
  }
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}