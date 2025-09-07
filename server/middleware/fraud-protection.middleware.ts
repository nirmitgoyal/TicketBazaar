import { Request, Response, NextFunction } from "express";
import { fraudDetectionService } from "../services/fraud-detection.service";
import { logger } from "../utils/logger";
import { securityConfig } from "../utils/environment.validation";

/**
 * Middleware to automatically assess fraud risk for ticket listings
 */
export async function assessTicketListingFraud(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }

    const ticketData = req.body;
    
    // Perform fraud risk assessment
    const assessment = await fraudDetectionService.assessTicketListingRisk(
      userId,
      ticketData
    );

    // Add assessment to request for downstream processing
    req.fraudAssessment = assessment;

    // Block high-risk activities
    if (assessment.riskLevel === 'CRITICAL') {
      logger.error('FRAUD_PROTECTION', 'Critical risk ticket listing blocked', {
        userId,
        riskScore: assessment.riskScore,
        factors: assessment.riskFactors
      });

      return res.status(403).json({
        success: false,
        message: "Your listing has been flagged for security review. Please contact support.",
        riskAssessment: {
          riskLevel: assessment.riskLevel,
          recommendations: assessment.recommendations
        }
      });
    }

    // Warn about high-risk but allow with restrictions
    if (assessment.riskLevel === 'HIGH') {
      logger.warn('FRAUD_PROTECTION', 'High risk ticket listing allowed with restrictions', {
        userId,
        riskScore: assessment.riskScore,
        factors: assessment.riskFactors
      });

      // Add warnings to response
      req.securityWarnings = assessment.recommendations;
    }

    next();
  } catch (error) {
    logger.error('FRAUD_PROTECTION', 'Error in fraud assessment middleware', { 
      error, 
      userId: req.user?.id 
    });
    // Don't block the request on fraud assessment errors
    next();
  }
}

/**
 * Middleware to automatically assess fraud risk for contact requests
 */
export async function assessContactRequestFraud(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    const { ticketId, message } = req.body;

    if (!userId) {
      return next();
    }

    // Perform fraud risk assessment
    const assessment = await fraudDetectionService.assessContactRequestRisk(
      userId,
      ticketId,
      message
    );

    // Add assessment to request
    req.fraudAssessment = assessment;

    // Block critical risk contacts
    if (assessment.riskLevel === 'CRITICAL') {
      logger.error('FRAUD_PROTECTION', 'Critical risk contact request blocked', {
        userId,
        ticketId,
        riskScore: assessment.riskScore,
        factors: assessment.riskFactors
      });

      return res.status(403).json({
        success: false,
        message: "Your contact request has been flagged for security review. Please contact support.",
        riskAssessment: {
          riskLevel: assessment.riskLevel,
          recommendations: assessment.recommendations
        }
      });
    }

    // Rate limit high-risk users
    if (assessment.riskLevel === 'HIGH') {
      logger.error('FRAUD_PROTECTION', 'High risk contact request with rate limiting', {
        userId,
        ticketId,
        riskScore: assessment.riskScore,
        factors: assessment.riskFactors
      });

      // Check if user has made too many requests recently
      const recentRequests = assessment.riskFactors.filter(factor => 
        factor.includes('contact requests') || factor.includes('requests')
      );

      if (recentRequests.length > 0) {
        return res.status(429).json({
          success: false,
          message: "You have reached the contact request limit. Please wait before making more requests.",
          retryAfter: 3600 // 1 hour
        });
      }
    }

    next();
  } catch (error) {
    logger.error('FRAUD_PROTECTION', 'Error in contact request fraud assessment', { 
      error, 
      userId: req.user?.id 
    });
    // Don't block the request on fraud assessment errors
    next();
  }
}

/**
 * Middleware to add fraud assessment results to response
 */
export function addFraudAssessmentToResponse(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Store original json method
  const originalJson = res.json;

  // Override json method to add fraud assessment data
  res.json = function(body: any) {
    if (req.fraudAssessment) {
      const responseBody = {
        ...body,
        securityInfo: {
          riskLevel: req.fraudAssessment.riskLevel,
          riskScore: req.fraudAssessment.riskScore,
          verificationRecommended: req.fraudAssessment.riskLevel !== 'LOW',
          securityTips: req.fraudAssessment.recommendations.slice(0, 2) // Limit to 2 tips
        }
      };

      if (req.securityWarnings) {
        responseBody.securityWarnings = req.securityWarnings;
      }

      return originalJson.call(this, responseBody);
    }

    return originalJson.call(this, body);
  };

  next();
}

/**
 * Enhanced rate limiting based on user verification level
 */
export function verificationBasedRateLimit(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Check if rate limiting is disabled via configuration
  if (securityConfig.rateLimit.disabled) {
    return next();
  }

  const user = req.user;
  if (!user) {
    return next();
  }

  // Calculate user's verification score
  let verificationScore = 0;
  if (user.emailVerified) verificationScore += 1;
  if (user.phoneVerified) verificationScore += 1;
  if (user.governmentIdVerified) verificationScore += 2;

  // Set different rate limits based on verification level
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window

  // Initialize rate limit tracking if not exists
  if (!req.app.locals.rateLimitStore) {
    req.app.locals.rateLimitStore = new Map();
  }

  const store = req.app.locals.rateLimitStore;
  const userKey = `user_${user.id}`;
  const userRequests = store.get(userKey) || { count: 0, resetTime: now + windowMs };

  // Reset counter if window has passed
  if (now > userRequests.resetTime) {
    userRequests.count = 0;
    userRequests.resetTime = now + windowMs;
  }

  // Determine rate limit based on verification level
  let maxRequests;
  if (verificationScore >= 4) {
    maxRequests = 100; // Fully verified users
  } else if (verificationScore >= 2) {
    maxRequests = 50; // Partially verified users
  } else if (verificationScore >= 1) {
    maxRequests = 20; // Email verified only
  } else {
    maxRequests = 10; // Unverified users
  }

  // Check if limit exceeded
  if (userRequests.count >= maxRequests) {
    logger.error('RATE_LIMIT', 'Rate limit exceeded', {
      userId: user.id,
      verificationScore,
      requestCount: userRequests.count,
      maxRequests
    });

    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Complete additional verification to increase your limits.",
      rateLimit: {
        limit: maxRequests,
        remaining: 0,
        reset: new Date(userRequests.resetTime),
        upgradeVerification: verificationScore < 4
      }
    });
  }

  // Increment counter
  userRequests.count++;
  store.set(userKey, userRequests);

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': (maxRequests - userRequests.count).toString(),
    'X-RateLimit-Reset': new Date(userRequests.resetTime).toISOString(),
  });

  next();
}

// Extend Request interface to include fraud assessment
declare global {
  namespace Express {
    interface Request {
      fraudAssessment?: any;
      securityWarnings?: string[];
    }
  }
}