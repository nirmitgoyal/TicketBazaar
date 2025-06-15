import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  decimal,
  varchar,
  char,
  pgEnum,
  index,
  uniqueIndex,
  foreignKey,
  check,
  jsonb,
  inet,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for better type safety and constraints
export const eventCategoryEnum = pgEnum("event_category", [
  "concerts", "sports", "theater", "comedy", "festivals", 
  "conferences", "exhibitions", "movies", "dance", "opera",
  "classical", "family", "nightlife", "education", "networking"
]);

export const venueTypeEnum = pgEnum("venue_type", [
  "stadium", "arena", "theater", "concert_hall", "club", 
  "outdoor", "conference_center", "exhibition_hall", "other"
]);

export const eventStatusEnum = pgEnum("event_status", [
  "active", "cancelled", "postponed", "completed", "draft"
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "available", "pending", "sold", "expired", "cancelled", "reserved"
]);

export const transferMethodEnum = pgEnum("transfer_method", [
  "in-person", "electronic", "mail", "digital", "mobile_transfer"
]);

export const contactRequestStatusEnum = pgEnum("contact_request_status", [
  "pending", "approved", "denied", "completed", "expired"
]);

export const userStatusEnum = pgEnum("user_status", [
  "active", "inactive", "suspended", "banned", "pending_verification"
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified", "pending", "verified", "rejected"
]);

export const ageRestrictionEnum = pgEnum("age_restriction", [
  "all_ages", "18+", "21+", "family_friendly"
]);

export const auditOperationEnum = pgEnum("audit_operation", [
  "INSERT", "UPDATE", "DELETE", "LOGIN", "LOGOUT"
]);

// Enhanced Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  instagram: varchar("instagram", { length: 100 }),
  googleId: varchar("google_id", { length: 100 }),
  
  // Location and preferences
  country: char("country", { length: 2 }).notNull().default("US"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  language: char("language", { length: 2 }).default("en"),
  preferredContactMethod: varchar("preferred_contact_method", { length: 20 }).default("email"),
  
  // Ratings and reputation
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ratingsCount: integer("ratings_count").default(0),
  reputationScore: integer("reputation_score").default(0),
  
  // Verification status
  verificationStatus: verificationStatusEnum("verification_status").default("unverified"),
  governmentIdVerified: boolean("government_id_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  
  // Account management
  accountStatus: userStatusEnum("account_status").default("active"),
  isAdmin: boolean("is_admin").default(false),
  lastActive: timestamp("last_active"),
  profileCompletionScore: integer("profile_completion_score").default(0),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  ratingIdx: index("users_rating_idx").on(table.rating),
  countryIdx: index("users_country_idx").on(table.country),
  verificationIdx: index("users_verification_idx").on(table.verificationStatus),
  statusIdx: index("users_status_idx").on(table.accountStatus),
  lastActiveIdx: index("users_last_active_idx").on(table.lastActive),
  // Check constraints
  ratingCheck: check("valid_rating", sql`rating >= 0 AND rating <= 5`),
  reputationCheck: check("valid_reputation", sql`reputation_score >= 0`),
  profileScoreCheck: check("valid_profile_score", sql`profile_completion_score >= 0 AND profile_completion_score <= 100`),
}));

// New Venues Table (normalized)
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: char("country", { length: 2 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  capacity: integer("capacity"),
  venueType: venueTypeEnum("venue_type"),
  website: text("website"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  description: text("description"),
  amenities: jsonb("amenities"), // JSON array of amenities
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("venues_name_idx").on(table.name),
  cityCountryIdx: index("venues_city_country_idx").on(table.city, table.country),
  locationIdx: index("venues_location_idx").on(table.latitude, table.longitude),
  searchIdx: index("venues_search_idx").on(sql`to_tsvector('english', name || ' ' || city)`),
  capacityCheck: check("valid_capacity", sql`capacity > 0`),
}));

// New Events Table (normalized)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  venueId: integer("venue_id").notNull(),
  category: eventCategoryEnum("category").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  doorsOpen: timestamp("doors_open", { withTimezone: true }),
  ageRestriction: ageRestrictionEnum("age_restriction"),
  status: eventStatusEnum("status").default("active"),
  imageUrl: text("image_url"),
  externalId: varchar("external_id", { length: 100 }), // For API integrations
  organizer: varchar("organizer", { length: 255 }),
  genre: varchar("genre", { length: 100 }),
  duration: integer("duration_minutes"), // Duration in minutes
  isRecurring: boolean("is_recurring").default(false),
  parentEventId: integer("parent_event_id"), // For recurring events
  tags: jsonb("tags"), // JSON array of tags
  socialLinks: jsonb("social_links"), // JSON object with social media links
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  venueId: foreignKey({
    columns: [table.venueId],
    foreignColumns: [venues.id],
    name: "events_venue_id_fk"
  }).onDelete("cascade"),
  parentEventId: foreignKey({
    columns: [table.parentEventId],
    foreignColumns: [table.id],
    name: "events_parent_event_id_fk"
  }),
  titleIdx: index("events_title_idx").on(table.title),
  dateIdx: index("events_date_idx").on(table.eventDate),
  categoryIdx: index("events_category_idx").on(table.category),
  statusIdx: index("events_status_idx").on(table.status),
  venueIdx: index("events_venue_idx").on(table.venueId),
  dateCategoryIdx: index("events_date_category_idx").on(table.eventDate, table.category),
  searchIdx: index("events_search_idx").on(sql`to_tsvector('english', title || ' ' || coalesce(description, ''))`),
  activeEventsIdx: index("events_active_idx").on(table.eventDate, table.category).where(sql`status = 'active'`),
  externalIdIdx: index("events_external_id_idx").on(table.externalId),
  organizerIdx: index("events_organizer_idx").on(table.organizer),
}));

// Enhanced Tickets Table (referencing events)
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  
  // Seat information
  section: varchar("section", { length: 50 }),
  row: varchar("row", { length: 10 }),
  seat: varchar("seat", { length: 20 }),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  
  // Quantity management
  quantity: integer("quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  
  // Status and transfer
  status: ticketStatusEnum("status").default("available"),
  transferMethod: transferMethodEnum("transfer_method").notNull(),
  isTransferrable: boolean("is_transferrable").default(true),
  
  // Additional information
  additionalInfo: text("additional_info"),
  showContactInfo: boolean("show_contact_info").default(false),
  
  // Verification
  verificationCode: varchar("verification_code", { length: 100 }),
  qrCode: text("qr_code"),
  isVerified: boolean("is_verified").default(false),
  
  // Timing
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Additional features
  isHighlight: boolean("is_highlight").default(false), // Premium listing
  viewCount: integer("view_count").default(0),
  favoritesCount: integer("favorites_count").default(0),
}, (table) => ({
  eventId: foreignKey({
    columns: [table.eventId],
    foreignColumns: [events.id],
    name: "tickets_event_id_fk"
  }).onDelete("cascade"),
  sellerId: foreignKey({
    columns: [table.sellerId],
    foreignColumns: [users.id],
    name: "tickets_seller_id_fk"
  }).onDelete("cascade"),
  eventStatusPriceIdx: index("tickets_event_status_price_idx").on(table.eventId, table.status, table.price),
  sellerStatusIdx: index("tickets_seller_status_idx").on(table.sellerId, table.status),
  statusIdx: index("tickets_status_idx").on(table.status),
  priceIdx: index("tickets_price_idx").on(table.price),
  createdAtIdx: index("tickets_created_at_idx").on(table.createdAt),
  expiresAtIdx: index("tickets_expires_at_idx").on(table.expiresAt),
  activeTicketsIdx: index("tickets_active_idx").on(table.eventId, table.price).where(sql`status = 'available'`),
  highlightIdx: index("tickets_highlight_idx").on(table.isHighlight, table.createdAt),
  verificationIdx: index("tickets_verification_idx").on(table.verificationCode),
  // Check constraints
  priceCheck: check("valid_price", sql`price > 0`),
  quantityCheck: check("valid_quantity", sql`quantity > 0`),
  availableQuantityCheck: check("valid_available_quantity", sql`available_quantity >= 0 AND available_quantity <= quantity`),
  originalPriceCheck: check("valid_original_price", sql`original_price IS NULL OR original_price >= price`),
  expiryCheck: check("valid_expiry", sql`expires_at IS NULL OR expires_at > created_at`),
}));

// Enhanced Contact Requests
export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  requesterId: integer("requester_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  status: contactRequestStatusEnum("status").default("pending"),
  contactMethod: varchar("contact_method", { length: 20 }).notNull(),
  message: text("message").notNull(),
  responseMessage: text("response_message"),
  meetingLocation: text("meeting_location"),
  preferredTime: varchar("preferred_time", { length: 100 }),
  requestedQuantity: integer("requested_quantity").default(1),
  offeredPrice: decimal("offered_price", { precision: 10, scale: 2 }),
  priority: integer("priority").default(1), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  ticketId: foreignKey({
    columns: [table.ticketId],
    foreignColumns: [tickets.id],
    name: "contact_requests_ticket_id_fk"
  }).onDelete("cascade"),
  requesterId: foreignKey({
    columns: [table.requesterId],
    foreignColumns: [users.id],
    name: "contact_requests_requester_id_fk"
  }).onDelete("cascade"),
  sellerId: foreignKey({
    columns: [table.sellerId],
    foreignColumns: [users.id],
    name: "contact_requests_seller_id_fk"
  }).onDelete("cascade"),
  ticketIdx: index("contact_requests_ticket_idx").on(table.ticketId),
  requesterIdx: index("contact_requests_requester_idx").on(table.requesterId),
  sellerIdx: index("contact_requests_seller_idx").on(table.sellerId),
  statusIdx: index("contact_requests_status_idx").on(table.status),
  createdAtIdx: index("contact_requests_created_at_idx").on(table.createdAt),
  priorityIdx: index("contact_requests_priority_idx").on(table.priority, table.createdAt),
  quantityCheck: check("valid_quantity", sql`requested_quantity > 0`),
  priceCheck: check("valid_price", sql`offered_price IS NULL OR offered_price > 0`),
  priorityCheck: check("valid_priority", sql`priority >= 1 AND priority <= 5`),
}));

// Enhanced User Reviews
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull(),
  userId: integer("user_id").notNull(),
  contactRequestId: integer("contact_request_id"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  reviewType: varchar("review_type", { length: 30 }).notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  reportCount: integer("report_count").default(0),
  moderationStatus: varchar("moderation_status", { length: 20 }).default("approved"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  reviewerId: foreignKey({
    columns: [table.reviewerId],
    foreignColumns: [users.id],
    name: "user_reviews_reviewer_id_fk"
  }).onDelete("cascade"),
  userId: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_reviews_user_id_fk"
  }).onDelete("cascade"),
  contactRequestId: foreignKey({
    columns: [table.contactRequestId],
    foreignColumns: [contactRequests.id],
    name: "user_reviews_contact_request_id_fk"
  }),
  reviewerIdx: index("user_reviews_reviewer_idx").on(table.reviewerId),
  userIdx: index("user_reviews_user_idx").on(table.userId),
  ratingIdx: index("user_reviews_rating_idx").on(table.rating),
  createdAtIdx: index("user_reviews_created_at_idx").on(table.createdAt),
  moderationIdx: index("user_reviews_moderation_idx").on(table.moderationStatus),
  verifiedIdx: index("user_reviews_verified_idx").on(table.isVerifiedPurchase),
  // Unique constraint to prevent duplicate reviews
  uniqueReview: uniqueIndex("unique_user_review").on(table.reviewerId, table.userId, table.contactRequestId),
  ratingCheck: check("valid_rating", sql`rating >= 1 AND rating <= 5`),
  helpfulCheck: check("valid_helpful", sql`helpful_count >= 0`),
  reportCheck: check("valid_report", sql`report_count >= 0`),
}));

// Enhanced User Feedback
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ticketId: integer("ticket_id"),
  eventId: integer("event_id"),
  feedbackType: varchar("feedback_type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("pending"),
  assignedTo: integer("assigned_to"),
  resolution: text("resolution"),
  attachments: jsonb("attachments"), // JSON array of file URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  resolvedAt: timestamp("resolved_at"),
}, (table) => ({
  userId: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_feedback_user_id_fk"
  }).onDelete("cascade"),
  ticketId: foreignKey({
    columns: [table.ticketId],
    foreignColumns: [tickets.id],
    name: "user_feedback_ticket_id_fk"
  }),
  eventId: foreignKey({
    columns: [table.eventId],
    foreignColumns: [events.id],
    name: "user_feedback_event_id_fk"
  }),
  assignedTo: foreignKey({
    columns: [table.assignedTo],
    foreignColumns: [users.id],
    name: "user_feedback_assigned_to_fk"
  }),
  userIdx: index("user_feedback_user_idx").on(table.userId),
  ticketIdx: index("user_feedback_ticket_idx").on(table.ticketId),
  statusIdx: index("user_feedback_status_idx").on(table.status),
  createdAtIdx: index("user_feedback_created_at_idx").on(table.createdAt),
  severityIdx: index("user_feedback_severity_idx").on(table.severity),
  typeIdx: index("user_feedback_type_idx").on(table.feedbackType),
}));

// Enhanced Ticket Views
export const ticketViews = pgTable("ticket_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  ticketId: integer("ticket_id").notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  viewDuration: integer("view_duration"), // Duration in seconds
  isUnique: boolean("is_unique").default(true),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  userId: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "ticket_views_user_id_fk"
  }).onDelete("cascade"),
  ticketId: foreignKey({
    columns: [table.ticketId],
    foreignColumns: [tickets.id],
    name: "ticket_views_ticket_id_fk"
  }).onDelete("cascade"),
  userIdx: index("ticket_views_user_idx").on(table.userId),
  ticketIdx: index("ticket_views_ticket_idx").on(table.ticketId),
  viewedAtIdx: index("ticket_views_viewed_at_idx").on(table.viewedAt),
  sessionIdx: index("ticket_views_session_idx").on(table.sessionId),
  uniqueIdx: index("ticket_views_unique_idx").on(table.isUnique, table.viewedAt),
  // Composite index for analytics
  ticketDateIdx: index("ticket_views_ticket_date_idx").on(table.ticketId, table.viewedAt),
}));

// New Audit Log Table
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  tableName: varchar("table_name", { length: 50 }).notNull(),
  recordId: integer("record_id").notNull(),
  operation: auditOperationEnum("operation").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  userId: integer("user_id"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userId: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "audit_log_user_id_fk"
  }),
  tableRecordIdx: index("audit_log_table_record_idx").on(table.tableName, table.recordId),
  userDateIdx: index("audit_log_user_date_idx").on(table.userId, table.createdAt),
  operationIdx: index("audit_log_operation_idx").on(table.operation),
  createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
}));

// Cache Invalidation Table
export const cacheInvalidation = pgTable("cache_invalidation", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 100 }),
  invalidatedAt: timestamp("invalidated_at").defaultNow().notNull(),
}, (table) => ({
  cacheKeyIdx: index("cache_invalidation_cache_key_idx").on(table.cacheKey),
  invalidatedAtIdx: index("cache_invalidation_invalidated_at_idx").on(table.invalidatedAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  contactRequestsAsSeller: many(contactRequests, { relationName: "seller" }),
  contactRequestsAsRequester: many(contactRequests, { relationName: "requester" }),
  feedback: many(userFeedback),
  reviewsGiven: many(userReviews, { relationName: "reviewer" }),
  reviewsReceived: many(userReviews, { relationName: "reviewee" }),
  ticketViews: many(ticketViews),
  auditLogs: many(auditLog),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  tickets: many(tickets),
  parentEvent: one(events, {
    fields: [events.parentEventId],
    references: [events.id],
    relationName: "parentEvent",
  }),
  childEvents: many(events, { relationName: "parentEvent" }),
  feedback: many(userFeedback),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  event: one(events, {
    fields: [tickets.eventId],
    references: [events.id],
  }),
  seller: one(users, {
    fields: [tickets.sellerId],
    references: [users.id],
  }),
  contactRequests: many(contactRequests),
  views: many(ticketViews),
  feedback: many(userFeedback),
}));

export const contactRequestsRelations = relations(contactRequests, ({ one, many }) => ({
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
  reviews: many(userReviews),
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

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [userFeedback.ticketId],
    references: [tickets.id],
  }),
  event: one(events, {
    fields: [userFeedback.eventId],
    references: [events.id],
  }),
  assignee: one(users, {
    fields: [userFeedback.assignedTo],
    references: [users.id],
    relationName: "assignee",
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

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertVenueSchema = createInsertSchema(venues);
export const insertEventSchema = createInsertSchema(events);
export const insertTicketSchema = createInsertSchema(tickets);
export const insertContactRequestSchema = createInsertSchema(contactRequests);
export const insertUserReviewSchema = createInsertSchema(userReviews);
export const insertUserFeedbackSchema = createInsertSchema(userFeedback);

export const insertTicketViewSchema = createInsertSchema(ticketViews);
export const insertAuditLogSchema = createInsertSchema(auditLog);
export const insertCacheInvalidationSchema = createInsertSchema(cacheInvalidation);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type UserReview = typeof userReviews.$inferSelect;

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

export type InsertTicketView = z.infer<typeof insertTicketViewSchema>;
export type TicketView = typeof ticketViews.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

export type InsertCacheInvalidation = z.infer<typeof insertCacheInvalidationSchema>;
export type CacheInvalidation = typeof cacheInvalidation.$inferSelect;

// Enhanced validation schemas for forms
export const enhancedTicketListingSchema = z.object({
  eventId: z.number().min(1, "Event selection is required"),
  title: z.string().min(1, "Title is required"),
  section: z.string().optional(),
  row: z.string().optional(),
  seat: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  currency: z.string().length(3, "Currency must be 3-letter code").default("USD"),
  originalPrice: z.number().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  transferMethod: z.enum(["in-person", "electronic", "mail", "digital", "mobile_transfer"]),
  additionalInfo: z.string().max(1000, "Additional info cannot exceed 1000 characters").optional(),
  showContactInfo: z.boolean().default(false),
  expiresAt: z.date().min(new Date(), "Expiry date must be in the future").optional(),
});

export const enhancedUserRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").optional(),
  country: z.string().length(2, "Country must be 2-letter ISO code"),
  timezone: z.string().default("UTC"),
  language: z.string().length(2, "Language must be 2-letter ISO code").default("en"),
  preferredContactMethod: z.enum(["email", "whatsapp", "phone"]).default("email"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const enhancedUserLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const enhancedContactRequestSchema = z.object({
  ticketId: z.number().min(1, "Ticket ID is required"),
  contactMethod: z.enum(["whatsapp", "phone", "email", "instagram"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  requestedQuantity: z.number().min(1, "Quantity must be at least 1"),
  offeredPrice: z.number().min(0.01, "Price must be greater than 0").optional(),
  meetingLocation: z.string().optional(),
  preferredTime: z.string().optional(),
});

export const enhancedUserReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(10, "Comment must be at least 10 characters").optional(),
  reviewType: z.enum(["buyer_review_seller", "seller_review_buyer"]),
  contactRequestId: z.number().optional(),
});