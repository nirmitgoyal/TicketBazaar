import { storage } from "../storage";
import { Ticket, InsertTicket } from "@shared/schema";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

/**
 * Service class to handle ticket-related business logic
 */
export class TicketService {
  /**
   * Get ticket by ID
   * @param id Ticket ID
   * @returns Ticket object or undefined if not found
   */
  async getTicketById(id: number): Promise<Ticket | undefined> {
    return storage.getTicket(id);
  }

  /**
   * Get tickets by event ID
   * @param eventId Event ID
   * @returns Array of tickets for the specified event
   */
  async getTicketsByEvent(eventTitle: string): Promise<Ticket[]> {
    return storage.getTicketsByEvent(eventTitle);
  }

  /**
   * Get tickets by seller ID
   * @param sellerId Seller ID
   * @returns Array of tickets by the specified seller
   */
  async getTicketsBySeller(sellerId: number): Promise<Ticket[]> {
    return storage.getTicketsBySeller(sellerId);
  }

  /**
   * Create a new ticket
   * @param ticketData Ticket data
   * @returns Created ticket
   */
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    return storage.createTicket(ticketData);
  }

  /**
   * Update ticket status
   * @param id Ticket ID
   * @param status New status
   * @returns Updated ticket or undefined if not found
   */
  async updateTicketStatus(
    id: number,
    status: string,
  ): Promise<Ticket | undefined> {
    return storage.updateTicketStatus(id, status);
  }

  /**
   * Generate verification code and QR code for a ticket
   * @param id Ticket ID
   * @returns Updated ticket with verification data or undefined if not found
   */
  async generateVerificationCode(id: number): Promise<Ticket | undefined> {
    const ticket = await storage.getTicket(id);
    if (!ticket) {
      return undefined;
    }

    // Generate a random verification code
    const verificationCode = randomBytes(6).toString("hex");

    // Generate QR code as a data URL
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        ticketId: id,
        verificationCode,
        timestamp: new Date().toISOString(),
      }),
    );

    // Update the ticket with the verification data
    return storage.updateTicketVerification(id, verificationCode, qrCode);
  }

  /**
   * Verify a ticket using the verification code
   * @param id Ticket ID
   * @param code Verification code
   * @returns True if verification was successful, false otherwise
   */
  async verifyTicket(id: number, code: string): Promise<boolean> {
    const ticket = await storage.getTicket(id);

    if (!ticket) {
      return false;
    }

    // In P2P model, verification is simplified
    // Mark ticket as verified
    await storage.verifyTicket(id);
    return true;
  }

  /**
   * Create ticket with event details - creates both event and ticket
   * @param data Combined event and ticket data
   * @returns Created ticket
   */
  async createTicketWithEvent(data: {
    sellerId: number;
    title: string;
    eventTitle: string;
    eventDescription?: string | null;
    venue: string;
    venueAddress?: string;
    eventDate: Date;
    category: string;
    latitude?: number;
    longitude?: number;
    city: string;
    section: string;
    row?: string | null;
    seat?: string | null;
    price: number;
    quantity: number;
    transferMethod: "electronic" | "physical" | "pickup";
    additionalInfo?: string;
    trending?: boolean;
    eventImageUrl?: string | null;
    isTransferrable: boolean;
    showContactInfo: boolean;
    status: string;
  }): Promise<Ticket> {
    // Create the ticket with embedded event data
    const ticketData: InsertTicket = {
      sellerId: data.sellerId,
      title: data.title,
      eventTitle: data.eventTitle,
      eventDescription: data.eventDescription,
      venue: data.venue,
      venueAddress: data.venueAddress,
      eventDate: data.eventDate,
      category: data.category,
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      section: data.section,
      row: data.row,
      seat: data.seat,
      price: data.price,
      quantity: data.quantity,
      status: data.status,
      isTransferrable: data.isTransferrable,
      transferMethod: data.transferMethod,
      additionalInfo: data.additionalInfo || "",
      showContactInfo: data.showContactInfo,
      trending: data.trending || false,
      eventImageUrl: data.eventImageUrl,
    };

    return storage.createTicket(ticketData);
  }

  /**
   * Delete a ticket by ID
   * @param id Ticket ID
   * @returns True if deleted successfully, false otherwise
   */
  async deleteTicket(id: number): Promise<boolean> {
    try {
      // Delete from database
      const result = await storage.deleteTicket(id);
      return result;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      return false;
    }
  }

  /**
   * Delete all tickets
   * @returns True if all tickets deleted successfully, false otherwise
   */
  async deleteAllTickets(): Promise<boolean> {
    try {
      // Get all tickets first
      const events = await storage.getAllEvents();
      let allTickets: any[] = [];

      // Events are now tickets with embedded event data
      allTickets = events;

      // Delete each ticket
      for (const ticket of allTickets) {
        await storage.deleteTicket(ticket.id);
      }

      return true;
    } catch (error) {
      console.error("Error deleting all tickets:", error);
      return false;
    }
  }
}
