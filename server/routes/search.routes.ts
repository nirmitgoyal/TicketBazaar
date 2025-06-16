import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { searchLimiter, generalApiLimiter } from "../middleware/rate-limit.middleware";

const router = Router();
const searchController = new SearchController();

/**
 * Advanced search route for tickets with full filtering capabilities
 * GET /api/search/tickets
 * 
 * Query parameters:
 * - q: Search query string (optional)
 * - category: Event category filter (optional)
 * - location: Location/venue filter (optional)  
 * - city: City filter (optional)
 * - country: Country filter (optional)
 * - date: Specific date filter (YYYY-MM-DD) (optional)
 * - dateRange: Date range filter (today, tomorrow, this-week, etc.) (optional)
 * - minPrice: Minimum price filter (optional)
 * - maxPrice: Maximum price filter (optional)
 * - trending: Show only trending events (true/false) (optional)
 * - sellingFast: Show only selling fast events (true/false) (optional)
 * - sortBy: Sort order (relevance, price_low, price_high, date_asc, date_desc, newest) (optional)
 * - limit: Results per page (1-100, default 50) (optional)
 * - offset: Results offset for pagination (optional)
 * - north, south, east, west: Geographic bounds for map search (optional)
 */
router.get("/tickets", searchLimiter, searchController.searchTickets);

/**
 * Advanced search route (alias for /tickets)
 * GET /api/search/advanced
 */
router.get("/advanced", searchLimiter, searchController.searchTickets);

/**
 * Get search suggestions based on partial query
 * GET /api/search/suggestions
 * 
 * Query parameters:
 * - q: Partial search query (minimum 2 characters)
 * - limit: Maximum suggestions to return (1-20, default 10) (optional)
 */
router.get("/suggestions", searchLimiter, searchController.getSearchSuggestions);

/**
 * Get popular search terms
 * GET /api/search/popular
 * 
 * Query parameters:
 * - limit: Maximum terms to return (1-50, default 10) (optional)
 */
router.get("/popular", generalApiLimiter, searchController.getPopularSearchTerms);

/**
 * Quick search endpoint for simple text-based searches
 * GET /api/search/quick
 * 
 * Query parameters:
 * - q: Search query string (required)
 * - limit: Results limit (1-50, default 20) (optional)
 */
router.get("/quick", searchLimiter, searchController.quickSearch);

export default router;
