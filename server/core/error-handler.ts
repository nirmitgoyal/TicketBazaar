/**
 * Error Handler Middleware
 * 
 * This middleware handles errors across the application.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@ticketbazaar/types';
import { logger } from './logger';

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: Date;
  path: string;
  method: string;
  statusCode: number;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    userId: req.session?.userId,
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      details: err.details,
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const response: ErrorResponse = {
      success: false,
      error: 'Validation error',
      details: err.message,
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      statusCode: 400,
    };

    res.status(400).json(response);
    return;
  }

  // Handle database errors
  if (err.message.includes('duplicate key')) {
    const response: ErrorResponse = {
      success: false,
      error: 'Resource already exists',
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      statusCode: 409,
    };

    res.status(409).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    details: process.env.NODE_ENV === 'production' 
      ? undefined 
      : err.stack,
    timestamp: new Date(),
    path: req.path,
    method: req.method,
    statusCode: 500,
  };

  res.status(500).json(response);
}

/**
 * Async error handler wrapper
 */
export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<any>
) {
  return (...args: T) => {
    const [req, res, next] = args as [Request, Response, NextFunction];
    return Promise.resolve(fn(...args)).catch(next);
  };
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    error: 'Route not found',
    timestamp: new Date(),
    path: req.path,
    method: req.method,
    statusCode: 404,
  };

  res.status(404).json(response);
}