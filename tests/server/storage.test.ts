import { storage } from "../../server/storage";
import {
  insertUserSchema,
  insertTicketSchema,
} from "../../shared/schema";
import { z } from "zod";

// Mock user data for testing
const testUser = {
  password: "password123",
  fullName: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  whatsapp: "1234567890",
  instagram: "testuser_ig",
  preferredContactMethod: "whatsapp",
};

// Mock ticket data for testing
const testTicket = {
  sellerId: 1,
  title: "Test Concert Ticket",
  eventTitle: "Test Concert",
  eventDescription: "This is a test concert event",
  venue: "Test Venue",
  venueAddress: "123 Test Street, Delhi",
  eventDate: new Date("2025-06-01T18:00:00"),
  category: "Music",
  eventImageUrl: "https://example.com/image.jpg",
  trending: true,
  sellingFast: true,
  latitude: 28.6139,
  longitude: 77.2090,
  city: "Delhi",
  section: "A",
  row: "1",
  seat: "10",
  price: 1500,
  quantity: 1,
  status: "available",
  isTransferrable: true,
  transferMethod: "digital",
  additionalInfo: "Great seats with clear view",
  showContactInfo: true,
};

describe("Storage Service Tests", () => {
  describe("User operations", () => {
    test("should create a user", async () => {
      const validatedUser = insertUserSchema.parse(testUser);
      const user = await storage.createUser(validatedUser);

      expect(user).toHaveProperty("id");
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });

    test("should get a user by ID", async () => {
      const validatedUser = insertUserSchema.parse(testUser);
      const createdUser = await storage.createUser(validatedUser);

      const user = await storage.getUser(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.username).toBe(testUser.username);
    });

    test("should get a user by username", async () => {
      const validatedUser = insertUserSchema.parse(testUser);
      await storage.createUser(validatedUser);

      const user = await storage.getUserByUsername(testUser.username);

      expect(user).toBeDefined();
      expect(user?.username).toBe(testUser.username);
    });
  });

  describe("Event operations", () => {
    test("should create an event", async () => {
      const validatedEvent = insertEventSchema.parse(testEvent);
      const event = await storage.createEvent(validatedEvent);

      expect(event).toHaveProperty("id");
      expect(event.title).toBe(testEvent.title);
      expect(event.venue).toBe(testEvent.venue);
    });

    test("should get an event by ID", async () => {
      const validatedEvent = insertEventSchema.parse(testEvent);
      const createdEvent = await storage.createEvent(validatedEvent);

      const event = await storage.getEvent(createdEvent.id);

      expect(event).toBeDefined();
      expect(event?.id).toBe(createdEvent.id);
      expect(event?.title).toBe(testEvent.title);
    });

    test("should get all events", async () => {
      const validatedEvent = insertEventSchema.parse({
        ...testEvent,
        title: "Another Test Event",
      });
      await storage.createEvent(validatedEvent);

      const events = await storage.getAllEvents();

      expect(events.length).toBeGreaterThan(0);
    });

    test("should get events by category", async () => {
      const validatedEvent = insertEventSchema.parse(testEvent);
      await storage.createEvent(validatedEvent);

      const events = await storage.getEventsByCategory(testEvent.category);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].category).toBe(testEvent.category);
    });
  });

  describe("Ticket operations", () => {
    let eventId: number;
    let userId: number;

    beforeAll(async () => {
      // Create a test user and event for ticket tests
      const validatedUser = insertUserSchema.parse(testUser);
      const createdUser = await storage.createUser(validatedUser);
      userId = createdUser.id;

      const validatedEvent = insertEventSchema.parse(testEvent);
      const createdEvent = await storage.createEvent(validatedEvent);
      eventId = createdEvent.id;
    });

    test("should create a ticket", async () => {
      const ticketData = {
        ...testTicket,
        eventId: eventId,
        sellerId: userId,
      };

      const validatedTicket = insertTicketSchema.parse(ticketData);
      const ticket = await storage.createTicket(validatedTicket);

      expect(ticket).toHaveProperty("id");
      expect(ticket.eventId).toBe(eventId);
      expect(ticket.sellerId).toBe(userId);
      expect(ticket.section).toBe(testTicket.section);
    });

    test("should get a ticket by ID", async () => {
      const ticketData = {
        ...testTicket,
        eventId: eventId,
        sellerId: userId,
      };

      const validatedTicket = insertTicketSchema.parse(ticketData);
      const createdTicket = await storage.createTicket(validatedTicket);

      const ticket = await storage.getTicket(createdTicket.id);

      expect(ticket).toBeDefined();
      expect(ticket?.id).toBe(createdTicket.id);
      expect(ticket?.section).toBe(testTicket.section);
    });

    test("should get tickets by event ID", async () => {
      const ticketData = {
        ...testTicket,
        eventId: eventId,
        sellerId: userId,
      };

      const validatedTicket = insertTicketSchema.parse(ticketData);
      await storage.createTicket(validatedTicket);

      const tickets = await storage.getTicketsByEvent(eventId);

      expect(tickets.length).toBeGreaterThan(0);
      expect(tickets[0].eventId).toBe(eventId);
    });

    test("should get tickets by seller ID", async () => {
      const ticketData = {
        ...testTicket,
        eventId: eventId,
        sellerId: userId,
      };

      const validatedTicket = insertTicketSchema.parse(ticketData);
      await storage.createTicket(validatedTicket);

      const tickets = await storage.getTicketsBySeller(userId);

      expect(tickets.length).toBeGreaterThan(0);
      expect(tickets[0].sellerId).toBe(userId);
    });
  });
});
