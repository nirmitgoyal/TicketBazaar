import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { insertTicketViewSchema } from "@shared/schema";

const router = Router();

// Record a ticket view
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const validatedData = insertTicketViewSchema.parse({
      ...req.body,
      userId,
    });

    const ticketView = await storage.recordTicketView(validatedData);
    res.json(ticketView);
  } catch (error: any) {
    console.error("Error recording ticket view:", error);
    res.status(400).json({ 
      message: "Failed to record ticket view",
      error: error.message 
    });
  }
});

// Get user's ticket viewing history
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const ticketViews = await storage.getTicketViewsWithDetails(userId);
    res.json(ticketViews);
  } catch (error: any) {
    console.error("Error fetching ticket views:", error);
    res.status(500).json({ 
      message: "Failed to fetch ticket views",
      error: error.message 
    });
  }
});

export default router;
