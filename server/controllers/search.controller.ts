import { Request, Response } from "express";
import { SearchService, SearchFilters } from "../services/search.service";
import { z } from "zod";

/**
 * Controller for search-related endpoints
 */
export class SearchController {
    private searchService: SearchService;

    constructor() {
        this.searchService = new SearchService();
    }

    /**
     * Search tickets with advanced filtering and substring matching
     * GET /api/search/tickets
     */
    searchTickets = async (req: Request, res: Response) => {
        try {
            // Validate query parameters
            const querySchema = z.object({
                q: z.string().optional().default(""),
                category: z.string().optional(),
                location: z.string().optional(),
                city: z.string().optional(),
                country: z.string().optional(),
                date: z
                    .string()
                    .optional()
                    .transform((val) => (val ? new Date(val) : undefined)),
                dateRange: z.string().optional(),
                minPrice: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
                maxPrice: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
                trending: z
                    .enum(["true", "false"])
                    .optional()
                    .transform((val) => val === "true"),
                sellingFast: z
                    .enum(["true", "false"])
                    .optional()
                    .transform((val) => val === "true"),
                sortBy: z
                    .enum(["relevance", "price_low", "price_high", "date_asc", "date_desc", "newest"])
                    .optional()
                    .default("relevance"),
                limit: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseInt(val) : 50))
                    .refine((val) => val >= 1 && val <= 100, {
                        message: "Limit must be between 1 and 100",
                    }),
                offset: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseInt(val) : 0))
                    .refine((val) => val >= 0, {
                        message: "Offset must be non-negative",
                    }),
                // Geographic bounds for map-based search
                north: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
                south: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
                east: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
                west: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseFloat(val) : undefined)),
            });

            const query = querySchema.parse(req.query);

            // Build search filters
            const filters: SearchFilters = {};

            if (query.category) filters.category = query.category;
            if (query.location) filters.location = query.location;
            if (query.city) filters.city = query.city;
            if (query.country) filters.country = query.country;
            if (query.date) filters.date = query.date;
            if (query.dateRange) filters.dateRange = query.dateRange;
            if (query.minPrice !== undefined) filters.minPrice = query.minPrice;
            if (query.maxPrice !== undefined) filters.maxPrice = query.maxPrice;
            if (query.trending !== undefined) filters.trending = query.trending;
            if (query.sellingFast !== undefined) filters.sellingFast = query.sellingFast;
            if (query.sortBy) filters.sortBy = query.sortBy;

            // Add geographic bounds if all coordinates are provided
            if (
                query.north !== undefined &&
                query.south !== undefined &&
                query.east !== undefined &&
                query.west !== undefined
            ) {
                filters.bounds = {
                    north: query.north,
                    south: query.south,
                    east: query.east,
                    west: query.west,
                };
            }

            // Perform search
            const results = await this.searchService.searchTickets(
                query.q,
                filters,
                query.limit,
                query.offset
            );

            // Add search metadata to response headers
            res.set({
                'X-Search-Query': query.q,
                'X-Search-Time': results.searchTime.toString(),
                'X-Total-Results': results.totalCount.toString(),
                'X-Returned-Results': results.tickets.length.toString(),
            });

            res.status(200).json({
                success: true,
                data: {
                    tickets: results.tickets,
                    pagination: {
                        totalCount: results.totalCount,
                        limit: query.limit,
                        offset: query.offset,
                        hasNext: query.offset + query.limit < results.totalCount,
                        hasPrev: query.offset > 0,
                    },
                    searchMeta: {
                        query: query.q,
                        searchTime: results.searchTime,
                        appliedFilters: results.appliedFilters,
                    },
                },
            });
        } catch (error) {
            console.error("Search error:", error);

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid search parameters",
                    errors: error.errors,
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error during search",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * Get search suggestions based on partial query
     * GET /api/search/suggestions
     */
    getSearchSuggestions = async (req: Request, res: Response) => {
        try {
            const querySchema = z.object({
                q: z.string().min(2, "Query must be at least 2 characters"),
                limit: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseInt(val) : 10))
                    .refine((val) => val >= 1 && val <= 20, {
                        message: "Limit must be between 1 and 20",
                    }),
            });

            const { q: query, limit } = querySchema.parse(req.query);

            const suggestions = await this.searchService.getSearchSuggestions(query, limit);

            res.status(200).json({
                success: true,
                data: {
                    suggestions,
                    query,
                },
            });
        } catch (error) {
            console.error("Search suggestions error:", error);

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parameters",
                    errors: error.errors,
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * Get popular search terms
     * GET /api/search/popular
     */
    getPopularSearchTerms = async (req: Request, res: Response) => {
        try {
            const querySchema = z.object({
                limit: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseInt(val) : 10))
                    .refine((val) => val >= 1 && val <= 50, {
                        message: "Limit must be between 1 and 50",
                    }),
            });

            const { limit } = querySchema.parse(req.query);

            const popularTerms = await this.searchService.getPopularSearchTerms(limit);

            res.status(200).json({
                success: true,
                data: {
                    popularTerms,
                },
            });
        } catch (error) {
            console.error("Popular search terms error:", error);

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parameters",
                    errors: error.errors,
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * Quick search endpoint for simple text-based searches
     * GET /api/search/quick
     */
    quickSearch = async (req: Request, res: Response) => {
        try {
            const querySchema = z.object({
                q: z.string().min(1, "Query is required"),
                limit: z
                    .string()
                    .optional()
                    .transform((val) => (val ? parseInt(val) : 20))
                    .refine((val) => val >= 1 && val <= 50, {
                        message: "Limit must be between 1 and 50",
                    }),
            });

            const { q: query, limit } = querySchema.parse(req.query);

            // Perform quick search with default sorting
            const results = await this.searchService.searchTickets(
                query,
                { sortBy: "relevance" },
                limit,
                0
            );

            res.status(200).json({
                success: true,
                data: {
                    tickets: results.tickets,
                    totalCount: results.totalCount,
                    searchTime: results.searchTime,
                },
            });
        } catch (error) {
            console.error("Quick search error:", error);

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parameters",
                    errors: error.errors,
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
}
