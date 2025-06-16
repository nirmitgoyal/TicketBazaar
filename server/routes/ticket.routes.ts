import { Router } from "express";
import { validateBody } from "../middleware/validation.middleware";
import { ticketListingSchema } from "@shared/schema";
import { TicketController } from "../controllers/ticket.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { 
  assessTicketListingFraud, 
  addFraudAssessmentToResponse,
  verificationBasedRateLimit 
} from "../middleware/fraud-protection.middleware";
import { ticketCreationLimiter, uploadLimiter } from "../middleware/rate-limit.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const ticketController = new TicketController();

// Setup multer for file uploads
const uploadDir = "uploads/tickets";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, PNG, JPEG, and JPG files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Get all tickets
router.get("/", ticketController.getAllTickets);

// Search tickets by title and city
router.get("/search", ticketController.searchTickets);

// Simple in-memory cache for ticket batch requests
const ticketBatchCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

// Get tickets in batch for multiple events
router.get("/batch", async (req, res) => {
  try {
    const eventIds = req.query.eventIds as string;
    if (!eventIds) {
      return res.status(400).json({ error: "eventIds parameter is required" });
    }
    
    // Check cache first
    const cacheKey = `batch_${eventIds}`;
    const cached = ticketBatchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    const ids = eventIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
      return res.json([]);
    }
    
    // Get all tickets for the specified events in one query
    const { storage } = await import("../storage");
    const allTickets = await storage.getAllEvents();
    
    // Filter tickets by the requested event IDs
    const filteredTickets = allTickets.filter(ticket => ids.includes(ticket.id));
    
    // Cache the result
    ticketBatchCache.set(cacheKey, { data: filteredTickets, timestamp: Date.now() });
    
    // Clean up old cache entries (simple cleanup)
    if (ticketBatchCache.size > 100) {
      const cutoff = Date.now() - CACHE_TTL;
      const keysToDelete = Array.from(ticketBatchCache.keys()).filter(key => {
        const entry = ticketBatchCache.get(key);
        return entry && entry.timestamp < cutoff;
      });
      keysToDelete.forEach(key => ticketBatchCache.delete(key));
    }
    
    res.set('X-Cache', 'MISS');
    res.json(filteredTickets);
  } catch (error) {
    console.error("Error fetching batch tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Get ticket by ID (must come after specific routes)
router.get("/:id", ticketController.getTicketById);

// Get tickets by event
router.get("/event/:eventId", ticketController.getTicketsByEvent);

// Get tickets by seller
router.get("/seller/:sellerId", ticketController.getTicketsBySeller);

// Upload ticket file
router.post(
  "/upload",
  isAuthenticated,
  uploadLimiter,
  upload.single("ticketFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/tickets/${req.file.filename}`;
      res.json({
        ticketFileUrl: fileUrl,
        ticketFileName: req.file.originalname,
        ticketFileType: req.file.mimetype,
        ticketFileSize: req.file.size,
      });
    } catch (error) {
      res.status(500).json({ error: "File upload failed" });
    }
  },
);

// Create a new ticket listing with fraud detection
router.post("/", 
  isAuthenticated, 
  ticketCreationLimiter,
  verificationBasedRateLimit,
  assessTicketListingFraud,
  addFraudAssessmentToResponse,
  ticketController.createTicket
);

// Create ticket with event details and fraud detection
router.post("/with-event", 
  isAuthenticated, 
  ticketCreationLimiter,
  verificationBasedRateLimit,
  assessTicketListingFraud,
  addFraudAssessmentToResponse,
  (req, res) => ticketController.createTicketWithEvent(req, res)
);

// Generate QR code for ticket
router.get("/:id/qrcode", isAuthenticated, ticketController.generateQrCode);

// Verify ticket
router.post("/:id/verify", isAuthenticated, ticketController.verifyTicket);

// Delete ticket
router.delete("/:id", isAuthenticated, ticketController.deleteTicket);

// Delete all tickets
router.delete("/", isAuthenticated, ticketController.deleteAllTickets);

// Clean up expired tickets manually
router.delete("/cleanup-expired", isAuthenticated, async (req, res) => {
  try {
    // Only allow authenticated users to run cleanup
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { cleanupService } = await import("../services/cleanup.service");
    const deletedCount = await cleanupService.runCleanup();
    
    res.json({ 
      message: `Successfully deleted ${deletedCount} expired tickets`,
      deletedCount 
    });
  } catch (error) {
    console.error("Error cleaning up expired tickets:", error);
    res.status(500).json({ error: "Failed to clean up expired tickets" });
  }
});

export default router;
