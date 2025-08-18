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
    console.log("[AUTH] Google OAuth initiated with returnTo:", returnTo);
    console.log("[AUTH] Session ID before OAuth:", req.sessionID);
    console.log("[AUTH] Full query params:", req.query);
    
    if (returnTo) {
      req.session.returnTo = returnTo;
      console.log("[AUTH] Setting session.returnTo to:", req.session.returnTo);
      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error("[AUTH] Failed to save session:", err);
        } else {
          console.log("[AUTH] Session saved successfully");
          console.log("[AUTH] Session ID after save:", req.sessionID);
          console.log("[AUTH] Verified session.returnTo:", req.session.returnTo);
        }
        passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
      });
    } else {
      console.log("[AUTH] No returnTo parameter provided, redirecting to home after login");
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }
  });

  // Google OAuth callback route (only if configured)
  router.get("/google/callback",
    (req, res, next) => {
      // Store returnTo value before authentication to prevent loss during session regeneration
      // Also store it in a backup location to handle session regeneration
      const sessionReturnTo = req.session.returnTo;
      
      // Store the returnTo in a temporary property on the request object
      // This survives session regeneration since it's on the request, not session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).__returnTo = sessionReturnTo;
      
      console.log("[AUTH] Google callback received, session returnTo:", sessionReturnTo);
      console.log("[AUTH] Google callback query params:", req.query);
      console.log("[AUTH] Session ID:", req.sessionID);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("[AUTH] Backup returnTo stored:", (req as any).__returnTo);
      
      passport.authenticate("google", (err, user, info) => {
        if (err) {
          // Authentication error
          console.error("[AUTH] Authentication error:", err);
          console.error("[AUTH] Error message:", err.message);
          console.error("[AUTH] Error stack:", err.stack);
          console.error("[AUTH] Error info:", info);
          console.error("[AUTH] Error name:", err.name);
          
          // Log specific OAuth errors
          let errorType = 'authentication_failed';
          let errorMessage = 'Authentication failed';
          
          if (err.name === 'TokenError') {
            console.error("[AUTH] Token exchange failed - likely invalid/expired authorization code");
            if (err.code === 'invalid_grant') {
              errorType = 'invalid_code';
              errorMessage = 'Authorization code is invalid or expired. Please try logging in again.';
            }
          } else if (err.name === 'InternalOAuthError') {
            console.error("[AUTH] OAuth internal error:", err.oauthError);
          }
          
          // Use backup returnTo if session returnTo is lost
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const finalReturnTo = sessionReturnTo || (req as any).__returnTo;
          const failureRedirect = finalReturnTo 
            ? `/login?returnTo=${encodeURIComponent(finalReturnTo)}&error=${errorType}&message=${encodeURIComponent(errorMessage)}`
            : `/login?error=${errorType}&message=${encodeURIComponent(errorMessage)}`;
          return res.redirect(failureRedirect);
        }
        
        if (!user) {
          // No user returned
          console.log("[AUTH] No user returned from authentication");
          console.log("[AUTH] Info:", info);
          
          // Use backup returnTo if session returnTo is lost
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const finalReturnTo = sessionReturnTo || (req as any).__returnTo;
          const failureRedirect = finalReturnTo 
            ? `/login?returnTo=${encodeURIComponent(finalReturnTo)}&error=authentication_failed`
            : '/login?error=authentication_failed';
          return res.redirect(failureRedirect);
        }
        
        // Authentication succeeded, log in the user
        req.logIn(user, (err) => {
          if (err) {
            console.error("[AUTH] Login failed:", err);
            return next(err);
          }
          
          // Use multiple fallback sources for returnTo
          // 1. Captured sessionReturnTo (before any session regeneration)
          // 2. Current session returnTo (might be lost due to regeneration)
          // 3. Backup returnTo stored on request object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const finalReturnTo = sessionReturnTo || req.session.returnTo || (req as any).__returnTo;
          const redirectUrl = finalReturnTo || "/";
          
          console.log("[AUTH] Login successful, preparing redirect to:", redirectUrl);
          console.log("[AUTH] Session ID after login:", req.sessionID);
          console.log("[AUTH] Session returnTo after login:", req.session.returnTo);
          console.log("[AUTH] Using captured sessionReturnTo:", sessionReturnTo);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.log("[AUTH] Backup returnTo:", (req as any).__returnTo);
          console.log("[AUTH] Final returnTo resolved:", finalReturnTo);
          console.log("[AUTH] Final redirect URL:", redirectUrl);
          
          // Clear the returnTo from session after capturing it
          delete req.session.returnTo;
          
          // Clean up the backup returnTo
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (req as any).__returnTo;
          
          // Save session before redirect
          req.session.save((err) => {
            if (err) {
              console.error("[AUTH] Failed to save session after clearing returnTo:", err);
            }
            // Successful authentication, redirect to original route
            res.redirect(redirectUrl);
          });
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
