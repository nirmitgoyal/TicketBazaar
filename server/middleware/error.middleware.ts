import { Request, Response, NextFunction } from "express";
import { ErrorService } from "../services/error.service";

/**
 * Global error handler middleware
 * This middleware captures any errors thrown in routes or other middleware
 * and returns a standardized error response
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Error occurred:", err);

  // Handle WebSocket upgrade errors
  if (req.headers.upgrade === 'websocket') {
    console.error("WebSocket error:", err);
    // Don't try to send HTTP response for WebSocket errors
    return next();
  }

  // Handle Drizzle ORM specific errors (convert to our error types)
  if (err.code) {
    // Handle PostgreSQL error codes
    if (err.code === "23505") {
      err.status = 409;
      err.name = "ConflictError";
      if (!err.message || err.message.includes("duplicate key")) {
        err.message = "Duplicate entry. This record already exists.";
      }
    } else if (err.code === "23503") {
      err.status = 400;
      err.name = "BadRequestError";
      if (!err.message || err.message.includes("foreign key constraint")) {
        err.message =
          "Foreign key constraint failed. Referenced resource may not exist.";
      }
    } else if (err.code === "42P01") {
      err.status = 500;
      if (
        !err.message ||
        err.message.includes("relation") ||
        err.message.includes("does not exist")
      ) {
        err.message = "Database table not found. Please contact support.";
      }
    }
  }

  // Get standardized error response
  const errorResponse = ErrorService.getErrorResponse(err);

  // Send response
  res.status(errorResponse.status).json(errorResponse);
}

/**
 * 404 Not Found middleware
 * This middleware handles requests to routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response) {
  const error = {
    status: 404,
    message: `Cannot ${req.method} ${req.path}`,
    name: "NotFoundError",
  };

  const errorResponse = ErrorService.getErrorResponse(error);
  res.status(404).json(errorResponse);
}
