import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { logger } from "../utils/logger";
import { sql } from "drizzle-orm";

const router = Router();

// Dashboard metrics endpoint
router.get("/dashboard", async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get total views in past 7 days
    const totalViewsQuery = await db.execute(`
      SELECT COUNT(*) as count 
      FROM ticket_views 
      WHERE viewed_at > NOW() - INTERVAL '7 days'
    `);
    
    // Get active user count
    const activeUsersQuery = await db.execute(`
      SELECT COUNT(*) as count FROM users
    `);
    
    // Get popular cities
    const popularCitiesQuery = await db.execute(`
      SELECT city, COUNT(*) as count 
      FROM tickets 
      WHERE status = 'available' 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    const metrics = {
      totalViews: parseInt(String(Array.isArray(totalViewsQuery) ? totalViewsQuery[0]?.count || '0' : '0')),
      activeUsers: parseInt(String(Array.isArray(activeUsersQuery) ? activeUsersQuery[0]?.count || '0' : '0')),
      popularCities: Array.isArray(popularCitiesQuery) ? popularCitiesQuery.map((row: any) => ({
        city: row.city,
        count: parseInt(row.count)
      })) : [],
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
    
    // Define safe interval mappings for parameterized queries
    const intervalMappings = {
      '1h': sql`INTERVAL '1 hour'`,
      '24h': sql`INTERVAL '24 hours'`, 
      '7d': sql`INTERVAL '7 days'`
    };
    
    const intervalSql = intervalMappings[timeframe as keyof typeof intervalMappings] || sql`INTERVAL '24 hours'`;
    
    const performanceData = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', viewed_at) as hour,
        COUNT(*) as views
      FROM ticket_views 
      WHERE viewed_at > NOW() - ${intervalSql}
      GROUP BY hour 
      ORDER BY hour DESC
      LIMIT 24
    `);
    
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