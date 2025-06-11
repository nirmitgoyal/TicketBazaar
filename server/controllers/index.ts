import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import passport from "passport";
import QRCode from "qrcode";
import { userRegisterSchema, userLoginSchema } from "@shared/schema";
import { z } from "zod";

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
  // User registration
  public register = async (req: Request, res: Response) => {
    try {
      // Validate request body using the registration schema
      const validatedData = userRegisterSchema.parse(req.body);
      
      const { password, confirmPassword, fullName, email, phone, instagram, preferredContactMethod } = validatedData;

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return this.sendError(res, "Email already exists", 400);
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user (exclude confirmPassword from creation)
      const newUser = await storage.createUser({
        password: hashedPassword,
        fullName,
        email,
        phone: phone || "",
        instagram,
        preferredContactMethod: preferredContactMethod || "whatsapp",
        rating: 5.0,
        ratingsCount: 0,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      this.sendSuccess(res, { 
        message: "User registered successfully", 
        user: userWithoutPassword 
      }, 201);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return this.sendError(res, error.errors[0].message, 400);
      }
      this.handleError(error, res);
    }
  };

  // User login
  public login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return this.handleError(err, res);
      }
      if (!user) {
        return this.sendError(res, info?.message || "Invalid username or password", 401);
      }

      req.login(user, (err: any) => {
        if (err) {
          return this.handleError(err, res);
        }
        return this.sendSuccess(res, { message: "Login successful", user });
      });
    })(req, res, next);
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
      const events = await storage.getAllEvents();
      this.sendSuccess(res, events);
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
      const events = await storage.getEventsByCategory(category);
      this.sendSuccess(res, events);
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

      // Perform the search with filters
      const events = await storage.searchEvents(query, {
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

      console.log(
        `Found ${events.length} events for query "${query}" with applied filters`,
      );

      this.sendSuccess(res, events);
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

      // Get all tickets from all events
      const events = await storage.getAllEvents();
      let allTickets: any[] = [];

      // Events are now tickets with embedded event data
      allTickets = events;

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
      // Make sure selling price is not greater than original price
      if (req.body.sellingPrice > req.body.originalPrice) {
        return this.sendError(
          res,
          "Selling price cannot exceed original price",
          400,
        );
      }

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
        price: ticket.price,
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

// Pure P2P model - disputes removed

// Review controller for review-related operations
export class ReviewController extends BaseController {
  // Get review by ID
  public getReviewById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid review ID", 400);
      }

      const review = await storage.getReview(id);
      if (!review) {
        return this.sendError(res, "Review not found", 404);
      }

      this.sendSuccess(res, review);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get reviews for user
  public getUserReviews = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return this.sendError(res, "Invalid user ID", 400);
      }

      const reviews = await storage.getUserReviews(userId);
      this.sendSuccess(res, reviews);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Get reviews by reviewer
  public getReviewsByReviewer = async (req: Request, res: Response) => {
    try {
      const reviewerId = parseInt(req.params.reviewerId);
      if (isNaN(reviewerId)) {
        return this.sendError(res, "Invalid reviewer ID", 400);
      }

      const reviews = await storage.getReviewsByReviewer(reviewerId);
      this.sendSuccess(res, reviews);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Create a new review
  public createReview = async (req: Request, res: Response) => {
    try {
      // Check if user already reviewed this contact request
      const existingReview = await storage.getUserReviewForContactRequest(
        req.body.userId,
        req.body.contactRequestId,
      );

      if (existingReview) {
        return this.sendError(
          res,
          "You have already reviewed this contact request",
          400,
        );
      }

      const newReview = await storage.createReview(req.body);

      // Update user rating
      const userReviews = await storage.getUserReviews(req.body.userId);
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        const averageRating = totalRating / userReviews.length;
        await storage.updateUserRating(req.body.userId, averageRating);
      }

      this.sendSuccess(res, newReview, 201);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Update a review
  public updateReview = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid review ID", 400);
      }

      const review = await storage.getReview(id);
      if (!review) {
        return this.sendError(res, "Review not found", 404);
      }

      // Check if the authenticated user is the reviewer
      if (req.user?.id !== review.reviewerId) {
        return this.sendError(res, "You can only update your own reviews", 403);
      }

      const updatedReview = await storage.updateReview(
        id,
        req.body.rating,
        req.body.comment,
      );

      if (!updatedReview) {
        return this.sendError(res, "Failed to update review", 500);
      }

      // Update user rating
      const userReviews = await storage.getUserReviews(review.userId);
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        const averageRating = totalRating / userReviews.length;
        await storage.updateUserRating(review.userId, averageRating);
      }

      this.sendSuccess(res, updatedReview);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // Delete a review
  public deleteReview = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return this.sendError(res, "Invalid review ID", 400);
      }

      const review = await storage.getReview(id);
      if (!review) {
        return this.sendError(res, "Review not found", 404);
      }

      // Check if the authenticated user is the reviewer
      if (req.user?.id !== review.reviewerId) {
        return this.sendError(res, "You can only delete your own reviews", 403);
      }

      const deleted = await storage.deleteReview(id);
      if (!deleted) {
        return this.sendError(res, "Failed to delete review", 500);
      }

      // Update user rating after deletion
      const userReviews = await storage.getUserReviews(review.userId);
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        const averageRating = totalRating / userReviews.length;
        await storage.updateUserRating(review.userId, averageRating);
      } else {
        // If no reviews left, reset rating to default (5.0)
        await storage.updateUserRating(review.userId, 5.0);
      }

      this.sendSuccess(res, { message: "Review deleted successfully" });
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
