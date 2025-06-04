import { Request, Response, NextFunction } from "express";
import {
  AppError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  ErrorService,
} from "../services/error.service";

/**
 * Base controller with common functionality for all controllers
 * Provides methods for sending responses and handling errors
 */
export class BaseController {
  /**
   * Send a success response
   * @param res Express response object
   * @param data Data to send
   * @param status HTTP status code (default: 200)
   */
  protected sendSuccess(res: Response, data: any, status = 200) {
    res.status(status).json({
      success: true,
      data,
    });
  }

  /**
   * Send an error response
   * @param res Express response object
   * @param message Error message
   * @param status HTTP status code (default: 500)
   */
  protected sendError(res: Response, message: string, status = 500) {
    const error = new AppError(message, status);
    const errorResponse = ErrorService.getErrorResponse(error);
    res.status(status).json(errorResponse);
  }

  /**
   * Handle an error and send an error response
   * @param error Error object
   * @param res Express response object
   */
  protected handleError(error: any, res: Response) {
    console.error("Error:", error);
    const errorResponse = ErrorService.getErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse);
  }

  /**
   * Check if the request is authenticated
   * @param req Express request object
   * @throws AuthenticationError if not authenticated
   */
  protected requireAuth(req: Request) {
    if (!req.isAuthenticated()) {
      throw new AuthenticationError();
    }
    return req.user!;
  }

  /**
   * Get a user ID from the request
   * @param req Express request object
   * @throws AuthenticationError if not authenticated
   */
  protected getUserId(req: Request): number {
    const user = this.requireAuth(req);
    return user.id;
  }

  /**
   * Parse an ID from a request parameter
   * @param idParam ID parameter from request
   * @throws BadRequestError if ID is not a valid number
   */
  protected parseId(idParam: string): number {
    const id = parseInt(idParam);
    if (isNaN(id)) {
      throw new BadRequestError(`Invalid ID: ${idParam}`);
    }
    return id;
  }

  /**
   * Validate that a resource exists
   * @param resource Resource to validate
   * @param resourceName Name of the resource
   * @param id ID of the resource
   * @throws NotFoundError if resource does not exist
   */
  protected validateResourceExists<T>(
    resource: T | null | undefined,
    resourceName: string,
    id: number,
  ): T {
    if (!resource) {
      throw new NotFoundError(`${resourceName} not found with ID: ${id}`);
    }
    return resource as T;
  }

  /**
   * Create an async route handler with error handling
   * @param handler Async route handler function
   * @returns Route handler with error handling
   */
  protected createHandler(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  ) {
    return ErrorService.asyncHandler(handler.bind(this));
  }
}
