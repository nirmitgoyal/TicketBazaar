import { storage } from "../../server/storage";
import {
  insertUserSchema,
  insertTicketSchema,
} from "../../shared/schema";

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
      expect(user.fullName).toBe(testUser.fullName);
      expect(user.email).toBe(testUser.email);
    });

    test("should get a user by ID", async () => {
      const validatedUser = insertUserSchema.parse(testUser);
      const createdUser = await storage.createUser(validatedUser);

      const user = await storage.getUser(createdUser.id);
      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
    });

    test("should get a user by email", async () => {
      const validatedUser = insertUserSchema.parse(testUser);
      await storage.createUser(validatedUser);

      const user = await storage.getUserByEmail(testUser.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testUser.email);
    });
  });

  describe("Ticket operations", () => {
    test("should create a ticket", async () => {
      // Create a user first
      const validatedUser = insertUserSchema.parse(testUser);
      const createdUser = await storage.createUser(validatedUser);

      const validatedTicket = insertTicketSchema.parse({
        ...testTicket,
        sellerId: createdUser.id,
      });
      const ticket = await storage.createTicket(validatedTicket);

      expect(ticket).toHaveProperty("id");
      expect(ticket.sellerId).toBe(createdUser.id);
      expect(ticket.title).toBe(testTicket.title);
    });

    test("should get all events", async () => {
      const events = await storage.getAllEvents();
      expect(events).toBeInstanceOf(Array);
    });
  });
});