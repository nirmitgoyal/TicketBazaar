import { storage } from "../storage";
import { Event, InsertEvent } from "@shared/schema";

/**
 * Type definition for search filters
 */
export interface EventSearchFilters {
  category?: string;
  location?: string;
  date?: Date;
  dateRange?: string;
  minPrice?: number;
  maxPrice?: number;
  trending?: boolean;
  sellingFast?: boolean;
  city?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Service class to handle event-related business logic
 */
export class EventService {
  /**
   * Get event by ID
   * @param id Event ID
   * @returns Event object or undefined if not found
   */
  async getEventById(id: number): Promise<Event | undefined> {
    return storage.getEvent(id);
  }

  /**
   * Get all events
   * @returns Array of events
   */
  async getAllEvents(): Promise<Event[]> {
    return storage.getAllEvents();
  }

  /**
   * Get events by category
   * @param category Category name
   * @returns Array of events in the specified category
   */
  async getEventsByCategory(category: string): Promise<Event[]> {
    return storage.getEventsByCategory(category);
  }

  /**
   * Create a new event
   * @param eventData Event data
   * @returns Created event
   */
  async createEvent(eventData: InsertEvent): Promise<Event> {
    return storage.createEvent(eventData);
  }

  /**
   * Search events with filters
   * @param query Search query string
   * @param filters Search filters
   * @returns Array of matching events
   */
  async searchEvents(
    query: string,
    filters?: EventSearchFilters,
  ): Promise<Event[]> {
    return storage.searchEvents(query, filters);
  }

  /**
   * Get event heat map data
   * @param eventId Event ID
   * @returns Venue map with section data
   */
  async getEventHeatMap(eventId: number): Promise<any> {
    return storage.getEventHeatMap(eventId);
  }
}
