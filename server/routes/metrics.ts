import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { logger } from "../utils/logger";
import { sql, count, gte, desc, asc } from "drizzle-orm";
import { tickets, users, ticketViews } from "../../shared/schema";

const router = Router();

// Dashboard metrics endpoint
router.get("/dashboard", async (req, res) => {
  try {
    const startTime = Date.now();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get total views in past 7 days using parameterized query
    const totalViewsResult = await db
      .select({ count: count() })
      .from(ticketViews)
      .where(gte(ticketViews.viewedAt, sevenDaysAgo));
    
    // Get active user count using parameterized query
    const activeUsersResult = await db
      .select({ count: count() })
      .from(users);
    
    // Get popular cities using parameterized query
    const popularCitiesResult = await db
      .select({
        city: tickets.city,
        count: count()
      })
      .from(tickets)
      .where(sql`${tickets.status} = 'available'`)
      .groupBy(tickets.city)
      .orderBy(desc(count()))
      .limit(5);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    const metrics = {
      totalViews: totalViewsResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
      popularCities: popularCitiesResult.map(row => ({
        city: row.city,
        count: row.count
      })),
      avgResponseTime: responseTime,
      recentActivity: Math.floor(Math.random() * 50) + 10 // Simulated recent activity
    };

    logger.info('METRICS', `Dashboard metrics retrieved in ${responseTime}ms`);
    res.json(metrics);
    
  } catch (error) {
    logger.error('METRICS', 'Failed to retrieve dashboard metrics', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Performance analytics endpoint
router.get("/performance", async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Define safe time intervals in milliseconds
    const intervalMappings = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const intervalMs = intervalMappings[timeframe as keyof typeof intervalMappings] || intervalMappings['24h'];
    const cutoffDate = new Date(Date.now() - intervalMs);
    
    // Use parameterized query with Drizzle
    const performanceData = await db
      .select({
        hour: sql`DATE_TRUNC('hour', ${ticketViews.viewedAt})`,
        views: count()
      })
      .from(ticketViews)
      .where(gte(ticketViews.viewedAt, cutoffDate))
      .groupBy(sql`DATE_TRUNC('hour', ${ticketViews.viewedAt})`)
      .orderBy(desc(sql`DATE_TRUNC('hour', ${ticketViews.viewedAt})`))
      .limit(24);
    
    res.json({
      timeframe,
      data: performanceData
    });
    
  } catch (error) {
    logger.error('METRICS', 'Failed to retrieve performance data', error);
    res.status(500).json({ error: 'Failed to retrieve performance data' });
  }
});

export default router;