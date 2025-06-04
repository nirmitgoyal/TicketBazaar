import { Router } from "express";
import { storage } from "../storage.js";

const router = Router();

// Get popular search terms (fallback when AI is unavailable)
router.get("/popular", async (req, res) => {
  try {
    const popularSearches = [
      { term: "IPL matches", category: "Sports", count: 1250 },
      { term: "Bollywood concerts", category: "Concert", count: 980 },
      { term: "Comedy shows Mumbai", category: "Comedy", count: 756 },
      { term: "Music festivals", category: "Festival", count: 634 },
      { term: "Cricket World Cup", category: "Sports", count: 589 },
      { term: "Stand up comedy Delhi", category: "Comedy", count: 445 },
      { term: "Rock concerts Bangalore", category: "Concert", count: 398 },
      { term: "Theater shows", category: "Theater", count: 321 },
    ];

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

export default router;
