import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Prevent database timing attacks by normalizing response times
 */
export function normalizeResponseTime(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const processingTime = Date.now() - startTime;
    const minResponseTime = 100; // Minimum 100ms response time
    
    if (processingTime < minResponseTime) {
      setTimeout(() => {
        originalSend.call(this, data);
      }, minResponseTime - processingTime);
    } else {
      originalSend.call(this, data);
    }
    
    return this;
  };
  
  next();
}

/**
 * Validate database operation parameters
 */
export function validateDatabaseParams(req: Request, res: Response, next: NextFunction) {
  // Validate numeric IDs in params
  for (const [key, value] of Object.entries(req.params)) {
    if (key.toLowerCase().includes('id')) {
      const numericValue = parseInt(value as string);
      if (isNaN(numericValue) || numericValue <= 0 || numericValue > Number.MAX_SAFE_INTEGER) {
        return res.status(400).json({
          error: `Invalid ${key}: must be a positive integer`
        });
      }
      req.params[key] = numericValue.toString();
    }
  }
  
  // Validate pagination parameters
  if (req.query.page) {
    const page = parseInt(req.query.page as string);
    if (isNaN(page) || page < 1 || page > 10000) {
      return res.status(400).json({
        error: "Invalid page parameter: must be between 1 and 10000"
      });
    }
  }
  
  if (req.query.limit) {
    const limit = parseInt(req.query.limit as string);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Invalid limit parameter: must be between 1 and 100"
      });
    }
  }
  
  next();
}

/**
 * Prevent NoSQL injection in JSON fields
 */
export function sanitizeJsonFields(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeJsonObject(req.body);
  }
  next();
}

function sanitizeJsonObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Sanitize nested objects
      if (value && typeof value === 'object') {
        sanitized[key] = sanitizeJsonObject(value);
      } else if (typeof value === 'string') {
        // Remove null bytes and control characters
        sanitized[key] = value.replace(/\x00/g, '').replace(/[\x01-\x1F\x7F]/g, '');
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return obj;
}