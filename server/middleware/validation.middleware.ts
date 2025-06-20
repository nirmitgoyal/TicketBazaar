import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodSchema, z } from "zod";
import { ValidationError } from "../services/error.service";

/**
 * Middleware to validate request body against a schema
 * @param schema Schema to validate against
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Extract validation errors
        throw new ValidationError(
          "Validation failed",
          formatZodError(result.error),
        );
      }

      // Update request body with validated data
      req.body = result.data;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod error
        return next(
          new ValidationError("Validation failed", formatZodError(error)),
        );
      }
      return next(error);
    }
  };
};

/**
 * Middleware to validate request query against a schema
 * @param schema Schema to validate against
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        throw new ValidationError(
          "Validation failed",
          formatZodError(result.error),
        );
      }

      // Update request query with validated data
      req.query = result.data;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ValidationError("Validation failed", formatZodError(error)),
        );
      }
      return next(error);
    }
  };
};

/**
 * Middleware to validate request params against a schema
 * @param schema Schema to validate against
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        throw new ValidationError(
          "Validation failed",
          formatZodError(result.error),
        );
      }

      // Update request params with validated data
      req.params = result.data;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ValidationError("Validation failed", formatZodError(error)),
        );
      }
      return next(error);
    }
  };
};

/**
 * Format Zod error to a more readable format
 * @param error Zod error
 * @returns Formatted error object
 */
function formatZodError(error: ZodError) {
  return error.format();
}

/**
 * Validate ID parameters to prevent injection attacks
 */
export const validateIdParam = (paramName: string = 'id') => {
  const { z } = require('zod');
  return validateParams(z.object({
    [paramName]: z.string().transform((val: string, ctx: any) => {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid ${paramName}: must be a positive integer`,
        });
        return z.NEVER;
      }
      return parsed;
    })
  }));
};
