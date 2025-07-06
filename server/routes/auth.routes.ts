import { Router } from "express";
import passport from "passport";
import { validateBody } from "../middleware/validation.middleware";
import { UserController } from "../controllers/index";
import { z } from "zod";

const router = Router();
const userController = new UserController();

// Check if Google OAuth is configured
const isGoogleOAuthEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Google OAuth login route (only if configured)
if (isGoogleOAuthEnabled) {
  router.get("/google", (req, res, next) => {
    // Store the returnTo parameter in session before initiating OAuth
    const returnTo = req.query.returnTo as string;
    if (returnTo) {
      req.session.returnTo = returnTo;
    }
    
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  // Google OAuth callback route (only if configured)
  router.get("/google/callback",
    (req, res, next) => {
      passport.authenticate("google", (err, user, info) => {
        if (err || !user) {
          // Authentication failed
          const returnTo = req.session.returnTo;
          const failureRedirect = returnTo 
            ? `/login?returnTo=${encodeURIComponent(returnTo)}&error=authentication_failed`
            : '/login?error=authentication_failed';
          return res.redirect(failureRedirect);
        }
        
        // Authentication succeeded, log in the user
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Check for returnTo in session
          const returnTo = req.session.returnTo || '/';
          
          // Clear the returnTo from session after use
          delete req.session.returnTo;
          
          // Successful authentication, redirect to original route
          res.redirect(returnTo);
        });
      })(req, res, next);
    }
  );
} else {
  // Provide fallback routes that return appropriate errors
  router.get("/google", (req, res) => {
    res.status(503).json({ 
      message: "Google OAuth is not configured on this server",
      error: "SERVICE_UNAVAILABLE"
    });
  });

  router.get("/google/callback", (req, res) => {
    res.status(503).json({ 
      message: "Google OAuth is not configured on this server",
      error: "SERVICE_UNAVAILABLE"
    });
  });
}

// Get current user
router.get("/user", userController.getCurrentUser);

// Update user Instagram profile with validation
router.patch("/user/instagram", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const instagramSchema = z.object({
      instagram: z
        .string()
        .min(1, "Instagram handle is required")
        .refine((handle) => {
          // Remove @ if user includes it and validate handle format
          const cleanHandle = handle.replace(/^@/, "");
          const handleRegex = /^[a-zA-Z0-9_.]+$/;
          return (
            handleRegex.test(cleanHandle) &&
            cleanHandle.length >= 1 &&
            cleanHandle.length <= 30
          );
        }, "Please enter a valid Instagram handle (e.g., username or @username)"),
    });

    const { instagram } = instagramSchema.parse(req.body);

    // Clean the handle by removing @ if present
    const cleanHandle = instagram.replace(/^@/, "");

    // Update user's Instagram profile
    const { storage } = await import("../storage");
    const updatedUser = await storage.updateUserInstagram(
      (req.user as any).id,
      cleanHandle,
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Error updating Instagram profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
    const { password, ...publicUserData } = user;
    res.json(publicUserData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Logout
router.post("/logout", userController.logout);



// Phone number update schema
const updatePhoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number"),
});

// Update phone number
router.patch(
  "/update-phone",
  validateBody(updatePhoneSchema),
  userController.updatePhone,
);

export default router;
