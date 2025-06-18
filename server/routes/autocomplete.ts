import express from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = express.Router();

// Helper function to calculate string similarity (for typo tolerance)
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Simple Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[str2.length][str1.length];
};

// GET /api/autocomplete/suggestions - Get autocomplete suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json([]);
    }

    const queryLower = query.toLowerCase();
    
    // Get all available tickets to build suggestions from
    const events = await storage.getAllAvailableTickets();
    
    // Build unique suggestions with similarity scoring
    const suggestions = new Map<string, { text: string; type: string; priority: number; category?: string }>();
    
    events.forEach((event: any) => {
      // Event titles (highest priority)
      if (event.eventTitle) {
        const eventTitle = event.eventTitle.toLowerCase();
        const exactMatch = eventTitle.includes(queryLower);
        const startsWithQuery = eventTitle.startsWith(queryLower);
        const similarity = calculateSimilarity(queryLower, eventTitle);
        
        if (exactMatch || similarity > 0.6) {
          const key = event.eventTitle.toLowerCase();
          if (!suggestions.has(key)) {
            let priority = 3;
            if (startsWithQuery) priority = 5;
            else if (exactMatch) priority = 4;
            else if (similarity > 0.8) priority = 3;
            else priority = 2;
            
            suggestions.set(key, {
              text: event.eventTitle,
              type: 'event',
              priority,
              category: event.category
            });
          }
        }
      }
      
      // Venues (medium priority)
      if (event.venue) {
        const venue = event.venue.toLowerCase();
        const exactMatch = venue.includes(queryLower);
        const startsWithQuery = venue.startsWith(queryLower);
        const similarity = calculateSimilarity(queryLower, venue);
        
        if (exactMatch || similarity > 0.6) {
          const key = event.venue.toLowerCase();
          if (!suggestions.has(key)) {
            let priority = 2;
            if (startsWithQuery) priority = 4;
            else if (exactMatch) priority = 3;
            else if (similarity > 0.8) priority = 2;
            else priority = 1;
            
            suggestions.set(key, {
              text: event.venue,
              type: 'venue',
              priority
            });
          }
        }
      }
      
      // Cities (lower priority)
      if (event.city) {
        const city = event.city.toLowerCase();
        const exactMatch = city.includes(queryLower);
        const startsWithQuery = city.startsWith(queryLower);
        const similarity = calculateSimilarity(queryLower, city);
        
        if (exactMatch || similarity > 0.6) {
          const key = event.city.toLowerCase();
          if (!suggestions.has(key)) {
            let priority = 1;
            if (startsWithQuery) priority = 3;
            else if (exactMatch) priority = 2;
            else if (similarity > 0.8) priority = 1;
            else priority = 1;
            
            suggestions.set(key, {
              text: event.city,
              type: 'city',
              priority
            });
          }
        }
      }
    });
    
    // Sort by priority and limit results
    const sortedSuggestions = Array.from(suggestions.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8); // Limit to 8 suggestions
    
    logger.info('EXPRESS', `GET /api/autocomplete/suggestions 200 - Found ${sortedSuggestions.length} suggestions for query "${query}"`);
    res.json(sortedSuggestions);
    
  } catch (error) {
    logger.error('EXPRESS', `GET /api/autocomplete/suggestions 500 - Error: ${error.message}`);
    res.status(500).json({ error: "Failed to get autocomplete suggestions" });
  }
});

export default router;