import { Router } from "express";
import { EventDiscoveryService } from "../services/event-discovery.service";
import { logger } from "../utils/logger";

const router = Router();
const eventDiscoveryService = new EventDiscoveryService();

// POST /api/event-discovery - Discover events in a location
router.post("/", async (req, res) => {
  try {
    const { location, category, dateRange, radius } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: "Location is required"
      });
    }

    const request = {
      location,
      category,
      dateRange: dateRange ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      } : undefined,
      radius
    };

    const events = await eventDiscoveryService.discoverEvents(request);

    logger.info('express', `Event discovery completed for ${location}, found ${events.length} events`);

    res.json({
      success: true,
      data: events,
      meta: {
        location,
        count: events.length,
        searchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('SERVER', `Error in event discovery: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to discover events"
    });
  }
});

// GET /api/event-discovery/locations?q=query - Get location suggestions
router.get("/locations", async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required"
      });
    }

    const suggestions = await eventDiscoveryService.getLocationSuggestions(query);

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    logger.error('SERVER', `Error getting location suggestions: ${error}`);
    res.status(500).json({
      success: false,
      error: "Failed to get location suggestions"
    });
  }
});

export default router;