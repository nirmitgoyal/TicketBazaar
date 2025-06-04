import { Request, Response } from "express";
import { EventService } from "../services";
import { z } from "zod";

/**
 * Controller for event-related endpoints
 */
export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  /**
   * Get all events
   */
  getAllEvents = async (req: Request, res: Response) => {
    try {
      const events = await this.eventService.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get event by ID
   */
  getEventById = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await this.eventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get events by category
   */
  getEventsByCategory = async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }

      const events = await this.eventService.getEventsByCategory(category);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving events by category",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Search events with filters
   */
  searchEvents = async (req: Request, res: Response) => {
    try {
      // Parse and validate query parameters
      const querySchema = z.object({
        q: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        city: z.string().optional(),
        date: z
          .string()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
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
        dateRange: z.string().optional(),
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

      // Prepare search parameters
      const searchQuery = query.q || "";
      const filters: any = {};

      if (query.category) filters.category = query.category;
      if (query.location) filters.location = query.location;
      if (query.city) filters.city = query.city;
      if (query.date) filters.date = query.date;
      if (query.minPrice) filters.minPrice = query.minPrice;
      if (query.maxPrice) filters.maxPrice = query.maxPrice;
      if (query.trending !== undefined) filters.trending = query.trending;
      if (query.sellingFast !== undefined)
        filters.sellingFast = query.sellingFast;
      if (query.dateRange) filters.dateRange = query.dateRange;

      // Add map bounds if all coordinates are provided
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

      const events = await this.eventService.searchEvents(searchQuery, filters);
      res.status(200).json(events);
    } catch (error) {
      res.status(400).json({
        message: "Invalid search parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get event heatmap
   */
  getEventHeatMap = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const heatmapData = await this.eventService.getEventHeatMap(eventId);
      res.status(200).json(heatmapData);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving event heatmap",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
