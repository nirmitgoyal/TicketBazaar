import express from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = express.Router();

// GET /api/users/:id - Get user by ID (for seller information)
router.get("/:id", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      const duration = Date.now() - startTime;
      logger.info('express', `GET /api/users/:id 400 in ${duration}ms :: {"message":"Invalid user ID"}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    
    if (!user) {
      const duration = Date.now() - startTime;
      logger.info('express', `GET /api/users/:id 404 in ${duration}ms :: {"message":"User not found"}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Return only safe user information (exclude password and sensitive data)
    const safeUserData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      instagram: user.instagram,
      rating: user.rating,
      ratingsCount: user.ratingsCount,
      preferredContactMethod: user.preferredContactMethod,
      country: user.country,
      verificationStatus: user.verificationStatus,
      governmentIdVerified: user.governmentIdVerified,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    };

    const duration = Date.now() - startTime;
    logger.info('express', `GET /api/users/:id 200 in ${duration}ms :: User data retrieved`);
    res.json(safeUserData);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('express', `GET /api/users/:id 500 in ${duration}ms :: Error retrieving user`, error);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined 
    });
  }
});

export default router;