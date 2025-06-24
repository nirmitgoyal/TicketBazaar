import { Router } from "express";
import { storage } from "../storage.js";
import { aiVerificationService } from "../services/ai-verification.service.js";
import { z } from "zod";

const router = Router();

// AI verification schema
const aiVerificationSchema = z.object({
  ticketId: z.number(),
});

// AI verify ticket and seller
router.post("/verify/:ticketId", async (req, res) => {
  try {
    const { ticketId } = aiVerificationSchema.parse({
      ticketId: parseInt(req.params.ticketId),
    });

    // Get ticket details
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Get seller details
    const seller = await storage.getUser(ticket.sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Perform AI verification
    const verificationResult = await aiVerificationService.verifyTicketAndSeller(ticket, seller);

    // Log the verification for audit trail
    console.log(`AI Verification completed for ticket ${ticketId}:`, {
      ticketId,
      sellerId: seller.id,
      overallConfidence: verificationResult.overall.confidence,
      fraudRisk: verificationResult.overall.fraudRisk,
      timestamp: verificationResult.analysisTimestamp,
    });

    res.json({
      success: true,
      data: {
        verification: {
          overall: verificationResult.overall,
        },
        verificationResults: {
          event: verificationResult.event,
          seller: verificationResult.seller,
          pricing: verificationResult.pricing,
        },
        recommendations: verificationResult.recommendations,
        citations: verificationResult.citations,
        analysisTimestamp: verificationResult.analysisTimestamp,
        ticketDetails: {
          id: ticket.id,
          eventTitle: ticket.eventTitle,
          venue: ticket.venue,
          eventDate: ticket.eventDate,
          price: ticket.price,
          originalPrice: ticket.originalPrice,
        },
        sellerDetails: {
          id: seller.id,
          fullName: seller.fullName,
          rating: seller.rating,
          ratingsCount: seller.ratingsCount,
          phoneVerified: seller.phoneVerified,
          governmentIdVerified: seller.governmentIdVerified,
          country: seller.country,
        },
      },
    });
  } catch (error: any) {
    console.error("AI verification error:", error);
    
    if (error.message.includes('PERPLEXITY_API_KEY')) {
      return res.status(500).json({
        success: false,
        message: "AI verification service is not configured. Please contact support.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "AI verification failed",
    });
  }
});

// Get verification history for a ticket
router.get("/history/:ticketId", async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    
    // For now, return empty history as we're not storing verification logs
    // In production, you might want to store verification results in the database
    res.json({
      success: true,
      data: {
        verifications: [],
        message: "Verification history feature coming soon",
      },
    });
  } catch (error) {
    console.error("Error fetching verification history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification history",
    });
  }
});

export default router;