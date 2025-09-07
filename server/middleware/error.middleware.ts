import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  const userId = (req.user as any)?.id;
  const requestId = req.headers['x-request-id'] as string;
  
  // Log the error with context
  logger.error('API', `${req.method} ${req.originalUrl} failed`, error, userId, requestId);
  
  // Handle different types of errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors,
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'File too large',
    });
  }
  
  // Database errors
  if (error.code && error.code.startsWith('23')) {
    logger.error('DATABASE', 'Database constraint violation', error, userId, requestId);
    return res.status(409).json({
      message: 'Database operation failed',
    });
  }
  
  // Default server error
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message || 'Something went wrong';
    
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  const userId = (req.user as any)?.id;
  const requestId = req.headers['x-request-id'] as string;
  
  logger.error('API', `Route not found: ${req.method} ${req.originalUrl}`, undefined, userId, requestId);
  
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
}

// Async error wrapper for route handlers
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}