import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

/**
 * Middleware to check if user owns the ticket
 */
export async function isTicketOwner(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.sellerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You can only modify your own tickets" });
    }

    next();
  } catch (error) {
    console.error("Error verifying ticket ownership:", error);
    res.status(500).json({ message: "Error verifying ticket ownership" });
  }
}

/**
 * Middleware to check if user is admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

/**
 * Middleware to sanitize user input and prevent XSS
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    // Remove script tags and dangerous HTML
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
}