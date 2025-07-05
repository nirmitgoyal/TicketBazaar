import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import passport from "passport";
import QRCode from "qrcode";
import { tickets as ticketsTable } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

// Base controller with common functionality
export class BaseController {
  protected sendSuccess(res: Response, data: any, status = 200) {
    res.status(status).json(data);
  }

  protected sendError(res: Response, message: string, status = 500) {
    res.status(status).json({ message });
  }

  protected handleError(error: any, res: Response) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// User controller for authentication and user management
export class UserController extends BaseController {
  // User registration - removed as we're using Google OAuth
  public register = async (req: Request, res: Response) => {
    return this.sendError(res, "Registration is handled through Google OAuth", 501);
  };

  // User login - removed as we're using Google OAuth
  public login = (req: Request, res: Response, next: NextFunction) => {
    return this.sendError(res, "Login is handled through Google OAuth", 501);
  };

  // Get current authenticated user
  public getCurrentUser = (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return this.sendError(res, "Not authenticated", 401);
      }
      this.sendSuccess(res, req.user);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Logout user
  public logout = (req: Request, res: Response, next: NextFunction) => {
    try {
      req.logout((err) => {
        if (err) return next(err);
        this.sendSuccess(res, { message: "Logged out successfully" });
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Update user phone number
  public updatePhone = async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return this.sendError(res, "Not authenticated", 401);
      }

      const { phone } = req.body;
      const userId = (req.user as any).id;

      // Update the user's phone number
      const updatedUser = await storage.updateUserPhone(userId, phone);

      if (!updatedUser) {
        return this.sendError(res, "Failed to update phone number", 500);
      }

      // Remove password for security
      const { password, ...userWithoutPassword } = updatedUser;
      this.sendSuccess(res, { user: userWithoutPassword });
    } catch (error) {
      console.error("Update phone error:", error);
      this.sendError(res, "Failed to update phone number", 500);
    }
  };
}

// Event controller for event-related operations
export class EventController extends BaseController {
  // Get all events
  public getAllEvents = async (req: Request, res: Response) => {
    try {
      // Get all available tickets (which contain embedded event data)
      const ticketResults = await db.select().from(ticketsTable)
        .where(eq(ticketsTable.status, 'available'))
        .orderBy(desc(ticketsTable.eventDate), desc(ticketsTable.createdAt))
        .limit(100);
      this.sendSuccess(res, ticketResults);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get event by ID
  public getEventById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid event ID", 400);
      }

      // Get tickets for this event to check if it exists
      const tickets = await storage.getTicketsByEvent(id.toString());
      if (!tickets || tickets.length === 0) {
        return this.sendError(res, "Event not found", 404);
      }
      
      const event = tickets[0]; // Use first ticket as event data

      this.sendSuccess(res, event);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get events by category
  public getEventsByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const ticketResults = await db.select().from(ticketsTable)
        .where(eq(ticketsTable.category, category))
        .orderBy(desc(ticketsTable.eventDate))
        .limit(50);
      this.sendSuccess(res, ticketResults);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Search events with filters
  public searchEvents = async (req: Request, res: Response) => {
    try {
      // Get query parameters
      const query = typeof req.query.q === "string" ? req.query.q : "";
      const category =
        typeof req.query.category === "string" ? req.query.category : undefined;
      const location =
        typeof req.query.location === "string" ? req.query.location : undefined;
      const dateRange =
        typeof req.query.dateRange === "string"
          ? req.query.dateRange
          : undefined;
      const trending = req.query.trending === "true" ? true : undefined;
      const sellingFast = req.query.sellingFast === "true" ? true : undefined;
      const city =
        typeof req.query.city === "string" ? req.query.city : undefined;

      // Parse price filters
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;

      // Parse map bounds
      const north = req.query.north
        ? parseFloat(req.query.north as string)
        : undefined;
      const south = req.query.south
        ? parseFloat(req.query.south as string)
        : undefined;
      const east = req.query.east
        ? parseFloat(req.query.east as string)
        : undefined;
      const west = req.query.west
        ? parseFloat(req.query.west as string)
        : undefined;

      // Create bounds object if all coordinates are provided
      const bounds =
        north && south && east && west
          ? { north, south, east, west }
          : undefined;

      // Parse date
      let date: Date | undefined = undefined;
      if (req.query.date && typeof req.query.date === "string") {
        try {
          date = new Date(req.query.date);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            date = undefined;
          }
        } catch (e) {
          date = undefined;
        }
      }

      console.log(`Searching events with query: "${query}" and filters:`, {
        category,
        location,
        date,
        dateRange,
        minPrice,
        maxPrice,
        trending,
        sellingFast,
        city,
        bounds,
      });

      // Perform the search with filters directly on tickets table
      const searchResults = await storage.searchTickets(query);

      console.log(
        `Found ${searchResults.length} tickets for query "${query}" with applied filters`,
      );

      this.sendSuccess(res, searchResults);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get event heat map
  public getEventHeatMap = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return this.sendError(res, "Invalid event ID", 400);
      }

      // Check if event exists by getting tickets
      const tickets = await storage.getTicketsByEvent(eventId.toString());
      if (!tickets || tickets.length === 0) {
        return this.sendError(res, "Event not found", 404);
      }

      const heatMapData = await storage.getEventHeatMap(eventId);
      this.sendSuccess(res, heatMapData);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Create a new event (not supported in P2P model)
  public createEvent = async (req: Request, res: Response) => {
    try {
      return this.sendError(res, "Event creation not supported in P2P model. Create tickets instead.", 400);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}

// Ticket controller for ticket-related operations
export class TicketController extends BaseController {
  // Get all tickets
  public getAllTickets = async (req: Request, res: Response) => {
    try {
      // This endpoint will return all tickets in the system
      // Will be used by client to get details of tickets referenced in transactions
      const eventId = req.query.eventId
        ? parseInt(req.query.eventId as string)
        : undefined;

      if (eventId && !isNaN(eventId)) {
        const tickets = await storage.getTicketsByEvent(eventId.toString());
        return this.sendSuccess(res, tickets);
      }

      // Get all available tickets (which contain embedded event data)
      const allTickets = await db.select().from(ticketsTable)
        .where(eq(ticketsTable.status, 'available'))
        .orderBy(desc(ticketsTable.eventDate), desc(ticketsTable.createdAt))
        .limit(100);

      this.sendSuccess(res, allTickets);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get ticket by ID
  public getTicketById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid ticket ID", 400);
      }

      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return this.sendError(res, "Ticket not found", 404);
      }

      this.sendSuccess(res, ticket);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get tickets by event
  public getTicketsByEvent = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return this.sendError(res, "Invalid event ID", 400);
      }

      const tickets = await storage.getTicketsByEvent(eventId.toString());
      this.sendSuccess(res, tickets);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get tickets by seller
  public getTicketsBySeller = async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return this.sendError(res, "Invalid seller ID", 400);
      }

      const tickets = await storage.getTicketsBySeller(sellerId);
      this.sendSuccess(res, tickets);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Create a new ticket
  public createTicket = async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has Instagram handle - MISSION CRITICAL GATE
      const user = await storage.getUser(req.user.id);
      if (!user || !user.instagram) {
        return res.status(403).json({ 
          message: "Instagram handle required", 
          error: "INSTAGRAM_HANDLE_REQUIRED",
          requiresInstagram: true 
        });
      }

      // P2P model - no price validation needed as prices are negotiated directly

      const newTicket = await storage.createTicket(req.body);
      this.sendSuccess(res, newTicket, 201);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Generate QR code for ticket
  public generateQRCode = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid ticket ID", 400);
      }

      // Get the ticket
      let ticket = await storage.getTicket(id);
      if (!ticket) {
        return this.sendError(res, "Ticket not found", 404);
      }

      // P2P model - generate simple QR code with ticket info
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        eventTitle: ticket.eventTitle,
        sellerId: ticket.sellerId,
        quantity: ticket.quantity,
        timestamp: new Date().toISOString(),
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData);

      this.sendSuccess(res, ticket);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // P2P model - simplified ticket info endpoint
  public getTicketInfo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid ticket ID", 400);
      }

      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return this.sendError(res, "Ticket not found", 404);
      }

      // Return ticket info for P2P verification
      this.sendSuccess(res, {
        message: "Ticket information retrieved",
        ticket,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };
}

// Contact Request controller for P2P model
export class ContactRequestController extends BaseController {
  // Create a new contact request
  public createContactRequest = async (req: Request, res: Response) => {
    try {
      const newContactRequest = await storage.createContactRequest(req.body);
      this.sendSuccess(res, newContactRequest, 201);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get contact requests for a seller
  public getSellerContactRequests = async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return this.sendError(res, "Invalid seller ID", 400);
      }

      const contactRequests = await storage.getSellerContactRequests(sellerId);
      this.sendSuccess(res, contactRequests);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get contact requests made by a user
  public getUserContactRequests = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return this.sendError(res, "Invalid user ID", 400);
      }

      const contactRequests = await storage.getUserContactRequests(userId);
      this.sendSuccess(res, contactRequests);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Update contact request status
  public updateContactRequestStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid contact request ID", 400);
      }

      const updatedContactRequest = await storage.updateContactRequestStatus(
        id,
        req.body.status,
      );
      this.sendSuccess(res, updatedContactRequest);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}

// Pure P2P model - ratings system removed
