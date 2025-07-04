
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
  googleId: text("google_id"), // Google OAuth ID

  preferredContactMethod: text("preferred_contact_method").default("email"), // email, whatsapp, phone
  country: text("country").notNull().default("US"), // ISO 3166-1 alpha-2 country code
  timezone: text("timezone").default("UTC"), // User's timezone
  language: text("language").default("en"), // Preferred language (ISO 639-1)
  verificationStatus: text("verification_status").default("unverified"), // unverified, pending, verified
  governmentIdVerified: boolean("government_id_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  trustScore: doublePrecision("trust_score").default(0),
  verificationLevel: integer("verification_level").default(0),
  responseRate: doublePrecision("response_rate").default(0),
  avgResponseTime: integer("avg_response_time").default(0),
  lastLogin: timestamp("last_login"),
  accountFlags: text("account_flags").default("{}"),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
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
  viewCount: integer("view_count").default(0),
  contactCount: integer("contact_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  boostScore: integer("boost_score").default(0),

  availabilityStatus: text("availability_status").default("available"),
}, (table) => ({
  sellerIdx: index("tickets_seller_id_idx").on(table.sellerId),
  titleIdx: index("tickets_title_idx").on(table.title),
  eventTitleIdx: index("tickets_event_title_idx").on(table.eventTitle),
  categoryIdx: index("tickets_category_idx").on(table.category),
  eventDateIdx: index("tickets_event_date_idx").on(table.eventDate),
  statusIdx: index("tickets_status_idx").on(table.status),
  cityIdx: index("tickets_city_idx").on(table.city),
  countryIdx: index("tickets_country_idx").on(table.country),
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



// Ticket viewing history table with IP tracking for anonymous users
export const ticketViews = pgTable("ticket_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Made nullable for anonymous views
  ticketId: integer("ticket_id").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  ipAddress: text("ip_address"), // For tracking anonymous users
  userAgent: text("user_agent"), // Browser/device info
  sessionId: text("session_id"), // Session identifier
  referrer: text("referrer"), // Where the user came from
}, (table) => ({
  userIdx: index("ticket_views_user_id_idx").on(table.userId),
  ticketIdx: index("ticket_views_ticket_id_idx").on(table.ticketId),
  viewedAtIdx: index("ticket_views_viewed_at_idx").on(table.viewedAt),
  ipIdx: index("ticket_views_ip_idx").on(table.ipAddress),
  sessionIdx: index("ticket_views_session_idx").on(table.sessionId),
  uniqueViewIdx: index("ticket_views_unique_idx").on(table.ticketId, table.userId, table.ipAddress),
}));

// Ticket popularity metrics table
export const ticketPopularity = pgTable("ticket_popularity", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().unique(),
  totalViews: integer("total_views").notNull().default(0),
  uniqueViews: integer("unique_views").notNull().default(0),
  viewsToday: integer("views_today").notNull().default(0),
  viewsThisWeek: integer("views_this_week").notNull().default(0),
  viewsThisMonth: integer("views_this_month").notNull().default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  popularityScore: doublePrecision("popularity_score").notNull().default(0), // Calculated score
  trendingFactor: doublePrecision("trending_factor").notNull().default(0), // Recent view velocity
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  ticketIdx: index("ticket_popularity_ticket_id_idx").on(table.ticketId),
  popularityIdx: index("ticket_popularity_score_idx").on(table.popularityScore),
  trendingIdx: index("ticket_popularity_trending_idx").on(table.trendingFactor),
  updatedAtIdx: index("ticket_popularity_updated_at_idx").on(table.updatedAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  contactRequestsAsSeller: many(contactRequests, { relationName: "seller" }),
  contactRequestsAsRequester: many(contactRequests, {
    relationName: "requester",
  }),
  feedback: many(userFeedback),
  ticketViews: many(ticketViews),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  seller: one(users, {
    fields: [tickets.sellerId],
    references: [users.id],
  }),
  contactRequests: many(contactRequests),
  views: many(ticketViews),
  popularity: one(ticketPopularity, {
    fields: [tickets.id],
    references: [ticketPopularity.ticketId],
  }),
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

export const ticketPopularityRelations = relations(ticketPopularity, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketPopularity.ticketId],
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



export const insertTicketViewSchema = createInsertSchema(ticketViews);

export const insertTicketPopularitySchema = createInsertSchema(ticketPopularity);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;



export type InsertTicketView = z.infer<typeof insertTicketViewSchema>;
export type TicketView = typeof ticketViews.$inferSelect;

export type InsertTicketPopularity = z.infer<typeof insertTicketPopularitySchema>;
export type TicketPopularity = typeof ticketPopularity.$inferSelect;

// Events are now fully embedded in tickets - no separate events table needed

// Pure P2P model - transactions and disputes removed

// Extended schemas with validations for forms
export const ticketListingSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .trim()
    .refine((val) => !/[<>]/.test(val), "Title contains invalid HTML characters"),
  eventTitle: z.string()
    .max(200, "Event title too long")
    .trim()
    .optional()
    .refine((val) => !val || !/[<>]/.test(val), "Event title contains invalid HTML characters"),
  eventDescription: z.string()
    .max(2000, "Description too long")
    .trim()
    .optional()
    .refine((val) => !val || !/[<>]/.test(val), "Description contains invalid HTML characters"),
  venue: z.string()
    .min(1, "Venue is required")
    .max(200, "Venue name too long")
    .trim()
    .refine((val) => !/[<>]/.test(val), "Venue contains invalid HTML characters"),
  venueAddress: z.string()
    .max(500, "Address too long")
    .trim()
    .optional(),
  eventDate: z.coerce.date()
    .refine((date) => date > new Date(), "Event date must be in the future"),
  category: z.enum([
    "concerts", "sports", "theater", "comedy", "festivals", 
    "conferences", "exhibitions", "movies", "dance", "opera",
    "classical", "family", "nightlife", "education", "networking"
  ]),
  eventImageUrl: z.string()
    .max(2000, "URL too long")
    .optional()
    .transform((val) => val === "" ? undefined : val)
    .refine((val) => !val || z.string().url().safeParse(val).success, "Invalid image URL")
    .refine((val) => !val || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(val), "Image URL must be a valid image file"),
  trending: z.boolean().default(false),
  sellingFast: z.boolean().default(false),
  latitude: z.number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),
  longitude: z.number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),
  city: z.string()
    .min(1, "City is required")
    .max(100, "City name too long")
    .trim()
    .refine((val) => /^[a-zA-Z\s\-'\.]+$/.test(val), "City contains invalid characters"),
  country: z.string()
    .length(2, "Country must be 2-letter ISO code")
    .toUpperCase(),
  state: z.string()
    .max(100, "State name too long")
    .trim()
    .optional(),
  postalCode: z.string()
    .max(20, "Postal code too long")
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\s\-]+$/.test(val), "Invalid postal code format"),
  section: z.string()
    .max(50, "Section too long")
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\s\-]+$/.test(val), "Section contains invalid characters"),
  row: z.string()
    .max(20, "Row too long")
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\s\-]+$/.test(val), "Row contains invalid characters"),
  seat: z.string()
    .max(20, "Seat too long")
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\s\-,]+$/.test(val), "Seat contains invalid characters"),
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(50, "Maximum 50 tickets per listing"),
  status: z.enum(["available", "pending", "sold", "expired"]).default("available"),
  isTransferrable: z.boolean().default(true),
  transferMethod: z.enum(["in-person", "electronic", "mail", "digital"]),
  additionalInfo: z.string()
    .max(1000, "Additional info too long")
    .trim()
    .optional()
    .refine((val) => !val || !/[<>]/.test(val), "Additional info contains invalid HTML characters"),
  showContactInfo: z.boolean().default(false),
  eventTimezone: z.string().max(50, "Timezone too long").default("UTC"),
  ageRestriction: z.string()
    .max(50, "Age restriction too long")
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\s\+\-]+$/.test(val), "Age restriction contains invalid characters"),
  expiresAt: z.coerce.date()
    .optional()
    .refine((date) => !date || date > new Date(), "Expiry date must be in the future"),
});

export const userRegisterSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  fullName: z.string()
    .min(2, "Full name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters"),
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .toLowerCase(),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), "Invalid phone number format"),
  whatsapp: z.string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), "Invalid WhatsApp number format"),
  instagram: z.string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9_.]{1,30}$/.test(val.replace(/^@/, "")), "Invalid Instagram handle"),
  country: z.string().length(2, "Country must be 2-letter ISO code").toUpperCase(),
  timezone: z.string().default("UTC"),
  language: z.string().length(2, "Language must be 2-letter ISO code").default("en"),
  preferredContactMethod: z
    .enum(["email", "whatsapp", "phone"])
    .default("email"),
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
