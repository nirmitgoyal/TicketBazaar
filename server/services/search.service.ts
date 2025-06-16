import { storage } from "../storage";
import { Ticket } from "@shared/schema";
import { and, or, ilike, eq, desc, asc, sql } from "drizzle-orm";
import { tickets } from "@shared/schema";

/**
 * Enhanced search filters interface
 */
export interface SearchFilters {
    category?: string;
    location?: string;
    city?: string;
    country?: string;
    date?: Date;
    dateRange?: string;
    minPrice?: number;
    maxPrice?: number;
    trending?: boolean;
    sellingFast?: boolean;
    sortBy?: "relevance" | "price_low" | "price_high" | "date_asc" | "date_desc" | "newest";
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
}

/**
 * Search results interface with metadata
 */
export interface SearchResults {
    tickets: Ticket[];
    totalCount: number;
    searchTime: number;
    appliedFilters: SearchFilters;
}

/**
 * Service class for advanced search functionality
 */
export class SearchService {
    /**
     * Perform advanced search on tickets with substring matching
     * @param query Search query string
     * @param filters Search filters
     * @param limit Maximum number of results
     * @param offset Offset for pagination
     * @returns Search results with metadata
     */
    async searchTickets(
        query: string = "",
        filters: SearchFilters = {},
        limit: number = 50,
        offset: number = 0
    ): Promise<SearchResults> {
        const startTime = Date.now();

        try {
            // Build search conditions
            const conditions = this.buildSearchConditions(query, filters);

            // Build the query with db instance
            const { db } = await import("../db");

            let dbQuery = db
                .select()
                .from(tickets)
                .where(conditions ? conditions : undefined)
                .limit(limit)
                .offset(offset);

            // Apply sorting
            dbQuery = this.applySorting(dbQuery, filters.sortBy, query);

            // Execute search
            const results = await dbQuery;

            // Get total count for pagination (separate query for performance)
            const countQuery = db
                .select({ count: sql<number>`count(*)` })
                .from(tickets)
                .where(conditions ? conditions : undefined);

            const [{ count: totalCount }] = await countQuery;

            const searchTime = Date.now() - startTime;

            return {
                tickets: results,
                totalCount,
                searchTime,
                appliedFilters: filters,
            };
        } catch (error) {
            console.error("Search error:", error);
            return {
                tickets: [],
                totalCount: 0,
                searchTime: Date.now() - startTime,
                appliedFilters: filters,
            };
        }
    }

    /**
     * Build search conditions with enhanced substring matching
     * @param query Search query
     * @param filters Search filters
     * @returns Combined search conditions
     */
    private buildSearchConditions(query: string, filters: SearchFilters) {
        const conditions = [];

        // Only show available tickets
        conditions.push(eq(tickets.status, "available"));

        // Enhanced text search with substring matching
        if (query && query.trim().length > 0) {
            const searchTerms = query.trim().toLowerCase().split(/\s+/);

            // Create search conditions for each term
            const searchConditions = searchTerms.map(term =>
                or(
                    // Case-insensitive substring search in title
                    ilike(tickets.title, `%${term}%`),
                    // Case-insensitive substring search in event title
                    ilike(tickets.eventTitle, `%${term}%`),
                    // Case-insensitive substring search in venue
                    ilike(tickets.venue, `%${term}%`),
                    // Case-insensitive substring search in city
                    ilike(tickets.city, `%${term}%`),
                    // Case-insensitive substring search in event description
                    ilike(tickets.eventDescription, `%${term}%`),
                    // Case-insensitive substring search in category
                    ilike(tickets.category, `%${term}%`)
                )
            );

            // All search terms must match (AND logic)
            if (searchConditions.length > 0) {
                conditions.push(and(...searchConditions));
            }
        }

        // Category filter
        if (filters.category && filters.category !== "all") {
            conditions.push(eq(tickets.category, filters.category));
        }

        // City filter
        if (filters.city && filters.city !== "all") {
            conditions.push(eq(tickets.city, filters.city));
        }

        // Country filter
        if (filters.country && filters.country !== "all") {
            conditions.push(eq(tickets.country, filters.country));
        }

        // Location/venue filter
        if (filters.location) {
            conditions.push(
                or(
                    ilike(tickets.venue, `%${filters.location}%`),
                    ilike(tickets.city, `%${filters.location}%`),
                    ilike(tickets.venueAddress, `%${filters.location}%`)
                )
            );
        }

        // Date filter
        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);

            conditions.push(
                and(
                    sql`${tickets.eventDate} >= ${startOfDay}`,
                    sql`${tickets.eventDate} <= ${endOfDay}`
                )
            );
        }

        // Date range filter
        if (filters.dateRange) {
            const now = new Date();
            let startDate: Date;
            let endDate: Date;

            switch (filters.dateRange) {
                case "today":
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(now);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case "tomorrow":
                    startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case "this-week":
                    startDate = new Date(now);
                    endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case "this-weekend":
                    // Find next weekend (Friday to Sunday)
                    const dayOfWeek = now.getDay();
                    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
                    startDate = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case "this-month":
                    startDate = new Date(now);
                    endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case "next-month":
                    startDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = now;
                    endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            }

            conditions.push(
                and(
                    sql`${tickets.eventDate} >= ${startDate}`,
                    sql`${tickets.eventDate} <= ${endDate}`
                )
            );
        }

        // Price range filters
        if (filters.minPrice !== undefined) {
            conditions.push(sql`${tickets.price} >= ${filters.minPrice}`);
        }

        if (filters.maxPrice !== undefined) {
            conditions.push(sql`${tickets.price} <= ${filters.maxPrice}`);
        }

        // Trending filter
        if (filters.trending) {
            conditions.push(eq(tickets.trending, true));
        }

        // Selling fast filter
        if (filters.sellingFast) {
            conditions.push(eq(tickets.sellingFast, true));
        }

        // Geographic bounds filter
        if (filters.bounds) {
            const { north, south, east, west } = filters.bounds;
            conditions.push(
                and(
                    sql`${tickets.latitude} >= ${south}`,
                    sql`${tickets.latitude} <= ${north}`,
                    sql`${tickets.longitude} >= ${west}`,
                    sql`${tickets.longitude} <= ${east}`
                )
            );
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    /**
     * Apply sorting to the query
     * @param query Database query
     * @param sortBy Sort criteria
     * @param searchQuery Original search query for relevance scoring
     * @returns Query with sorting applied
     */
    private applySorting(query: any, sortBy?: string, searchQuery?: string) {
        switch (sortBy) {
            case "price_low":
                return query.orderBy(asc(tickets.price));
            case "price_high":
                return query.orderBy(desc(tickets.price));
            case "date_asc":
                return query.orderBy(asc(tickets.eventDate));
            case "date_desc":
                return query.orderBy(desc(tickets.eventDate));
            case "newest":
                return query.orderBy(desc(tickets.createdAt));
            case "relevance":
            default:
                // For relevance, prioritize trending, then selling fast, then newest
                return query.orderBy(
                    desc(tickets.trending),
                    desc(tickets.sellingFast),
                    desc(tickets.createdAt)
                );
        }
    }

    /**
     * Get search suggestions based on partial query
     * @param query Partial search query
     * @param limit Maximum number of suggestions
     * @returns Array of search suggestions
     */
    async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const { db } = await import("../db");
            const searchTerm = query.trim().toLowerCase();

            // Get suggestions from event titles, venues, and cities
            const suggestions = await db
                .select({
                    suggestion: tickets.eventTitle,
                    type: sql<string>`'event'`,
                })
                .from(tickets)
                .where(
                    and(
                        eq(tickets.status, "available"),
                        ilike(tickets.eventTitle, `%${searchTerm}%`)
                    )
                )
                .union(
                    db
                        .select({
                            suggestion: tickets.venue,
                            type: sql<string>`'venue'`,
                        })
                        .from(tickets)
                        .where(
                            and(
                                eq(tickets.status, "available"),
                                ilike(tickets.venue, `%${searchTerm}%`)
                            )
                        )
                )
                .union(
                    db
                        .select({
                            suggestion: tickets.city,
                            type: sql<string>`'city'`,
                        })
                        .from(tickets)
                        .where(
                            and(
                                eq(tickets.status, "available"),
                                ilike(tickets.city, `%${searchTerm}%`)
                            )
                        )
                )
                .limit(limit);

            // Remove duplicates and return unique suggestions
            const uniqueSuggestions = Array.from(
                new Set(suggestions.map(s => s.suggestion).filter(Boolean))
            );

            return uniqueSuggestions.slice(0, limit);
        } catch (error) {
            console.error("Error fetching search suggestions:", error);
            return [];
        }
    }

    /**
     * Get popular search terms
     * @param limit Maximum number of terms to return
     * @returns Array of popular search terms
     */
    async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
        try {
            const { db } = await import("../db");

            // Get most common event titles and venues
            const popularTerms = await db
                .select({
                    term: tickets.eventTitle,
                    count: sql<number>`count(*)`,
                })
                .from(tickets)
                .where(eq(tickets.status, "available"))
                .groupBy(tickets.eventTitle)
                .orderBy(desc(sql`count(*)`))
                .limit(limit);

            return popularTerms.map(t => t.term).filter(Boolean);
        } catch (error) {
            console.error("Error fetching popular search terms:", error);
            return [];
        }
    }
}
