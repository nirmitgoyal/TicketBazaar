/**
 * Refactored Ticket Controller
 * Uses the base CRUD controller for common operations
 */

import { Request, Response } from "express";
import { BaseCrudController } from "./base-crud.controller";
import { tickets, insertTicketSchema, Ticket } from "@shared/schema";
import { desc, eq, and, or, like, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { unifiedCommunicationService } from "../services/unified-communication.service";
import { unifiedVerificationService } from "../services/unified-verification.service";
import { logger } from "../utils/logger";
import { z } from "zod";

export class RefactoredTicketController extends BaseCrudController<Ticket> {
  constructor() {
    super({
      tableName: 'ticket',
      table: tickets,
      createSchema: insertTicketSchema,
      defaultOrderBy: desc(tickets.createdAt),
      searchFields: ['title', 'eventTitle', 'city', 'venue']
    });
  }

  /**
   * Override getAll to add custom search logic
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const city = req.query.city as string;
      const minDate = req.query.minDate as string;
      const maxDate = req.query.maxDate as string;
      const offset = (page - 1) * limit;

      // Build query with filters
      let conditions = [];
      
      // Only show available tickets
      conditions.push(eq(tickets.status, 'available'));

      // Search filter
      if (search) {
        conditions.push(
          or(
            like(tickets.title, `%${search}%`),
            like(tickets.eventTitle, `%${search}%`),
            like(tickets.venue, `%${search}%`),
            like(tickets.city, `%${search}%`)
          )
        );
      }

      // Category filter
      if (category) {
        conditions.push(eq(tickets.category, category));
      }

      // City filter
      if (city) {
        conditions.push(eq(tickets.city, city));
      }

      // Date range filter
      if (minDate) {
        conditions.push(gte(tickets.eventDate, new Date(minDate)));
      }
      if (maxDate) {
        conditions.push(lte(tickets.eventDate, new Date(maxDate)));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      // Get total count for pagination
      const totalCountResult = await db
        .select({ count: tickets.id })
        .from(tickets)
        .where(whereClause);
      const totalCount = totalCountResult.length;

      // Get paginated results
      const results = await db
        .select()
        .from(tickets)
        .where(whereClause)
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching tickets');
    }
  }

  /**
   * Get tickets by event
   */
  async getByEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventTitle = req.params.eventTitle;
      
      const results = await db
        .select()
        .from(tickets)
        .where(
          and(
            eq(tickets.eventTitle, eventTitle),
            eq(tickets.status, 'available')
          )
        )
        .orderBy(desc(tickets.createdAt));

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching tickets by event');
    }
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      const results = await db
        .select()
        .from(tickets)
        .where(eq(tickets.sellerId, userId))
        .orderBy(desc(tickets.createdAt));

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching user tickets');
    }
  }

  /**
   * Override create to add seller ID and verification
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      // Validate input
      const data = insertTicketSchema.parse(req.body);
      
      // Add seller ID
      const ticketData = {
        ...data,
        sellerId: userId
      };

      // Create ticket
      const result = await db
        .insert(tickets)
        .values(ticketData)
        .returning();

      const newTicket = result[0];

      // Verify the ticket
      const verification = await unifiedVerificationService.verifyTicket(
        newTicket,
        req.user as any,
        'enhanced'
      );

      // Send notification
      await unifiedCommunicationService.sendTicketUpdate(
        req.user as any,
        newTicket,
        'created'
      );

      logger.info('TICKET', 'Ticket created', { 
        ticketId: newTicket.id, 
        userId 
      });

      res.status(201).json({
        success: true,
        data: newTicket,
        verification: {
          verified: verification.verified,
          trustScore: verification.trustScore,
          riskLevel: verification.riskLevel
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        this.handleError(error, res, 'Error creating ticket');
      }
    }
  }

  /**
   * Mark ticket as sold
   */
  async markAsSold(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      // Check ownership
      const ticket = await db
        .select()
        .from(tickets)
        .where(
          and(
            eq(tickets.id, ticketId),
            eq(tickets.sellerId, userId)
          )
        )
        .limit(1);

      if (!ticket || ticket.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found or unauthorized'
        });
        return;
      }

      // Update status
      const result = await db
        .update(tickets)
        .set({ 
          status: 'sold',
          availabilityStatus: 'sold'
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      // Send notification
      await unifiedCommunicationService.sendTicketUpdate(
        req.user as any,
        result[0],
        'updated'
      );

      logger.info('TICKET', 'Ticket marked as sold', { 
        ticketId, 
        userId 
      });

      res.json({
        success: true,
        data: result[0]
      });
    } catch (error) {
      this.handleError(error, res, 'Error marking ticket as sold');
    }
  }

  /**
   * Get trending tickets
   */
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const results = await db
        .select()
        .from(tickets)
        .where(
          and(
            eq(tickets.status, 'available'),
            eq(tickets.trending, true)
          )
        )
        .orderBy(desc(tickets.boostScore))
        .limit(10);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching trending tickets');
    }
  }

  /**
   * Override delete to check ownership
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      // Check ownership
      const ticket = await db
        .select()
        .from(tickets)
        .where(
          and(
            eq(tickets.id, ticketId),
            eq(tickets.sellerId, userId)
          )
        )
        .limit(1);

      if (!ticket || ticket.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found or unauthorized'
        });
        return;
      }

      // Delete ticket
      await db
        .delete(tickets)
        .where(eq(tickets.id, ticketId));

      // Send notification
      await unifiedCommunicationService.sendTicketUpdate(
        req.user as any,
        ticket[0],
        'deleted'
      );

      logger.info('TICKET', 'Ticket deleted', { 
        ticketId, 
        userId 
      });

      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      this.handleError(error, res, 'Error deleting ticket');
    }
  }
}