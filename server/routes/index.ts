
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
import ticketViewRoutes from "./ticket-views";
import healthRoutes from "./health.routes";

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
  app.use("/api/ticket-views", ticketViewRoutes);
  app.use("/health", healthRoutes);
  
  return server;
}
