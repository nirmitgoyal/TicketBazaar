import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import sanitizeHtml from "sanitize-html";

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
 * Uses sanitize-html library for robust XSS protection against various attack vectors
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Configure sanitize-html with a restrictive allowlist for ticket content
  const sanitizeOptions = {
    // Allow only safe HTML tags for ticket descriptions (if any HTML is needed)
    allowedTags: ['b', 'i', 'em', 'strong', 'br', 'p'],
    allowedAttributes: {},
    // Remove all protocol handlers to prevent javascript:, data:, etc.
    allowedSchemes: ['http', 'https'],
    // Disallow all classes and IDs
    allowedClasses: {},
    // Decode HTML entities to catch encoded XSS attempts
    decodeEntities: true,
    // Remove any suspicious URLs
    exclusiveFilter: (frame: any) => {
      // Block any remaining javascript: or data: URLs
      if (frame.attribs && frame.attribs.href && 
          (frame.attribs.href.startsWith('javascript:') || 
           frame.attribs.href.startsWith('data:'))) {
        return true;
      }
      return false;
    }
  };

  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Use sanitize-html for comprehensive XSS protection
    // This will decode entities and remove dangerous HTML
    const sanitized = sanitizeHtml(str, sanitizeOptions);
    
    // Additional cleanup for any remaining traces
    return sanitized
      .replace(/javascript:/gi, '')  // Extra protection against javascript: URLs
      .replace(/data:text\/html/gi, '') // Block data: URLs with HTML content
      .replace(/vbscript:/gi, '')    // Block VBScript
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