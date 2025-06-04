/**
 * Custom error classes for the application
 * These classes provide a standardized way to create and handle errors
 * throughout the application.
 */

// Base application error
export class AppError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error for validation failures (400)
export class ValidationError extends AppError {
  public errors?: any;

  constructor(message: string = "Validation error", errors?: any) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

// Error for authentication failures (401)
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

// Error for authorization failures (403)
export class AuthorizationError extends AppError {
  constructor(
    message: string = "You do not have permission to perform this action",
  ) {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

// Error for resource not found (404)
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// Error for conflict situations (409)
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// Error for bad requests (400)
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

// Error for feature not implemented (501)
export class NotImplementedError extends AppError {
  constructor(message: string = "This feature is not yet implemented") {
    super(message, 501);
    this.name = "NotImplementedError";
  }
}

// Error for payment processing failures (402)
export class PaymentError extends AppError {
  constructor(message: string = "Payment required or failed") {
    super(message, 402);
    this.name = "PaymentError";
  }
}

// Error for external service failures (503)
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service unavailable") {
    super(message, 503);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Error handling utilities
 */
export class ErrorService {
  /**
   * Get standardized error response object
   * @param error Error object
   * @returns Error response object
   */
  public static getErrorResponse(error: any) {
    // Default error response
    const response = {
      success: false,
      message: error.message || "Internal server error",
      status: error.status || 500,
      errors: error.errors || undefined,
      code: error.code || undefined,
    };

    // Only include stack trace in development
    if (process.env.NODE_ENV !== "production") {
      (response as any).stack = error.stack;
    }

    return response;
  }

  /**
   * Wrap async route handler with error handling
   * @param fn Async route handler function
   * @returns Wrapped function with error handling
   */
  public static asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
