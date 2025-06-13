import { Router } from "express";
import { fraudDetectionService } from "../services/fraud-detection.service";
import { isAuthenticated } from "../auth";
import { logger } from "../utils/logger";

const router = Router();

/**
 * Assess fraud risk for a new ticket listing
 */
router.post("/assess-ticket-listing", isAuthenticated, async (req, res) => {
  try {
    const { ticketData } = req.body;
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!ticketData) {
      return res.status(400).json({ message: "Ticket data is required" });
    }

    const assessment = await fraudDetectionService.assessTicketListingRisk(
      sellerId,
      ticketData
    );

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    logger.error('FRAUD_DETECTION_API', 'Error assessing ticket listing risk', { error });
    res.status(500).json({
      success: false,
      message: "Failed to assess ticket listing risk"
    });
  }
});

/**
 * Assess fraud risk for a contact request
 */
router.post("/assess-contact-request", isAuthenticated, async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!ticketId || !message) {
      return res.status(400).json({ 
        message: "Ticket ID and message are required" 
      });
    }

    const assessment = await fraudDetectionService.assessContactRequestRisk(
      requesterId,
      ticketId,
      message
    );

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    logger.error('FRAUD_DETECTION_API', 'Error assessing contact request risk', { error });
    res.status(500).json({
      success: false,
      message: "Failed to assess contact request risk"
    });
  }
});

/**
 * Get user risk profile
 */
router.get("/user-risk-profile/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Only allow users to view their own risk profile or admin users
    if (parseInt(userId) !== requestingUserId && !req.user?.isAdmin) {
      return res.status(403).json({ 
        message: "Not authorized to view this risk profile" 
      });
    }

    const riskProfile = await fraudDetectionService.getUserRiskProfile(
      parseInt(userId)
    );

    res.json({
      success: true,
      riskProfile
    });
  } catch (error) {
    logger.error('FRAUD_DETECTION_API', 'Error getting user risk profile', { error });
    res.status(500).json({
      success: false,
      message: "Failed to get user risk profile"
    });
  }
});

/**
 * Admin endpoint to get fraud statistics
 */
router.get("/fraud-statistics", isAuthenticated, async (req, res) => {
  try {
    // This would be admin-only in production
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        message: "Admin access required" 
      });
    }

    // In a real implementation, you'd gather statistics from the database
    const mockStatistics = {
      totalAssessments: 1247,
      highRiskDetected: 89,
      fraudPrevented: 23,
      averageRiskScore: 28.5,
      topRiskFactors: [
        "New account (< 7 days)",
        "Low verification level",
        "Price significantly above market rate",
        "Suspicious keywords detected"
      ],
      riskDistribution: {
        low: 65,
        medium: 25,
        high: 8,
        critical: 2
      }
    };

    res.json({
      success: true,
      statistics: mockStatistics
    });
  } catch (error) {
    logger.error('FRAUD_DETECTION_API', 'Error getting fraud statistics', { error });
    res.status(500).json({
      success: false,
      message: "Failed to get fraud statistics"
    });
  }
});

export default router;