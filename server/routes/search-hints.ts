import { Router } from "express";
import { searchSuggestionsService } from "../services/search-suggestions.service.js";

const router = Router();

// Get popular search terms
router.get("/popular", async (req, res) => {
  try {
    const popularSearches = searchSuggestionsService.getPopularSearches();

    res.json({
      success: true,
      popularSearches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching popular searches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular searches",
    });
  }
});

// Get search suggestions based on query
router.post("/suggestions", async (req, res) => {
  try {
    const { userQuery, userLocation, userPreferences } = req.body;
    
    const suggestions = searchSuggestionsService.getSearchSuggestions({
      userQuery: userQuery || "",
      userLocation,
      userPreferences,
    });

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating search suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate search suggestions",
    });
  }
});

export default router;
