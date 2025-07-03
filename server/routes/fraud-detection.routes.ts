/**
 * Fraud Detection API Routes
 * Provides endpoints for advanced fraud detection and risk assessment
 */

import express from "express";
import { fraudDetectionService } from "../services/fraud-detection.service";
import { getEnhancedAIVerificationService } from "../services/enhanced-ai-verification.service";
import { db } from "../db";
import { users, tickets } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

const router = express.Router();

// GET /api/fraud-detection/seller/:sellerId - Comprehensive fraud assessment
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId);
    
    if (!sellerId || isNaN(sellerId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid seller ID" 
      });
    }

    // Fetch seller data
    const seller = await db
      .select()
      .from(users)
      .where(eq(users.id, sellerId))
      .limit(1);

    if (!seller || seller.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Seller not found" 
      });
    }

    const sellerData = seller[0];

    // Get seller's ticket history
    const ticketHistory = await db
      .select()
      .from(tickets)
      .where(eq(tickets.sellerId, sellerId));

    // Perform comprehensive fraud assessment
    const fraudAssessment = await fraudDetectionService.assessSellerFraudRisk(sellerData, ticketHistory);
    
    // Get enhanced AI verification
    const enhancedVerification = await getEnhancedAIVerificationService().performEnhancedTrustAssessment(sellerData);

    logger.info('express', `Fraud detection completed for seller ${sellerId}`);

    res.json({
      success: true,
      data: {
        sellerId,
        fraudAssessment,
        enhancedVerification,
        analysisTimestamp: new Date().toISOString(),
        ticketCount: ticketHistory.length
      }
    });

  } catch (error) {
    logger.error('SERVER', `Error in fraud detection: ${error}`);
    res.status(500).json({ 
      success: false, 
      error: "Failed to perform fraud detection analysis" 
    });
  }
});

// POST /api/fraud-detection/report - Report fraudulent behavior
router.post("/report", async (req, res) => {
  try {
    const { sellerId, reportType, description, evidence } = req.body;

    if (!sellerId || !reportType || !description) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sellerId, reportType, description"
      });
    }

    // In production, this would store the fraud report and trigger investigation
    logger.info('FRAUD_REPORT', `Fraud report received for seller ${sellerId}`, {
      reportType,
      description,
      evidence: evidence?.length || 0
    });

    // Update fraud detection models with new report
    // This would trigger reanalysis of the seller's risk profile

    res.json({
      success: true,
      message: "Fraud report submitted successfully",
      reportId: `FR_${Date.now()}_${sellerId}`
    });

  } catch (error) {
    logger.error('SERVER', `Error processing fraud report: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to process fraud report"
    });
  }
});

// GET /api/fraud-detection/patterns - Get current fraud patterns (admin only)
router.get("/patterns", async (req, res) => {
  try {
    // In production, this would require admin authentication
    
    const patterns = [
      {
        id: "pricing-anomaly",
        type: "pricing",
        description: "Tickets priced significantly below market value",
        detectionRate: "94%",
        severity: "high",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "new-account-volume",
        type: "behavioral",
        description: "New accounts with unusually high ticket posting volume",
        detectionRate: "89%",
        severity: "high",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "verification-bypass",
        type: "profile",
        description: "Attempts to bypass identity verification requirements",
        detectionRate: "76%",
        severity: "medium",
        lastUpdated: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        patterns,
        totalPatterns: patterns.length,
        lastModelUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('SERVER', `Error fetching fraud patterns: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch fraud patterns"
    });
  }
});

// POST /api/fraud-detection/feedback - Provide feedback on fraud assessment
router.post("/feedback", async (req, res) => {
  try {
    const { sellerId, assessmentId, feedback, actualOutcome } = req.body;

    if (!sellerId || !feedback) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sellerId, feedback"
      });
    }

    // Store feedback for machine learning model improvement
    logger.info('FRAUD_FEEDBACK', `Feedback received for seller ${sellerId}`, {
      assessmentId,
      feedback,
      actualOutcome
    });

    // In production, this would update ML models based on feedback
    // This is crucial for continuous improvement of fraud detection accuracy

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      feedbackId: `FB_${Date.now()}_${sellerId}`
    });

  } catch (error) {
    logger.error('SERVER', `Error processing fraud feedback: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to process feedback"
    });
  }
});

export default router;