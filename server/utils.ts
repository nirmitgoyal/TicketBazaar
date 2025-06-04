import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { logger } from "./utils/logger";

// Legacy function for backward compatibility - use logger directly instead
export function log(message: string, source = "express") {
  logger.info(source, message);
}

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}