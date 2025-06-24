import { Router } from "express";
import { SellerTrustService } from "../services/seller-trust.service";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

// Import enhanced services (with fallback handling)
let enhancedAIVerificationService: any = null;
let fraudDetectionService: any = null;

try {
  const enhancedModule = await import("../services/enhanced-ai-verification.service");
  enhancedAIVerificationService = enhancedModule.enhancedAIVerificationService;
} catch (error) {
  console.warn("Enhanced AI verification service not available:", error);
}

try {
  const fraudModule = await import("../services/fraud-detection.service");
  fraudDetectionService = fraudModule.fraudDetectionService;
} catch (error) {
  console.warn("Fraud detection service not available:", error);
}

const router = Router();
const sellerTrustService = new SellerTrustService();

// GET /api/seller-trust/:sellerId - Get trust assessment for a seller
router.get("/:sellerId", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId);
    
    if (!sellerId || isNaN(sellerId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid seller ID" 
      });
    }

    // Fetch seller from database
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

    // Prepare seller profile for trust assessment
    const sellerProfile = {
      fullName: sellerData.fullName,
      email: sellerData.email,
      instagram: sellerData.instagram || undefined,
      phoneVerified: sellerData.phoneVerified || false,
      governmentIdVerified: sellerData.governmentIdVerified || false,
      country: sellerData.country || undefined
    };

    // Check if enhanced verification is available and use it
    try {
      // Use enhanced AI verification service for better accuracy
      const enhancedAssessment = await enhancedAIVerificationService.performEnhancedTrustAssessment(sellerData);
      
      // Also run fraud detection analysis
      const fraudAssessment = await fraudDetectionService.assessSellerFraudRisk(sellerData);
      
      // Combine assessments for comprehensive evaluation
      const combinedAssessment = {
        trustScore: enhancedAssessment.overallTrustScore / 10, // Convert to 0-10 scale for compatibility
        riskLevel: enhancedAssessment.riskLevel === 'verified' ? 'low' : enhancedAssessment.riskLevel,
        summary: enhancedAssessment.summary,
        verifiedProfiles: enhancedAssessment.verifiedProfiles,
        riskWarnings: enhancedAssessment.fraudIndicators.map(indicator => indicator.description),
        lastVerified: enhancedAssessment.lastAnalyzed,
        confidence: enhancedAssessment.confidence,
        // Additional enhanced data
        fraudProbability: enhancedAssessment.fraudProbability,
        verificationMetrics: enhancedAssessment.verificationMetrics,
        fraudRiskCategory: fraudAssessment.riskCategory,
        enhancedRecommendations: enhancedAssessment.recommendations
      };

      logger.info('express', `Enhanced trust assessment completed for seller ${sellerId}`);

      res.json({
        success: true,
        data: combinedAssessment
      });
      
    } catch (enhancedError) {
      logger.warn('express', `Enhanced verification failed, falling back to standard assessment: ${enhancedError}`);
      
      // Fallback to original assessment method
      const trustAssessment = await sellerTrustService.assessSellerTrust(sellerProfile);

      logger.info('express', `Trust assessment completed for seller ${sellerId}`);

      res.json({
        success: true,
        data: trustAssessment
      });
    }

  } catch (error) {
    logger.error('SERVER', `Error getting seller trust assessment: ${error}`);
    res.status(500).json({ 
      success: false, 
      error: "Failed to assess seller trustworthiness" 
    });
  }
});

export default router;