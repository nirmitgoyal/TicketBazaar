import { Router } from "express";
import { SellerTrustService } from "../services/seller-trust.service";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

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

    // Get trust assessment from Perplexity AI
    const trustAssessment = await sellerTrustService.assessSellerTrust(sellerProfile);

    logger.info('express', `Trust assessment completed for seller ${sellerId}`);

    res.json({
      success: true,
      data: trustAssessment
    });

  } catch (error) {
    logger.error('SERVER', `Error getting seller trust assessment: ${error}`);
    res.status(500).json({ 
      success: false, 
      error: "Failed to assess seller trustworthiness" 
    });
  }
});

export default router;