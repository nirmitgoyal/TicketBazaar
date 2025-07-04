import { Router } from "express";
import { UserController } from "../controllers/index";
import { instagramAuthService } from "../services/instagram-auth.service";

const router = Router();
const userController = new UserController();

// Instagram OAuth login
router.get("/instagram", (req, res) => {
  const { returnTo } = req.query;
  const state = typeof returnTo === 'string' ? returnTo : undefined;
  const authUrl = instagramAuthService.getAuthorizationUrl(state);
  res.redirect(authUrl);
});

// Instagram OAuth callback
router.get("/instagram/callback", (req, res) => {
  instagramAuthService.handleInstagramCallback(req, res);
});

// Get current user
router.get("/user", userController.getCurrentUser);

// Get user by ID (for seller profiles)
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { storage } = await import("../storage");
    const user = await storage.getUser(parseInt(id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data without sensitive information
    const { password, instagramAccessToken, ...publicUserData } = user;
    res.json(publicUserData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Logout
router.post("/logout", userController.logout);

// Update phone number
router.patch("/update-phone", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { phone } = req.body;
    if (!phone || phone.length < 10 || phone.length > 15) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const { storage } = await import("../storage");
    const updatedUser = await storage.updateUserPhone((req.user as any).id, phone);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, instagramAccessToken, ...userWithoutSensitive } = updatedUser;
    res.status(200).json(userWithoutSensitive);
  } catch (error) {
    res.status(500).json({
      message: "Error updating phone number",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
