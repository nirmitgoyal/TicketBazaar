import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import {
  contactRequestSchema,
  insertContactRequestSchema,
} from "@shared/schema";
import { 
  assessContactRequestFraud, 
  addFraudAssessmentToResponse,
  verificationBasedRateLimit 
} from "../middleware/fraud-protection.middleware";

const router = Router();

// Create a contact request with fraud detection
router.post("/", 
  isAuthenticated, 
  verificationBasedRateLimit,
  assessContactRequestFraud,
  addFraudAssessmentToResponse,
  async (req, res) => {
    try {
      const validatedData = insertContactRequestSchema.parse(req.body);
      const contactRequest = await storage.createContactRequest(validatedData);
      res.status(201).json(contactRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Validation failed", details: error.errors });
      } else {
        console.error("Error creating contact request:", error);
        res.status(500).json({ error: "Failed to create contact request" });
      }
    }
  }
);

// Get contact requests for the current user (as requester)
router.get("/my-requests", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const contactRequests = await storage.getUserContactRequests(userId);
    res.json(contactRequests);
  } catch (error) {
    console.error("Error getting user contact requests:", error);
    res.status(500).json({ error: "Failed to get contact requests" });
  }
});

// Get contact requests for the current user (as seller)
router.get("/seller-requests", isAuthenticated, async (req, res) => {
  try {
    const sellerId = req.user!.id;
    const contactRequests = await storage.getSellerContactRequests(sellerId);
    res.json(contactRequests);
  } catch (error) {
    console.error("Error getting seller contact requests:", error);
    res.status(500).json({ error: "Failed to get seller contact requests" });
  }
});

// Update contact request status
router.patch("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusSchema = z.object({
      status: z.enum(["pending", "approved", "denied", "completed"]),
    });

    const validatedData = statusSchema.parse({ status });
    const updatedRequest = await storage.updateContactRequestStatus(
      parseInt(id),
      validatedData.status,
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error updating contact request status:", error);
      res
        .status(500)
        .json({ error: "Failed to update contact request status" });
    }
  }
});

export default router;
