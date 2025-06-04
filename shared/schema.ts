
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  whatsapp: text("whatsapp"), // Added WhatsApp number for direct contact
  instagram: text("instagram").notNull(), // Instagram handle for profile verification (mandatory)
  rating: doublePrecision("rating").default(0),
  ratingsCount: integer("ratings_count").default(0),
  preferredContactMethod: text("preferred_contact_method").default("whatsapp"), // whatsapp, phone, email
});

// Pure P2P ticket listings with embedded event information
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(), // Title for the ticket listing
  
  // Event details embedded in tickets
  eventTitle: text("event_title").notNull(),
  eventDescription: text("event_description"),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address"),
  eventDate: timestamp("event_date").notNull(),
  category: text("category").notNull(), // 'movies', 'buses', 'sports', 'events'
  eventImageUrl: text("event_image_url"),
  trending: boolean("trending").default(false),
  sellingFast: boolean("selling_fast").default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  city: text("city"), // Made optional since we'll extract from venue address
  
  // Ticket specific details
  section: text("section").notNull(),
  row: text("row"),
  seat: text("seat"),
  price: doublePrecision("price").notNull(), // Listed price for information only
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("available"), // available, contacted, sold, expired
  isTransferrable: boolean("is_transferrable").default(true),
  transferMethod: text("transfer_method").notNull(), // in-person, electronic, mail
  additionalInfo: text("additional_info"),
  showContactInfo: boolean("show_contact_info").default(true),
  // Removed verification fields - pure P2P means users handle verification themselves
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // When the ticket listing expires
});

// Enhanced contact requests for pure P2P model
export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  requesterId: integer("requester_id").notNull(), // User requesting contact info
  sellerId: integer("seller_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  contactMethod: text("contact_method").notNull(), // whatsapp, phone, email, instagram
  message: text("message").notNull(), // Message from the requester to the seller
  offeredPrice: doublePrecision("offered_price"), // Price offered by buyer
  meetingLocation: text("meeting_location"), // Suggested meeting location for in-person transfers
  preferredTime: text("preferred_time"), // Preferred time for contact/meeting
});

// User feedback replaces disputes
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User submitting feedback
  ticketId: integer("ticket_id"),
  feedbackType: text("feedback_type").notNull(), // positive, negative, suggestion, report
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, reviewed, addressed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull(), // User giving the review
  userId: integer("user_id").notNull(), // User being reviewed
  contactRequestId: integer("contact_request_id"), // Related contact request instead of transaction
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  reviewType: text("review_type").notNull(), // buyer_review_seller, seller_review_buyer
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Ticket viewing history table
export const ticketViews = pgTable("ticket_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ticketId: integer("ticket_id").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  contactRequestsAsSeller: many(contactRequests, { relationName: "seller" }),
  contactRequestsAsRequester: many(contactRequests, {
    relationName: "requester",
  }),
  feedback: many(userFeedback),
  reviewsGiven: many(userReviews, { relationName: "reviewer" }),
  reviewsReceived: many(userReviews, { relationName: "reviewee" }),
  ticketViews: many(ticketViews),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  seller: one(users, {
    fields: [tickets.sellerId],
    references: [users.id],
  }),
  contactRequests: many(contactRequests),
  reviews: many(userReviews),
  views: many(ticketViews),
}));

export const contactRequestsRelations = relations(
  contactRequests,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [contactRequests.ticketId],
      references: [tickets.id],
    }),
    requester: one(users, {
      fields: [contactRequests.requesterId],
      references: [users.id],
      relationName: "requester",
    }),
    seller: one(users, {
      fields: [contactRequests.sellerId],
      references: [users.id],
      relationName: "seller",
    }),
  }),
);

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [userFeedback.ticketId],
    references: [tickets.id],
  }),
}));

export const userReviewsRelations = relations(userReviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [userReviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [userReviews.userId],
    references: [users.id],
    relationName: "reviewee",
  }),
  contactRequest: one(contactRequests, {
    fields: [userReviews.contactRequestId],
    references: [contactRequests.id],
  }),
}));

export const ticketViewsRelations = relations(ticketViews, ({ one }) => ({
  user: one(users, {
    fields: [ticketViews.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [ticketViews.ticketId],
    references: [tickets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  whatsapp: true,
  instagram: true,
  preferredContactMethod: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

export const insertContactRequestSchema = createInsertSchema(
  contactRequests,
).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

// Extended schema for contact requests with validations
export const contactRequestSchema = insertContactRequestSchema.extend({
  message: z.string().min(1, "Message is required"),
  contactMethod: z.enum(["whatsapp", "phone", "email", "instagram"]),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertUserReviewSchema = createInsertSchema(userReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketViewSchema = createInsertSchema(ticketViews).omit({
  id: true,
  viewedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type UserReview = typeof userReviews.$inferSelect;

export type InsertTicketView = z.infer<typeof insertTicketViewSchema>;
export type TicketView = typeof ticketViews.$inferSelect;

// Event type alias for compatibility (events are embedded in tickets)
export type Event = Ticket;

// Pure P2P model - transactions and disputes removed

// Extended schemas with validations for forms
export const ticketListingSchema = insertTicketSchema.extend({
  price: z.number().positive("Price must be greater than 0"),
  transferMethod: z.enum(["in-person", "electronic", "mail"]),
  eventTitle: z.string().min(1, "Event title is required"),
  venue: z.string().min(1, "Venue is required"),
  eventDate: z.date(),
  category: z.enum(["movies", "buses", "sports", "events"]),
  city: z.string().min(1, "City is required"),
});

export const userRegisterSchema = insertUserSchema
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    instagram: z.string().min(1, "Instagram ID is required"),
    preferredContactMethod: z
      .enum(["whatsapp", "phone", "email"])
      .default("whatsapp"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const userLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const userReviewSchema = insertUserReviewSchema.extend({
  rating: z
    .number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().optional(),
});
