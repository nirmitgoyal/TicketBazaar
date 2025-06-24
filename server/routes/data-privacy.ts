import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { z } from "zod";

const router = Router();

// Schema for data deletion request
const dataDeletionSchema = z.object({
  confirmDelete: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you want to delete all your data",
  }),
  reason: z.string().optional(),
});

// Export user data
router.get("/export", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userData = await storage.exportUserData(userId);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json(userData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ 
      message: "Failed to export user data. Please try again later." 
    });
  }
});

// Request data deletion
router.post("/delete", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const validationResult = dataDeletionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: validationResult.error.errors 
      });
    }

    const success = await storage.deleteAllUserData(userId);
    
    if (success) {
      // Clear the session since user is deleted
      req.logout((err) => {
        if (err) {
          console.error("Error logging out user:", err);
        }
      });
      
      res.json({ 
        message: "Your account and all associated data have been permanently deleted." 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to delete user data. Please contact support for assistance." 
      });
    }
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ 
      message: "An error occurred while processing your deletion request. Please contact support." 
    });
  }
});

// Get data deletion instructions (public endpoint)
router.get("/deletion-instructions", (req, res) => {
  res.json({
    title: "Data Deletion Instructions",
    description: "How to request deletion of your personal data from Ticket Bazaar",
    instructions: [
      {
        step: 1,
        title: "Sign in to your account",
        description: "You must be logged in to request data deletion"
      },
      {
        step: 2,
        title: "Navigate to Privacy Settings", 
        description: "Go to your account settings and find the Privacy & Data section"
      },
      {
        step: 3,
        title: "Request data deletion",
        description: "Click on 'Delete My Account' and confirm your request"
      },
      {
        step: 4,
        title: "Confirmation",
        description: "Your account and all associated data will be permanently deleted immediately"
      }
    ],
    dataTypes: [
      "Personal information (name, email, phone)",
      "Account credentials and authentication data",
      "Ticket listings and transaction history",
      "Contact requests and communications",
      "Reviews and ratings given/received",
      "User feedback and support interactions"
    ],
    retention: "Data is deleted immediately upon confirmation. This action cannot be undone.",
    contact: {
      email: "privacy@ticketbazaar.co.in",
      description: "For questions about data deletion or if you need assistance, contact our privacy team"
    }
  });
});

export default router;
