import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

// Get personalized recommendations for authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's browsing history and preferences
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all events to analyze
    const allEvents = await storage.getAllEvents();

    // Simple recommendation algorithm based on:
    // 1. User's past event categories from viewed tickets
    // 2. Popular events in major cities
    // 3. Trending events
    // 4. Events similar to user's interests

    const recommendations = [];
    const userEventCategories = new Set();
    const userCities = new Set();

    // Analyze user's ticket viewing history for preferences
    const viewedTickets = await storage.getUserTicketViews(userId);
    for (const view of viewedTickets) {
      const ticket = await storage.getTicket(view.ticketId);
      if (ticket) {
        userEventCategories.add(ticket.category.toLowerCase());
        userCities.add(ticket.venue.toLowerCase());
      }
    }

    // Score events based on user preferences
    const scoredEvents = allEvents.map((event) => {
      let score = 0;

      // Boost events in user's preferred categories
      if (userEventCategories.has(event.category.toLowerCase())) {
        score += 3;
      }

      // Boost events in user's cities
      if (userCities.has(event.venue.toLowerCase())) {
        score += 2;
      }

      // Boost trending events
      if (event.trending) {
        score += 2;
      }

      // Boost selling fast events
      if (event.sellingFast) {
        score += 1;
      }

      // Boost recent events (future events)
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      if (eventDate > now) {
        score += 1;
      }

      // Small random factor for variety
      score += Math.random() * 0.5;

      return { ...event, recommendationScore: score };
    });

    // Sort by score and filter future events
    const futureEvents = scoredEvents
      .filter((event) => new Date(event.eventDate) > new Date())
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 12); // Return top 12 recommendations

    res.json(futureEvents);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// Get popular events for non-authenticated users
router.get("/popular", async (req, res) => {
  try {
    const allEvents = await storage.getAllEvents();

    // Score events based on popularity factors
    const scoredEvents = allEvents.map((event) => {
      let score = 0;

      // Boost trending events heavily
      if (event.trending) {
        score += 5;
      }

      // Boost selling fast events
      if (event.sellingFast) {
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
      if (majorCities.includes(event.venue.toLowerCase())) {
        score += 2;
      }

      // Boost popular categories
      const popularCategories = ["concert", "sports", "comedy"];
      if (popularCategories.includes(event.category.toLowerCase())) {
        score += 1;
      }

      // Boost future events
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      if (eventDate > now) {
        score += 2;
      }

      // Small random factor for variety
      score += Math.random() * 0.3;

      return { ...event, popularityScore: score };
    });

    // Sort by score and filter future events
    const popularEvents = scoredEvents
      .filter((event) => new Date(event.eventDate) > new Date())
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 12);

    res.json(popularEvents);
  } catch (error) {
    console.error("Error getting popular events:", error);
    res.status(500).json({ error: "Failed to get popular events" });
  }
});

export default router;
