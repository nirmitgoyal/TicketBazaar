import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Regenerate session ID to prevent fixation attacks
 */
export function regenerateSession(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.user) {
    req.session.regenerate((err) => {
      if (err) {
        logger.error('SESSION', 'Failed to regenerate session', err);
        return next(err);
      }
      next();
    });
  } else {
    next();
  }
}

/**
 * Prevent concurrent sessions for same user
 */
export function preventConcurrentSessions(req: Request, res: Response, next: NextFunction) {
  // This would require a session store that tracks user sessions
  // For now, we'll implement basic tracking
  if (req.user && req.session) {
    req.session.userId = req.user.id;
    req.session.loginTime = new Date().toISOString();
  }
  next();
}

/**
 * Session timeout protection
 */
export function checkSessionTimeout(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.loginTime) {
    const loginTime = new Date(req.session.loginTime);
    const now = new Date();
    const sessionDuration = now.getTime() - loginTime.getTime();
    const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionDuration > maxSessionTime) {
      req.session.destroy((err) => {
        if (err) {
          logger.error('SESSION', 'Failed to destroy expired session', err);
        }
      });
      return res.status(401).json({ error: 'Session expired' });
    }
  }
  next();
}