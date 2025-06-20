import { Request, Response, NextFunction } from "express";

/**
 * Prevent memory exhaustion attacks
 */
export function limitRequestSize(req: Request, res: Response, next: NextFunction) {
  const maxBodySize = 1024 * 1024; // 1MB
  let bodySize = 0;
  
  req.on('data', (chunk) => {
    bodySize += chunk.length;
    if (bodySize > maxBodySize) {
      res.status(413).json({ error: 'Request too large' });
      req.destroy();
    }
  });
  
  next();
}

/**
 * Prevent algorithmic complexity attacks
 */
export function limitArrayOperations(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const result = validateComplexity(req.body, 0);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
  }
  next();
}

function validateComplexity(obj: any, depth: number): { valid: boolean; error?: string } {
  const maxDepth = 10;
  const maxArrayLength = 1000;
  const maxObjectKeys = 100;
  
  if (depth > maxDepth) {
    return { valid: false, error: 'Object nesting too deep' };
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > maxArrayLength) {
      return { valid: false, error: 'Array too large' };
    }
    
    for (const item of obj) {
      const result = validateComplexity(item, depth + 1);
      if (!result.valid) return result;
    }
  } else if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length > maxObjectKeys) {
      return { valid: false, error: 'Too many object properties' };
    }
    
    for (const key of keys) {
      const result = validateComplexity(obj[key], depth + 1);
      if (!result.valid) return result;
    }
  }
  
  return { valid: true };
}

/**
 * Prevent regex DoS attacks
 */
export function validateRegexOperations(req: Request, res: Response, next: NextFunction) {
  if (req.query.q) {
    const query = req.query.q as string;
    
    // Detect potentially dangerous regex patterns
    const dangerousPatterns = [
      /\(\?\:/g, // Non-capturing groups
      /\*\*/g,   // Double quantifiers
      /\+\+/g,   // Double quantifiers
      /\{\d+,\}/g, // Large quantifiers
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return res.status(400).json({
          error: 'Search query contains potentially dangerous patterns'
        });
      }
    }
  }
  
  next();
}