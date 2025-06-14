import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiting error handler
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 60 // 1 minute default retry time
  });
};

// General API rate limiter - 100 requests per 15 minutes
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.includes('/health');
  }
});

// Strict rate limiter for authentication endpoints - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for ticket creation - 10 tickets per hour
export const ticketCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 ticket creations per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact request rate limiter - 20 requests per hour
export const contactRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 contact requests per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Review submission rate limiter - 5 reviews per hour
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 reviews per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter - 60 searches per minute (generous for browsing)
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 searches per minute
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter - 5 uploads per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 uploads per 15 minutes
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiter for sensitive operations - 3 attempts per hour
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});