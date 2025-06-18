import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { logger } from "../utils/logger";

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
      totalViews: parseInt(totalViewsQuery.rows[0]?.count || '0'),
      activeUsers: parseInt(activeUsersQuery.rows[0]?.count || '0'),
      popularCities: popularCitiesQuery.rows.map((row: any) => ({
        city: row.city,
        count: parseInt(row.count)
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
    
    let interval;
    switch (timeframe) {
      case '1h': interval = '1 hour'; break;
      case '24h': interval = '24 hours'; break;
      case '7d': interval = '7 days'; break;
      default: interval = '24 hours';
    }
    
    const performanceData = await db.execute(`
      SELECT 
        DATE_TRUNC('hour', viewed_at) as hour,
        COUNT(*) as views
      FROM ticket_views 
      WHERE viewed_at > NOW() - INTERVAL '${interval}'
      GROUP BY hour 
      ORDER BY hour DESC
      LIMIT 24
    `);
    
    res.json({
      timeframe,
      data: performanceData.rows
    });
    
  } catch (error) {
    logger.error('METRICS', 'Failed to retrieve performance data', error);
    res.status(500).json({ error: 'Failed to retrieve performance data' });
  }
});

export default router;