import { Router } from "express";
import { validateBody } from "../middleware/validation.middleware";
import { ticketListingSchema } from "@shared/schema";
import { TicketController } from "../controllers/ticket.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
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

// Get ticket by ID
router.get("/:id", ticketController.getTicketById);

// Get tickets by event
router.get("/event/:eventId", ticketController.getTicketsByEvent);

// Get tickets by seller
router.get("/seller/:sellerId", ticketController.getTicketsBySeller);

// Upload ticket file
router.post(
  "/upload",
  isAuthenticated,
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

// Create a new ticket listing (now expects file info)
router.post("/", isAuthenticated, ticketController.createTicket);

// Create ticket with event details
router.post("/with-event", isAuthenticated, (req, res) =>
  ticketController.createTicketWithEvent(req, res),
);

// Generate QR code for ticket
router.get("/:id/qrcode", isAuthenticated, ticketController.generateQrCode);

// Verify ticket
router.post("/:id/verify", isAuthenticated, ticketController.verifyTicket);

// Delete ticket
router.delete("/:id", isAuthenticated, ticketController.deleteTicket);

// Delete all tickets
router.delete("/", isAuthenticated, ticketController.deleteAllTickets);

export default router;
