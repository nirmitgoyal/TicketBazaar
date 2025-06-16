import { Express } from "express";
import { createServer } from "http";
import { setupAuth } from "../auth";
import authRoutes from "./auth.routes";
import eventRoutes from "./event.routes";
import ticketRoutes from "./ticket.routes";
import reviewRoutes from "./review.routes";
import contactRequestRoutes from "./contact-requests";
import dataPrivacyRoutes from "./data-privacy";
import recommendationRoutes from "./recommendations";
import searchHintsRoutes from "./search-hints";
import searchRoutes from "./search.routes";
import autocompleteRoutes from "./autocomplete";
import ticketViewRoutes from "./ticket-views";
import healthRoutes from "./health.routes";
import aiVerificationRoutes from "./ai-verification.routes";

export {
  authRoutes,
  eventRoutes,
  ticketRoutes,
  reviewRoutes,
};

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Setup authentication
  await setupAuth(app);

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/contact-requests", contactRequestRoutes);
  app.use("/api/data-privacy", dataPrivacyRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/search-hints", searchHintsRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/autocomplete", autocompleteRoutes);
  app.use("/api/ticket-views", ticketViewRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/ai-verification", aiVerificationRoutes);

  return server;
}
