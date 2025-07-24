
import { Express } from "express";
import { createServer } from "http";
import { setupAuth } from "../auth";
import authRoutes from "./auth.routes";
import ticketRoutes from "./ticket.routes";
import userRoutes from "./user.routes";
import emailRoutes from "./email.routes";

import contactRequestRoutes from "./contact-requests";
import dataPrivacyRoutes from "./data-privacy";
import recommendationRoutes from "./recommendations";
import searchHintsRoutes from "./search-hints";
import ticketViewRoutes from "./ticket-views";
import healthRoutes from "./health.routes";
import aiVerificationRoutes from "./ai-verification.routes";

export {
  authRoutes,
  ticketRoutes,
  userRoutes,
};

export async function registerRoutes(app: Express) {
  const server = createServer(app);
  
  // Setup authentication
  await setupAuth(app);
  
  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/email", emailRoutes);

  app.use("/api/contact-requests", contactRequestRoutes);
  app.use("/api/data-privacy", dataPrivacyRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/search-hints", searchHintsRoutes);
  app.use("/api/ticket-views", ticketViewRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/ai-verification", aiVerificationRoutes);
  
  return server;
}
