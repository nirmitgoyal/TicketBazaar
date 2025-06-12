
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  whatsapp: text("whatsapp"), // WhatsApp number for direct contact
  instagram: text("instagram"), // Instagram handle for profile verification (optional globally)
  rating: doublePrecision("rating").default(0),
  ratingsCount: integer("ratings_count").default(0),
  preferredContactMethod: text("preferred_contact_method").default("email"), // email, whatsapp, phone
  country: text("country").notNull().default("US"), // ISO 3166-1 alpha-2 country code
  timezone: text("timezone").default("UTC"), // User's timezone
  language: text("language").default("en"), // Preferred language (ISO 639-1)
  currency: text("currency").default("USD"), // Preferred currency (ISO 4217)
  verificationStatus: text("verification_status").default("unverified"), // unverified, pending, verified
  governmentIdVerified: boolean("government_id_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  ratingIdx: index("users_rating_idx").on(table.rating),
  countryIdx: index("users_country_idx").on(table.country),
  verificationIdx: index("users_verification_idx").on(table.verificationStatus),
}));

// Pure P2P ticket listings with embedded event information
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  
  // Ticket details
  title: text("title").notNull(),
  
  // Event details embedded in tickets
  eventTitle: text("event_title").notNull(),
  eventDescription: text("event_description"),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address"),
  eventDate: timestamp("event_date").notNull(),
  category: text("category").notNull(),
  eventImageUrl: text("event_image_url"),
  trending: boolean("trending").default(false),
  sellingFast: boolean("selling_fast").default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  city: text("city"),
  country: text("country").notNull().default("US"), // ISO 3166-1 alpha-2 country code
  state: text("state"), // State/province for better location filtering
  postalCode: text("postal_code"), // Postal/ZIP code
  
  // Ticket specific details
  section: text("section"),
  row: text("row"),
  seat: text("seat"),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull().default("USD"), // ISO 4217 currency code
  originalPrice: doublePrecision("original_price"), // Face value of ticket
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("available"),
  isTransferrable: boolean("is_transferrable").default(true),
  transferMethod: text("transfer_method").notNull(),
  additionalInfo: text("additional_info"),
  showContactInfo: boolean("show_contact_info").default(false),
  eventTimezone: text("event_timezone").default("UTC"), // Event timezone
  ageRestriction: text("age_restriction"), // 18+, 21+, All Ages, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  sellerIdx: index("tickets_seller_id_idx").on(table.sellerId),
  titleIdx: index("tickets_title_idx").on(table.title),
  eventTitleIdx: index("tickets_event_title_idx").on(table.eventTitle),
  categoryIdx: index("tickets_category_idx").on(table.category),
  eventDateIdx: index("tickets_event_date_idx").on(table.eventDate),
  statusIdx: index("tickets_status_idx").on(table.status),
  cityIdx: index("tickets_city_idx").on(table.city),
  countryIdx: index("tickets_country_idx").on(table.country),
  priceIdx: index("tickets_price_idx").on(table.price),
  currencyIdx: index("tickets_currency_idx").on(table.currency),
  createdAtIdx: index("tickets_created_at_idx").on(table.createdAt),
  trendingIdx: index("tickets_trending_idx").on(table.trending),
  locationIdx: index("tickets_location_idx").on(table.latitude, table.longitude),
}));

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
}, (table) => ({
  ticketIdx: index("contact_requests_ticket_id_idx").on(table.ticketId),
  requesterIdx: index("contact_requests_requester_id_idx").on(table.requesterId),
  sellerIdx: index("contact_requests_seller_id_idx").on(table.sellerId),
  statusIdx: index("contact_requests_status_idx").on(table.status),
  createdAtIdx: index("contact_requests_created_at_idx").on(table.createdAt),
}));

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
}, (table) => ({
  userIdx: index("user_feedback_user_id_idx").on(table.userId),
  ticketIdx: index("user_feedback_ticket_id_idx").on(table.ticketId),
  statusIdx: index("user_feedback_status_idx").on(table.status),
  createdAtIdx: index("user_feedback_created_at_idx").on(table.createdAt),
}));

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
}, (table) => ({
  reviewerIdx: index("user_reviews_reviewer_id_idx").on(table.reviewerId),
  userIdx: index("user_reviews_user_id_idx").on(table.userId),
  contactRequestIdx: index("user_reviews_contact_request_id_idx").on(table.contactRequestId),
  ratingIdx: index("user_reviews_rating_idx").on(table.rating),
  createdAtIdx: index("user_reviews_created_at_idx").on(table.createdAt),
}));

// Ticket viewing history table
export const ticketViews = pgTable("ticket_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ticketId: integer("ticket_id").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("ticket_views_user_id_idx").on(table.userId),
  ticketIdx: index("ticket_views_ticket_id_idx").on(table.ticketId),
  viewedAtIdx: index("ticket_views_viewed_at_idx").on(table.viewedAt),
}));

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
export const insertUserSchema = createInsertSchema(users);

export const insertTicketSchema = createInsertSchema(tickets);

export const insertContactRequestSchema = createInsertSchema(contactRequests);

// Extended schema for contact requests with validations
export const contactRequestSchema = insertContactRequestSchema.extend({
  message: z.string().min(1, "Message is required"),
  contactMethod: z.enum(["whatsapp", "phone", "email", "instagram"]),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback);

export const insertUserReviewSchema = createInsertSchema(userReviews);

export const insertTicketViewSchema = createInsertSchema(ticketViews);

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
export const ticketListingSchema = insertTicketSchema
  .omit({ id: true, createdAt: true, sellerId: true })
  .extend({
    price: z.number().positive("Price must be greater than 0"),
    currency: z.string().length(3, "Currency must be 3-letter ISO code").default("USD"),
    transferMethod: z.enum(["in-person", "electronic", "mail", "digital"]),
    eventTitle: z.string().min(1, "Event title is required"),
    venue: z.string().min(1, "Venue is required"),
    eventDate: z.date(),
    category: z.enum([
      "concerts", "sports", "theater", "comedy", "festivals", 
      "conferences", "exhibitions", "movies", "dance", "opera",
      "classical", "family", "nightlife", "education", "networking"
    ]),
    city: z.string().min(1, "City is required"),
    country: z.string().length(2, "Country must be 2-letter ISO code"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    eventTimezone: z.string().default("UTC"),
    ageRestriction: z.string().optional(),
  });

export const userRegisterSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(), // Made optional for global markets
  country: z.string().length(2, "Country must be 2-letter ISO code"),
  timezone: z.string().default("UTC"),
  language: z.string().length(2, "Language must be 2-letter ISO code").default("en"),
  currency: z.string().length(3, "Currency must be 3-letter ISO code").default("USD"),
  preferredContactMethod: z
    .enum(["email", "whatsapp", "phone"])
    .default("email"), // Email as global default
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const userReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().optional(),
  reviewerId: z.number(),
  userId: z.number(),
  contactRequestId: z.number().optional(),
  reviewType: z.enum(["buyer_review_seller", "seller_review_buyer"]),
});

// Legacy types for backward compatibility (now removed from P2P model)
export type Transaction = {
  id: number;
  buyerId: number;
  sellerId: number;
  ticketId: number;
  status: string;
  createdAt: Date;
};

export type Dispute = {
  id: number;
  transactionId: number;
  initiatorId: number;
  reason: string;
  status: string;
  createdAt: Date;
};

export type InsertDispute = Omit<Dispute, 'id' | 'createdAt'>;
export type InsertEvent = Omit<Event, 'id' | 'createdAt'>;
