import { Router } from "express";
import { searchFeedbackService } from "../services/search-feedback.service.js";

const router = Router();

// Get search feedback based on query analysis
router.post("/feedback", async (req, res) => {
  try {
    const { 
      queryType, 
      originalQuery, 
      sanitizedQuery, 
      userLocation, 
      resultCount 
    } = req.body;

    const feedback = searchFeedbackService.getFeedback({
      queryType,
      originalQuery,
      sanitizedQuery,
      userLocation,
      resultCount
    });

    res.json({
      success: true,
      feedback,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating search feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate search feedback",
    });
  }
});

// Get popular suggestions for empty searches
router.get("/popular-suggestions", async (req, res) => {
  try {
    const suggestions = searchFeedbackService.getPopularSuggestions();

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching popular suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular suggestions",
    });
  }
});

export default router;