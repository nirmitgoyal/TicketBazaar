import express from "express";
import { SearchService } from "../services/search.service";
import { logger } from "../utils/logger";

const router = express.Router();
const searchService = new SearchService();

/**
 * GET /api/autocomplete/suggestions - Get autocomplete suggestions
 * Returns relevant suggestions based on partial user input
 * Supports case-insensitive substring matching on titles, venues, and cities
 */
router.get("/suggestions", async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json([]);
    }

    // Use the new search service for better suggestions
    const suggestions = await searchService.getSearchSuggestions(query, 10);

    // Format suggestions for autocomplete component
    const formattedSuggestions = suggestions.map(suggestion => ({
      text: suggestion,
      type: 'suggestion'
    })); logger.info('AUTOCOMPLETE', `Found ${formattedSuggestions.length} suggestions for query: ${query}`);
    res.json(formattedSuggestions);
  } catch (error) {
    logger.error('AUTOCOMPLETE', 'Error getting suggestions', { error: error.message, query });
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /api/autocomplete/popular - Get popular search terms
router.get("/popular", async (req, res) => {
  try {
    const popularTerms = await searchService.getPopularSearchTerms(10);

    const formattedTerms = popularTerms.map(term => ({
      text: term,
      type: 'popular'
    }));

    logger.info('AUTOCOMPLETE', `Found ${formattedTerms.length} popular terms`);
    res.json(formattedTerms);
  } catch (error) {
    logger.error('AUTOCOMPLETE', 'Error getting popular terms', { error: error.message });
    res.status(500).json({ error: 'Failed to get popular terms' });
  }
});

export default router;