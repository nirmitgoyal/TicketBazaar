import { Router, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { tickets, users } from "../../shared/schema";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

interface HealthCheckResult {
  service: string;
  status: "healthy" | "unhealthy" | "degraded";
  responseTime: number;
  details?: any;
  error?: string;
}

interface DeepHealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memory: NodeJS.MemoryUsage;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

// Basic health check endpoint
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

// Deep health check endpoint
router.get("/deep", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: HealthCheckResult[] = [];

  // Database connectivity check
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);

  // Database performance check
  const dbPerfCheck = await checkDatabasePerformance();
  checks.push(dbPerfCheck);

  // File system check
  const fsCheck = await checkFileSystem();
  checks.push(fsCheck);

  // Memory usage check
  const memoryCheck = checkMemoryUsage();
  checks.push(memoryCheck);

  // WebSocket service check
  const wsCheck = checkWebSocketService();
  checks.push(wsCheck);

  // Environment variables check
  const envCheck = checkEnvironmentVariables();
  checks.push(envCheck);

  // API endpoints check
  const apiCheck = await checkCriticalEndpoints();
  checks.push(apiCheck);

  // Calculate summary
  const summary = {
    total: checks.length,
    healthy: checks.filter(c => c.status === "healthy").length,
    unhealthy: checks.filter(c => c.status === "unhealthy").length,
    degraded: checks.filter(c => c.status === "degraded").length
  };

  // Determine overall status
  let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";
  if (summary.unhealthy > 0) {
    overallStatus = "unhealthy";
  } else if (summary.degraded > 0) {
    overallStatus = "degraded";
  }

  const healthStatus: DeepHealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "unknown",
    version: process.env.npm_package_version || "unknown",
    memory: process.memoryUsage(),
    checks,
    summary
  };

  const statusCode = overallStatus === "healthy" ? 200 : 
                    overallStatus === "degraded" ? 200 : 503;

  res.status(statusCode).json(healthStatus);
});

// Individual health check functions
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      service: "database_connectivity",
      status: "healthy",
      responseTime: Date.now() - startTime,
      details: { connection: "active" }
    };
  } catch (error) {
    return {
      service: "database_connectivity",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}

async function checkDatabasePerformance(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Test query performance with actual tables
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [ticketCount] = await db.select({ count: sql`count(*)` }).from(tickets);
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: "database_performance",
      status: responseTime < 1000 ? "healthy" : responseTime < 3000 ? "degraded" : "unhealthy",
      responseTime,
      details: {
        users: userCount.count,
        tickets: ticketCount.count
      }
    };
  } catch (error) {
    return {
      service: "database_performance",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown performance error"
    };
  }
}

async function checkFileSystem(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Check if uploads directory exists and is writable
    const uploadsDir = path.resolve(__dirname, "../../uploads");
    await fs.access(uploadsDir, fs.constants.F_OK | fs.constants.W_OK);
    
    // Test write operation
    const testFile = path.join(uploadsDir, "health-check-test.txt");
    await fs.writeFile(testFile, "health check test");
    await fs.unlink(testFile);
    
    return {
      service: "file_system",
      status: "healthy",
      responseTime: Date.now() - startTime,
      details: { uploads_directory: "accessible" }
    };
  } catch (error) {
    return {
      service: "file_system",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "File system error"
    };
  }
}

function checkMemoryUsage(): HealthCheckResult {
  const startTime = Date.now();
  const memUsage = process.memoryUsage();
  const totalMB = memUsage.rss / 1024 / 1024;
  
  // Consider degraded if using more than 400MB, unhealthy if more than 800MB
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (totalMB > 800) {
    status = "unhealthy";
  } else if (totalMB > 400) {
    status = "degraded";
  }
  
  return {
    service: "memory_usage",
    status,
    responseTime: Date.now() - startTime,
    details: {
      rss_mb: Math.round(totalMB),
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024)
    }
  };
}

function checkWebSocketService(): HealthCheckResult {
  const startTime = Date.now();
  try {
    const wsService = (global as any).wsService;
    const isActive = wsService && typeof wsService.getConnectionCount === 'function';
    
    return {
      service: "websocket_service",
      status: isActive ? "healthy" : "degraded",
      responseTime: Date.now() - startTime,
      details: {
        service_available: isActive,
        connections: isActive ? wsService.getConnectionCount() : 0
      }
    };
  } catch (error) {
    return {
      service: "websocket_service",
      status: "degraded",
      responseTime: Date.now() - startTime,
      error: "WebSocket service check failed"
    };
  }
}

function checkEnvironmentVariables(): HealthCheckResult {
  const startTime = Date.now();
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    service: "environment_variables",
    status: missingVars.length === 0 ? "healthy" : "unhealthy",
    responseTime: Date.now() - startTime,
    details: {
      required_vars: requiredVars.length,
      missing_vars: missingVars,
      node_env: process.env.NODE_ENV
    }
  };
}

async function checkCriticalEndpoints(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Test critical database operations
    await db.select().from(tickets).limit(1);
    await db.select().from(users).limit(1);
    
    return {
      service: "critical_endpoints",
      status: "healthy",
      responseTime: Date.now() - startTime,
      details: { endpoints_accessible: true }
    };
  } catch (error) {
    return {
      service: "critical_endpoints",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Endpoint check failed"
    };
  }
}

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