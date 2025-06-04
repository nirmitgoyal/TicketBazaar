import { rest } from "msw";
import {
  User,
  Event,
  Ticket,
  Transaction,
  Dispute,
} from "../../shared/schema.js";

// Mock user data
const mockUser: User = {
  id: 1,
  username: "testuser",
  fullName: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  password: "hashedpassword",
  googleId: null,
  rating: 4.5,
  ratingsCount: 10,
};

// Mock event data
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Coldplay Concert",
    description: "Coldplay World Tour 2025 - Music of the Spheres",
    date: new Date("2025-06-15T19:00:00"),
    venue: "Jawaharlal Nehru Stadium, Delhi NCR",
    category: "Music",
    imageUrl: "https://example.com/coldplay.jpg",
    trending: true,
    sellingFast: true,
    latitude: 28.5535,
    longitude: 77.2588,
    city: "Delhi NCR",
  },
  {
    id: 2,
    title: "IPL Finals 2025",
    description: "The final match of Indian Premier League 2025",
    date: new Date("2025-05-28T18:30:00"),
    venue: "Wankhede Stadium, Mumbai",
    category: "Sports",
    imageUrl: "https://example.com/ipl.jpg",
    trending: true,
    sellingFast: true,
    latitude: 18.9387,
    longitude: 72.8253,
    city: "Mumbai",
  },
];

// Mock ticket data
const mockTickets: Ticket[] = [
  {
    id: 1,
    eventId: 1,
    sellerId: 1,
    section: "A",
    row: "10",
    seat: "15",
    originalPrice: 5000,
    sellingPrice: 4500,
    quantity: 1,
    status: "available",
    verified: true,
    verificationCode: null,
    qrCode: null,
  },
  {
    id: 2,
    eventId: 1,
    sellerId: 1,
    section: "B",
    row: "5",
    seat: "20",
    originalPrice: 3500,
    sellingPrice: 3200,
    quantity: 1,
    status: "available",
    verified: true,
    verificationCode: null,
    qrCode: null,
  },
];

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 1,
    buyerId: 2,
    sellerId: 1,
    ticketId: 1,
    amount: 4500,
    status: "completed",
    createdAt: new Date(),
    updatedAt: null,
  },
];

// Mock dispute data
const mockDisputes: Dispute[] = [
  {
    id: 1,
    transactionId: 1,
    reason: "Ticket was not valid",
    description: "The barcode on the ticket was not accepted at the venue.",
    status: "open",
    createdAt: new Date(),
    resolvedAt: null,
  },
];

// Define handlers for mock API endpoints
export const handlers = [
  // Auth endpoints
  rest.post("/api/register", async (req, res, ctx) => {
    const userData = await req.json();
    const newUser = { ...mockUser, id: 1, googleId: null };
    return res(ctx.status(201), ctx.json(newUser));
  }),

  rest.post("/api/login", async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...mockUser, googleId: null }));
  }),

  rest.post("/api/logout", (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.get("/api/user", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...mockUser, googleId: null }));
  }),

  // Event endpoints
  rest.get("/api/events", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockEvents));
  }),

  rest.get("/api/events/category/:category", (req, res, ctx) => {
    const { category } = req.params;
    const filteredEvents = mockEvents.filter(
      (event) => event.category === category,
    );
    return res(ctx.status(200), ctx.json(filteredEvents));
  }),

  rest.get("/api/events/search", (req, res, ctx) => {
    const query = req.url.searchParams.get("query") || "";

    const filteredEvents = mockEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(query.toLowerCase())),
    );

    return res(ctx.status(200), ctx.json(filteredEvents));
  }),

  rest.get("/api/events/:id", (req, res, ctx) => {
    const { id } = req.params;
    const event = mockEvents.find((e) => e.id === Number(id));

    if (event) {
      return res(ctx.status(200), ctx.json(event));
    }

    return res(ctx.status(404));
  }),

  // Ticket endpoints
  rest.post("/api/tickets", async (req, res, ctx) => {
    const data = (await req.json()) as Record<string, any>;
    const newTicket = {
      ...data,
      id: mockTickets.length + 1,
      status: "available",
      verified: false,
      verificationCode: null,
      qrCode: null,
    };

    return res(ctx.status(201), ctx.json(newTicket));
  }),

  rest.get("/api/tickets/event/:eventId", (req, res, ctx) => {
    const { eventId } = req.params;
    const tickets = mockTickets.filter(
      (ticket) => ticket.eventId === Number(eventId),
    );
    return res(ctx.status(200), ctx.json(tickets));
  }),

  rest.get("/api/tickets/seller/:sellerId", (req, res, ctx) => {
    const { sellerId } = req.params;
    const tickets = mockTickets.filter(
      (ticket) => ticket.sellerId === Number(sellerId),
    );
    return res(ctx.status(200), ctx.json(tickets));
  }),

  rest.get("/api/tickets/:id", (req, res, ctx) => {
    const { id } = req.params;
    const ticket = mockTickets.find((t) => t.id === Number(id));

    if (ticket) {
      return res(ctx.status(200), ctx.json(ticket));
    }

    return res(ctx.status(404));
  }),

  // Transaction endpoints
  rest.post("/api/transactions", async (req, res, ctx) => {
    const data = (await req.json()) as Record<string, any>;
    const newTransaction = {
      ...data,
      id: mockTransactions.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
    };

    return res(ctx.status(201), ctx.json(newTransaction));
  }),

  rest.get("/api/transactions/user/:userId", (req, res, ctx) => {
    const { userId } = req.params;
    const userTransactions = mockTransactions.filter(
      (transaction) =>
        transaction.buyerId === Number(userId) ||
        transaction.sellerId === Number(userId),
    );

    return res(ctx.status(200), ctx.json(userTransactions));
  }),

  rest.patch("/api/transactions/:id/status", async (req, res, ctx) => {
    const { id } = req.params;
    const data = (await req.json()) as { status: string };
    const transaction = mockTransactions.find((t) => t.id === Number(id));

    if (transaction && data) {
      transaction.status = data.status;
      transaction.updatedAt = new Date();
      return res(ctx.status(200), ctx.json(transaction));
    }

    return res(ctx.status(404));
  }),

  // Dispute endpoints
  rest.post("/api/disputes", async (req, res, ctx) => {
    const data = (await req.json()) as Record<string, any>;
    const newDispute = {
      ...data,
      id: mockDisputes.length + 1,
      createdAt: new Date(),
      status: "pending",
      resolvedAt: null,
    };

    return res(ctx.status(201), ctx.json(newDispute));
  }),

  rest.get("/api/disputes/user/:userId", (req, res, ctx) => {
    const { userId } = req.params;
    // Mock implementation - in a real app, we'd join with transactions
    const userDisputes = mockDisputes;
    return res(ctx.status(200), ctx.json(userDisputes));
  }),

  rest.patch("/api/disputes/:id/status", async (req, res, ctx) => {
    const { id } = req.params;
    const data = (await req.json()) as { status: string };
    const dispute = mockDisputes.find((d) => d.id === Number(id));

    if (dispute && data) {
      dispute.status = data.status;

      if (data.status === "resolved") {
        dispute.resolvedAt = new Date();
      }

      return res(ctx.status(200), ctx.json(dispute));
    }

    return res(ctx.status(404));
  }),
];
