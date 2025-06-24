import { eq, or, and, like, desc, sql, ilike, count } from "drizzle-orm";
import { PgInsertValue } from "drizzle-orm/pg-core";
import {
  users,
  tickets,
  contactRequests,
  userFeedback,

  ticketViews,
  ticketPopularity,
  type User,
  type Ticket,
  type ContactRequest,
  type UserFeedback,

  type TicketView,
  type TicketPopularity,
  type InsertUser,
  type InsertTicket,
  type InsertContactRequest,
  type InsertUserFeedback,

  type InsertTicketView,
  type InsertTicketPopularity,
} from "@shared/schema";
import { db } from "./db";
import { logger } from "./utils/logger";
import { QueryBuilder, CacheManager } from "./utils/query-builder";

/**
 * Optimized Storage Implementation
 * Features: Advanced caching, batch operations, optimized queries
 */
export class OptimizedStorage {
  
  // User operations with caching
  async getUser(id: number): Promise<User | undefined> {
    const cached = CacheManager.getCacheValue("users", id);
    if (cached) return cached;
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        CacheManager.setCacheWithTTL("users", id, user, 300000); // 5 min cache
      }
      return user;
    } catch (error) {
      logger.error('STORAGE', `Error fetching user ${id}:`, error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const cacheKey = `email:${email}`;
    const cached = CacheManager.getCacheValue("users", cacheKey);
    if (cached) return cached;
    
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) {
        CacheManager.setCacheWithTTL("users", cacheKey, user, 300000);
        CacheManager.setCacheWithTTL("users", user.id, user, 300000);
      }
      return user;
    } catch (error) {
      logger.error('STORAGE', `Error fetching user by email ${email}:`, error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      if (user) {
        CacheManager.setCacheWithTTL("users", user.id, user, 300000);
        return user;
      }
      throw new Error('Failed to create user');
    } catch (error) {
      logger.error('STORAGE', 'Error creating user:', error);
      throw error;
    }
  }
  

  
  async updateUserPhone(userId: number, phone: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ phone } as any)
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        CacheManager.invalidateCache("users", userId);
        CacheManager.setCacheWithTTL("users", userId, user, 300000);
      }
      return user;
    } catch (error) {
      logger.error('STORAGE', `Error updating user phone ${userId}:`, error);
      return undefined;
    }
  }
  
  async updateUserInstagram(userId: number, instagram: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ instagram } as any)
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        CacheManager.invalidateCache("users", userId);
        CacheManager.setCacheWithTTL("users", userId, user, 300000);
      }
      return user;
    } catch (error) {
      logger.error('STORAGE', `Error updating user Instagram ${userId}:`, error);
      return undefined;
    }
  }
  
  // Optimized ticket operations
  async searchTickets(
    query: string,
    filters?: {
      category?: string;
      location?: string;
      date?: Date;
      trending?: boolean;
      sellingFast?: boolean;
      dateRange?: string;
      city?: string;
      bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
    },
    limit = 50,
    offset = 0
  ): Promise<Ticket[]> {
    try {
      const searchFilters = QueryBuilder.buildTicketSearchFilters({
        ...filters,
        query
      });
      
      const queryBuilder = db
        .select()
        .from(tickets)
        .orderBy(desc(tickets.trending), desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);
        
      if (searchFilters) {
        queryBuilder.where(searchFilters);
      }
      
      return await queryBuilder;
    } catch (error) {
      logger.error('STORAGE', 'Error searching tickets:', error);
      return [];
    }
  }
  
  async getTicket(id: number): Promise<Ticket | undefined> {
    const cached = CacheManager.getCacheValue("tickets", id);
    if (cached) return cached;
    
    try {
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
      if (ticket) {
        CacheManager.setCacheWithTTL("tickets", id, ticket, 180000); // 3 min cache
      }
      return ticket;
    } catch (error) {
      logger.error('STORAGE', `Error fetching ticket ${id}:`, error);
      return undefined;
    }
  }
  
  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    try {
      const [ticket] = await db.insert(tickets).values(insertTicket).returning();
      if (ticket) {
        CacheManager.setCacheWithTTL("tickets", ticket.id, ticket, 180000);
        CacheManager.invalidateCache("events"); // Clear events cache
        return ticket;
      }
      throw new Error('Failed to create ticket');
    } catch (error) {
      logger.error('STORAGE', 'Error creating ticket:', error);
      throw error;
    }
  }
  
  async updateTicketStatus(id: number, status: string): Promise<Ticket | undefined> {
    try {
      const [ticket] = await db
        .update(tickets)
        .set({ status } as any)
        .where(eq(tickets.id, id))
        .returning();
      
      if (ticket) {
        CacheManager.invalidateCache("tickets", id);
        CacheManager.setCacheWithTTL("tickets", id, ticket, 180000);
      }
      return ticket;
    } catch (error) {
      logger.error('STORAGE', `Error updating ticket status ${id}:`, error);
      return undefined;
    }
  }
  
  // Batch operations for performance
  async createMultipleTickets(insertTickets: InsertTicket[]): Promise<Ticket[]> {
    try {
      const batches = QueryBuilder.buildBatchInsert(tickets, insertTickets, 100);
      const allTickets: Ticket[] = [];
      
      for (const batch of batches) {
        const batchTickets = await db.insert(tickets).values(batch).returning();
        allTickets.push(...batchTickets);
        
        // Cache each ticket
        batchTickets.forEach(ticket => {
          CacheManager.setCacheWithTTL("tickets", ticket.id, ticket, 180000);
        });
      }
      
      CacheManager.invalidateCache("events"); // Clear events cache
      return allTickets;
    } catch (error) {
      logger.error('STORAGE', 'Error creating multiple tickets:', error);
      throw error;
    }
  }
  
  // Contact requests with optimized filtering
  async getContactRequestsWithFilters(filters: {
    sellerId?: number;
    requesterId?: number;
    status?: string;
    ticketId?: number;
  }): Promise<ContactRequest[]> {
    try {
      const whereCondition = QueryBuilder.buildContactRequestFilters(filters);
      
      const queryBuilder = db
        .select()
        .from(contactRequests)
        .orderBy(desc(contactRequests.createdAt));
        
      if (whereCondition) {
        queryBuilder.where(whereCondition);
      }
      
      return await queryBuilder;
    } catch (error) {
      logger.error('STORAGE', 'Error fetching contact requests:', error);
      return [];
    }
  }
  
  // Popularity tracking with aggregation
  async getTicketPopularityMetrics(ticketId: number): Promise<{
    viewCount: { total: number; unique: number };
    popularity: any;
  } | null> {
    const cacheKey = `popularity:${ticketId}`;
    const cached = CacheManager.getCacheValue("popularity", cacheKey);
    if (cached) return cached;
    
    try {
      const { viewsCondition, popularityCondition, aggregations } = 
        QueryBuilder.buildPopularityQuery(ticketId);
      
      // Get view statistics
      const [viewStats] = await db
        .select(aggregations)
        .from(ticketViews)
        .where(viewsCondition);
      
      // Get popularity data
      const [popularityData] = await db
        .select()
        .from(ticketPopularity)
        .where(popularityCondition);
      
      const result = {
        viewCount: {
          total: viewStats?.totalViews || 0,
          unique: viewStats?.uniqueViews || 0
        },
        popularity: popularityData || null
      };
      
      CacheManager.setCacheWithTTL("popularity", cacheKey, result, 60000); // 1 min cache
      return result;
    } catch (error) {
      logger.error('STORAGE', `Error fetching popularity metrics for ticket ${ticketId}:`, error);
      return null;
    }
  }
  
  // Database health check
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await db.select({ count: count() }).from(users).limit(1);
      return true;
    } catch (error) {
      logger.error('STORAGE', 'Database health check failed:', error);
      return false;
    }
  }
}