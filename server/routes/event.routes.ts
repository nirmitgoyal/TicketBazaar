import { Router } from "express";
import { validateBody } from "../middleware/validation.middleware";
import { Ticket } from "@shared/schema";
import { EventController } from "../controllers/index";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";
import { storage } from "../storage";
import {
  fetchEventsFromInternet,
  saveEventsToDatabase,
} from "../event-fetcher";

const router = Router();
const eventController = new EventController();

// Simple in-memory cache for events
const eventsCache = new Map<string, { data: any[], timestamp: number }>();
const EVENTS_CACHE_TTL = 60000; // 60 seconds cache

// Get all events
router.get("/", async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'all_events';
    const cached = eventsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < EVENTS_CACHE_TTL) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Get fresh data
    const events = await storage.getAllEvents();
    
    // Cache the result
    eventsCache.set(cacheKey, { data: events, timestamp: Date.now() });
    
    res.set('X-Cache', 'MISS');
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get popular events for non-authenticated users
router.get("/popular", async (req, res) => {
  try {
    const allEvents = await storage.getAllEvents();

    // Score events based on popularity factors
    const scoredEvents = allEvents.map((ticket: Ticket) => {
      let score = 0;

      // Boost trending events heavily
      if (ticket.trending) {
        score += 5;
      }

      // Boost selling fast events
      if (ticket.sellingFast) {
        score += 3;
      }

      // Boost events in major cities
      const majorCities = [
        "mumbai",
        "delhi",
        "bangalore",
        "hyderabad",
        "chennai",
        "kolkata",
      ];
      if (ticket.city && majorCities.includes(ticket.city.toLowerCase())) {
        score += 2;
      }

      // Boost popular categories
      const popularCategories = ["concert", "sports", "comedy"];
      if (popularCategories.includes(ticket.category.toLowerCase())) {
        score += 1;
      }

      // Boost future events
      const eventDate = new Date(ticket.eventDate);
      const now = new Date();
      if (eventDate > now) {
        score += 2;
      }

      // Small random factor for variety
      score += Math.random() * 0.3;

      return { ...ticket, popularityScore: score };
    });

    // Sort by score and filter future events
    const popularEvents = scoredEvents
      .filter((event: any) => new Date(event.date) > new Date())
      .sort((a: any, b: any) => b.popularityScore - a.popularityScore)
      .slice(0, 12);

    res.json(popularEvents);
  } catch (error) {
    console.error("Error getting popular events:", error);
    res.status(500).json({ error: "Failed to get popular events" });
  }
});

// Search events (must come before /:id route)
router.get("/search", eventController.searchEvents);

// Get events by category
router.get("/category/:category", eventController.getEventsByCategory);

// Get event by ID
router.get("/:id", eventController.getEventById);

// Get event heat map
router.get("/:id/heatmap", eventController.getEventHeatMap);

// Create event (admin only)
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  // validateBody(insertTicketSchema), // Temporarily commented out
  eventController.createEvent,
);

// Fetch real events from the internet and populate database
router.post(
  "/fetch-from-internet",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      console.log("Starting to fetch real events from the internet...");

      // Fetch events from various sources
      const events = await fetchEventsFromInternet();

      if (events.length === 0) {
        return res.status(404).json({
          message: "No events found from internet sources",
          success: false,
        });
      }

      // Save events to database
      await saveEventsToDatabase(events);

      console.log(`Successfully fetched and saved ${events.length} events`);

      res.json({
        message: `Successfully fetched and saved ${events.length} real events from the internet`,
        count: events.length,
        events: events,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching events from internet:", error);
      res.status(500).json({
        message: "Failed to fetch events from internet",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      });
    }
  },
);

export default router;
