import { Request, Response, NextFunction } from "express";

/**
 * Sanitize and validate search queries
 */
export function validateSearchQuery(req: Request, res: Response, next: NextFunction) {
  const query = req.query.q as string;
  
  if (!query) {
    return next();
  }

  // Length validation
  if (query.length > 200) {
    return res.status(400).json({
      error: "Search query too long (maximum 200 characters)"
    });
  }

  // Remove potentially dangerous characters
  const sanitizedQuery = query
    .replace(/[<>\"';&\\]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /update\s+set/i,
    /insert\s+into/i,
    /exec\s*\(/i,
    /script\s*>/i,
    /--/,
    /\/\*/,
    /\*\//
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitizedQuery)) {
      return res.status(400).json({
        error: "Invalid search query detected"
      });
    }
  }

  // Update the query with sanitized version
  req.query.q = sanitizedQuery;
  next();
}