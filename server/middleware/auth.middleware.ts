import { Request, Response, NextFunction } from "express";
import {
  AuthenticationError,
  AuthorizationError,
} from "../services/error.service";

/**
 * Middleware to check if a user is authenticated
 */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("Authentication check:", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user?.id || "none",
    sessionID: req.sessionID,
    cookies: req.headers.cookie
  });
  
  if (req.isAuthenticated()) {
    return next();
  }

  throw new AuthenticationError("Unauthorized. Authentication required.");
}

/**
 * Middleware to check if the user is the owner of the resource
 * @param userIdParam The name of the parameter that contains the user ID
 */
export function isResourceOwner(userIdParam: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      throw new AuthenticationError("Unauthorized. Authentication required.");
    }

    const resourceUserId = parseInt(req.params[userIdParam]);
    const authenticatedUserId = req.user!.id;

    if (isNaN(resourceUserId)) {
      return next(new Error(`Invalid user ID: ${req.params[userIdParam]}`));
    }

    if (resourceUserId !== authenticatedUserId) {
      throw new AuthorizationError(
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
}

/**
 * Middleware to check if a user is an admin
 * This is a placeholder that would need to be implemented with real admin validation
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    throw new AuthenticationError("Unauthorized. Authentication required.");
  }

  // Check if user has admin role
  const user = req.user!;

  // For now, there is no admin role field in the User type
  // This would need to be added in a real admin implementation
  // if (user.role !== 'admin') {
  //   throw new AuthorizationError('Admin privileges required.');
  // }

  // Placeholder for admin check - in a real app we would check the user role
  // For now, we'll just let any authenticated user through

  next();
}

/**
 * Middleware to check if a user is either an admin or the owner of a resource
 * @param userIdParam The name of the parameter that contains the user ID
 */
export function isAdminOrResourceOwner(userIdParam: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      throw new AuthenticationError("Unauthorized. Authentication required.");
    }

    // For a real admin implementation, check if user is admin first
    // if (req.user.role === 'admin') {
    //   return next();
    // }

    // If not admin, check if user is the owner
    const resourceUserId = parseInt(req.params[userIdParam]);
    const authenticatedUserId = req.user!.id;

    if (isNaN(resourceUserId)) {
      return next(new Error(`Invalid user ID: ${req.params[userIdParam]}`));
    }

    if (resourceUserId !== authenticatedUserId) {
      throw new AuthorizationError(
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
}
