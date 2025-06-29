/**
 * Ticket Verification API Routes
 * Provides endpoints for verifying ticket listings using Perplexity AI
 */

import express from "express";
import { perplexityVerificationService } from "../services/perplexity-verification.service";
import { logger } from "../utils/logger";
import { isAuthenticated } from "../auth";

const router = express.Router();

// POST /api/ticket-verification/check - Verify a ticket listing
router.post("/check", isAuthenticated, async (req, res) => {
  try {
    const {
      listingTitle,
      eventDate,
      eventTime,
      venueLocation,
      eventCategory,
      ticketQuantity,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!listingTitle || !eventDate || !venueLocation || !eventCategory) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for verification"
      });
    }

    logger.info('TICKET_VERIFICATION', `Verifying ticket listing for user ${req.user?.id}`);

    // Perform verification
    const verificationResult = await perplexityVerificationService.verifyTicketListing({
      listingTitle,
      eventDate,
      eventTime: eventTime || 'Not specified',
      venueLocation,
      eventCategory,
      ticketQuantity: ticketQuantity || 1,
      additionalInfo
    });

    logger.info('TICKET_VERIFICATION', `Verification complete: ${verificationResult.legitimacy}`);

    res.json({
      success: true,
      data: verificationResult
    });

  } catch (error) {
    logger.error('TICKET_VERIFICATION', `Verification error: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to verify ticket listing"
    });
  }
});

// GET /api/ticket-verification/status - Check if verification service is available
router.get("/status", async (_req, res) => {
  try {
    const hasApiKey = !!process.env.PERPLEXITY_API_KEY;
    
    res.json({
      success: true,
      data: {
        serviceAvailable: hasApiKey,
        message: hasApiKey 
          ? "Verification service is operational" 
          : "Verification service requires API key configuration"
      }
    });
  } catch (error) {
    logger.error('TICKET_VERIFICATION', `Status check error: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to check verification service status"
    });
  }
});

export default router;