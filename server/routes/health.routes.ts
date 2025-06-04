import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

// Health check endpoint for Heroku
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);
    
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      database: "connected"
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected"
    };
    
    res.status(503).json(errorStatus);
  }
});

// Readiness check for Kubernetes/container orchestration
router.get("/ready", async (req: Request, res: Response) => {
  try {
    // More comprehensive readiness check
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;