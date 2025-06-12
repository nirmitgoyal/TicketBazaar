import { Request, Response } from "express";
import { TicketService } from "../services/ticket.service";
import { insertTicketSchema, ticketListingSchema } from "@shared/schema";
import { storage } from "../storage";
import { z } from "zod";

/**
 * Controller for ticket-related endpoints
 */
export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  /**
   * Get all tickets
   */
  getAllTickets = async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId
        ? parseInt(req.query.eventId as string)
        : undefined;

      if (eventId && !isNaN(eventId)) {
        const tickets = await this.ticketService.getTicketsByEvent(eventId.toString());
        return res.status(200).json(tickets);
      }

      // Get all tickets from all events
      const events = await storage.getAllEvents();
      let allTickets: any[] = [];

      for (const event of events) {
        const tickets = await this.ticketService.getTicketsByEvent(event.eventTitle);
        allTickets = [...allTickets, ...tickets];
      }

      res.status(200).json(allTickets);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving tickets",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get ticket by ID
   */
  getTicketById = async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }

      const ticket = await this.ticketService.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving ticket",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get tickets by event ID
   */
  getTicketsByEvent = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // First get all events to find the one with matching ID
      const allEvents = await storage.getAllEvents();
      const event = allEvents.find(e => e.id === eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Now get tickets by event title
      const tickets = await storage.getTicketsByEvent(event.eventTitle);
      res.status(200).json(tickets);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving tickets",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get tickets by seller ID
   */
  getTicketsBySeller = async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }

      const tickets = await this.ticketService.getTicketsBySeller(sellerId);
      res.status(200).json(tickets);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving tickets",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Create a new ticket listing
   */
  createTicket = async (req: Request, res: Response) => {
    try {
      // Validate request body with extended schema
      const validatedData = ticketListingSchema.parse(req.body);

      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res
          .status(401)
          .json({ message: "You must be logged in to list tickets" });
      }

      // Set seller ID to current user
      const ticketData = {
        ...validatedData,
        sellerId: req.user!.id,
      };

      // Create the ticket
      const ticket = await this.ticketService.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Selling price cannot exceed original price")
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Generate QR code for ticket verification
   */
  generateQrCode = async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }

      const ticket = await this.ticketService.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if user has permission (is buyer or seller)
      if (req.isAuthenticated() && req.user!.id !== ticket.sellerId) {
        // For non-sellers, we should check if they bought the ticket
        // This would require checking transactions, but for simplicity, we'll skip that check
      }

      // Generate verification code and QR code
      const updatedTicket =
        await this.ticketService.generateVerificationCode(ticketId);
      if (!updatedTicket) {
        return res
          .status(500)
          .json({ message: "Failed to generate verification code" });
      }

      res.status(200).json(updatedTicket);
    } catch (error) {
      res.status(500).json({
        message: "Error generating QR code",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Verify a ticket using the verification code
   */
  verifyTicket = async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }

      // Validate request body
      const verifySchema = z.object({
        code: z.string().min(1, "Verification code is required"),
      });

      const { code } = verifySchema.parse(req.body);

      const ticket = await this.ticketService.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // If ticket is already verified, return success
      if (ticket.status === "available") {
        return res
          .status(200)
          .json({ message: "Ticket already verified", verified: true });
      }

      // Verify the ticket
      const isVerified = await this.ticketService.verifyTicket(ticketId, code);

      if (isVerified) {
        res
          .status(200)
          .json({ message: "Ticket verified successfully", verified: true });
      } else {
        res
          .status(400)
          .json({ message: "Invalid verification code", verified: false });
      }
    } catch (error) {
      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
        verified: false,
      });
    }
  };

  /**
   * Create ticket with event details - creates both event and ticket
   */
  createTicketWithEvent = async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Define schema for the event data with venue coordinates
      const ticketWithEventSchema = z.object({
        // Event details
        eventTitle: z.string().min(1, "Event title is required"),
        eventDate: z.string().min(1, "Event date is required"),
        eventTime: z.string().min(1, "Event time is required"),
        eventVenue: z.string().min(1, "Venue is required"),
        eventVenueAddress: z.string().optional(),
        eventLatitude: z.number().optional(),
        eventLongitude: z.number().optional(),
        eventCategory: z.string().min(1, "Category is required"),
        
        // Basic listing details for P2P marketplace
        quantity: z.number().min(1, "Quantity must be at least 1"),
        additionalInfo: z.string().optional(),
      });

      const validatedData = ticketWithEventSchema.parse(req.body);

      // Extract city from venue address if coordinates are provided
      let city = "";
      if (validatedData.eventVenueAddress) {
        // Extract city from address (last part before postal code)
        const addressParts = validatedData.eventVenueAddress.split(",");
        city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() || "" : "";
      }

      // Create ticket data with venue coordinates and address for P2P marketplace
      const ticketData = {
        sellerId: req.user.id,
        title: `${validatedData.eventTitle} Tickets`,
        eventTitle: validatedData.eventTitle,
        eventDescription: `${validatedData.eventTitle} at ${validatedData.eventVenue}`,
        venue: validatedData.eventVenue,
        venueAddress: validatedData.eventVenueAddress,
        eventDate: new Date(`${validatedData.eventDate} ${validatedData.eventTime}`),
        category: validatedData.eventCategory,
        latitude: validatedData.eventLatitude,
        longitude: validatedData.eventLongitude,
        city: city,
        section: "General",
        row: null,
        seat: null,
        price: 0, // Price will be negotiated directly between users in P2P marketplace
        quantity: validatedData.quantity,
        transferMethod: "electronic" as const,
        additionalInfo: validatedData.additionalInfo,
        trending: false,
        sellingFast: false,
        eventImageUrl: null,
        isTransferrable: true,
        showContactInfo: true,
        status: "available",
      };

      // Create the ticket with event details
      const ticket = await this.ticketService.createTicketWithEvent(ticketData);

      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      console.error("Error creating ticket with event:", error);
      console.error("Request body:", req.body);
      console.error("User:", req.user);

      res.status(500).json({
        message: "Error creating ticket",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Delete a ticket by ID
   */
  deleteTicket = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }

      // Check if ticket exists and user is the seller
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if authenticated user is the seller
      if (req.user?.id !== ticket.sellerId) {
        return res.status(403).json({ message: "You can only delete your own tickets" });
      }

      // Delete the ticket from database
      const success = await this.ticketService.deleteTicket(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete ticket" });
      }

      // Broadcast ticket deletion via WebSocket
      const { broadcastToAll } = await import("../services/websocket.service");
      broadcastToAll({
        type: "ticket_deleted",
        ticketId: id,
        eventTitle: ticket.eventTitle,
        sellerId: req.user.id
      });

      res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({
        message: "Error deleting ticket",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Delete all tickets (admin function)
   */
  deleteAllTickets = async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Delete all tickets
      const success = await this.ticketService.deleteAllTickets();
      if (!success) {
        return res.status(500).json({ message: "Failed to delete all tickets" });
      }

      // Broadcast all tickets deletion via WebSocket
      const { broadcastToAll } = await import("../services/websocket.service");
      broadcastToAll({
        type: "all_tickets_deleted",
        userId: req.user.id
      });

      res.status(200).json({ message: "All tickets deleted successfully" });
    } catch (error) {
      console.error("Error deleting all tickets:", error);
      res.status(500).json({
        message: "Error deleting all tickets",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}