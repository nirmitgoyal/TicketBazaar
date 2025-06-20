import { Request, Response, NextFunction } from "express";
import { URL } from "url";

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '169.254.0.0/16', // Link-local
  'fc00::/7', // IPv6 private
  '::1' // IPv6 localhost
];

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validates URLs to prevent SSRF attacks
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Check for blocked hosts
    const hostname = parsedUrl.hostname.toLowerCase();
    
    for (const blockedHost of BLOCKED_HOSTS) {
      if (blockedHost.includes('/')) {
        // CIDR notation - would need IP range checking
        continue;
      }
      if (hostname === blockedHost || hostname.endsWith('.' + blockedHost)) {
        return false;
      }
    }
    
    // Block common internal domains
    if (hostname.includes('internal') || 
        hostname.includes('local') || 
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware to validate external URLs in request body
 */
export function validateExternalUrls(req: Request, res: Response, next: NextFunction) {
  const urlFields = ['eventImageUrl', 'imageUrl', 'avatarUrl'];
  
  for (const field of urlFields) {
    if (req.body[field]) {
      if (!validateUrl(req.body[field])) {
        return res.status(400).json({
          error: `Invalid or potentially dangerous URL in ${field}`
        });
      }
    }
  }
  
  next();
}