import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

// Record a ticket view with enhanced tracking
router.post("/track-view", async (req, res) => {
  try {
    const { ticketId } = req.body;
    const userId = req.user?.id;
    
    // Extract tracking information from request
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = req.ip || req.connection.remoteAddress || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor);
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;
    const sessionId = req.sessionID;
    const referrerHeader = req.headers.referer || req.headers.referrer;
    const referrer = Array.isArray(referrerHeader) ? referrerHeader[0] : referrerHeader;

    if (!ticketId) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    // Record the view with enhanced tracking
    const ticketView = await storage.recordTicketViewWithTracking({
      ticketId: parseInt(ticketId),
      userId,
      ipAddress,
      userAgent,
      sessionId,
      referrer,
    });

    res.json({ 
      success: true, 
      data: ticketView,
      message: "View tracked successfully" 
    });
  } catch (error: any) {
    logger.error('POPULARITY', 'Error tracking ticket view', error);
    res.status(500).json({ 
      message: "Failed to track view",
      error: error.message 
    });
  }
});

// Get popularity metrics for a specific ticket
router.get("/metrics/:ticketId", async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const popularity = await storage.getTicketPopularityMetrics(ticketId);
    const viewCount = await storage.getTicketViewCount(ticketId);

    res.json({
      success: true,
      data: {
        popularity: popularity || null,
        viewCount,
        isTracked: !!popularity
      }
    });
  } catch (error: any) {
    logger.error('POPULARITY', `Error fetching metrics for ticket ${req.params.ticketId}`, error);
    res.status(500).json({ 
      message: "Failed to fetch popularity metrics",
      error: error.message 
    });
  }
});

// Get popular tickets (sorted by popularity score)
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const popularTickets = await storage.getPopularTickets(Math.min(limit, 50));

    res.json({
      success: true,
      data: popularTickets,
      count: popularTickets.length
    });
  } catch (error: any) {
    logger.error('POPULARITY', 'Error fetching popular tickets', error);
    res.status(500).json({ 
      message: "Failed to fetch popular tickets",
      error: error.message 
    });
  }
});

// Get trending tickets (sorted by recent activity)
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const trendingTickets = await storage.getTrendingTickets(Math.min(limit, 50));

    res.json({
      success: true,
      data: trendingTickets,
      count: trendingTickets.length
    });
  } catch (error: any) {
    logger.error('POPULARITY', 'Error fetching trending tickets', error);
    res.status(500).json({ 
      message: "Failed to fetch trending tickets",
      error: error.message 
    });
  }
});

// Refresh popularity scores for all tickets (admin endpoint)
router.post("/refresh", async (req, res) => {
  try {
    // Basic rate limiting - only allow refresh once per minute
    const lastRefresh = router.get('lastRefresh') || 0;
    const now = Date.now();
    
    if (now - lastRefresh < 60000) {
      return res.status(429).json({ 
        message: "Refresh can only be called once per minute" 
      });
    }

    router.set('lastRefresh', now);
    
    // Start the refresh process asynchronously
    storage.refreshPopularityScores().catch(error => 
      logger.error('POPULARITY', 'Background refresh failed', error)
    );

    res.json({
      success: true,
      message: "Popularity refresh initiated"
    });
  } catch (error: any) {
    logger.error('POPULARITY', 'Error initiating refresh', error);
    res.status(500).json({ 
      message: "Failed to refresh popularity scores",
      error: error.message 
    });
  }
});

// Get popularity analytics dashboard data
router.get("/analytics", async (req, res) => {
  try {
    const [popularTickets, trendingTickets] = await Promise.all([
      storage.getPopularTickets(10),
      storage.getTrendingTickets(10)
    ]);

    // Calculate total views across all tickets
    const totalViews = popularTickets.reduce((sum, ticket) => 
      sum + (ticket.popularity?.totalViews || 0), 0
    );

    const totalUniqueViews = popularTickets.reduce((sum, ticket) => 
      sum + (ticket.popularity?.uniqueViews || 0), 0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalViews,
          totalUniqueViews,
          averageEngagement: totalViews > 0 ? (totalUniqueViews / totalViews) : 0
        },
        popular: popularTickets,
        trending: trendingTickets
      }
    });
  } catch (error: any) {
    logger.error('POPULARITY', 'Error fetching analytics', error);
    res.status(500).json({ 
      message: "Failed to fetch analytics data",
      error: error.message 
    });
  }
});

export default router;