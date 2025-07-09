import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Advanced rate limiting with multiple detection methods
 */
export class AdvancedRateLimiter {
  private ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
  private userRequestCounts = new Map<number, { count: number; resetTime: number }>();
  private suspiciousIPs = new Set<string>();
  
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS_PER_IP = 500; // Increased from 200
  private readonly MAX_REQUESTS_PER_USER = 600; // Increased from 300
  private readonly SUSPICIOUS_THRESHOLD = 800; // Increased from 500

  /**
   * Get client identifier (IP + User-Agent fingerprint)
   */
  private getClientId(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = req.ip || req.connection.remoteAddress || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor);
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}:${userAgent.slice(0, 50)}`;
  }

  /**
   * Check if request should be blocked
   */
  shouldBlock(req: Request): boolean {
    const now = Date.now();
    const clientId = this.getClientId(req);
    const userId = req.user?.id;

    // Check IP-based limits
    const ipData = this.ipRequestCounts.get(clientId);
    if (ipData) {
      if (now > ipData.resetTime) {
        this.ipRequestCounts.delete(clientId);
      } else if (ipData.count >= this.MAX_REQUESTS_PER_IP) {
        return true;
      }
    }

    // Check user-based limits
    if (userId) {
      const userData = this.userRequestCounts.get(userId);
      if (userData) {
        if (now > userData.resetTime) {
          this.userRequestCounts.delete(userId);
        } else if (userData.count >= this.MAX_REQUESTS_PER_USER) {
          return true;
        }
      }
    }

    // Check for suspicious activity
    if (this.suspiciousIPs.has(clientId)) {
      return true;
    }

    return false;
  }

  /**
   * Record request
   */
  recordRequest(req: Request): void {
    const now = Date.now();
    const clientId = this.getClientId(req);
    const userId = req.user?.id;

    // Record IP request
    const ipData = this.ipRequestCounts.get(clientId);
    if (ipData) {
      ipData.count++;
      if (ipData.count > this.SUSPICIOUS_THRESHOLD) {
        this.suspiciousIPs.add(clientId);
      }
    } else {
      this.ipRequestCounts.set(clientId, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      });
    }

    // Record user request
    if (userId) {
      const userData = this.userRequestCounts.get(userId);
      if (userData) {
        userData.count++;
      } else {
        this.userRequestCounts.set(userId, {
          count: 1,
          resetTime: now + this.WINDOW_MS
        });
      }
    }
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, data] of this.ipRequestCounts) {
      if (now > data.resetTime) {
        this.ipRequestCounts.delete(key);
      }
    }
    
    for (const [key, data] of this.userRequestCounts) {
      if (now > data.resetTime) {
        this.userRequestCounts.delete(key);
      }
    }
  }
}

const advancedLimiter = new AdvancedRateLimiter();

// Clean up every 5 minutes
setInterval(() => advancedLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Advanced rate limiting middleware
 */
export const advancedRateLimit = (req: Request, res: Response, next: Function) => {
  if (advancedLimiter.shouldBlock(req)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: 900 // 15 minutes
    });
  }

  advancedLimiter.recordRequest(req);
  next();
};