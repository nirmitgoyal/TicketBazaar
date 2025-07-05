import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

// Instagram handle schema - max 20 chars as per spec
const instagramHandleSchema = z.object({
  instagram_handle: z
    .string()
    .min(1, "Instagram handle is required")
    .max(20, "Instagram handle must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_.]+$/, "Instagram handle can only contain letters, numbers, dots, and underscores")
});

// PUT /api/users/:id/instagram - Idempotent Instagram handle update
router.put("/:id/instagram", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = (req.user as any).id;

    // Ensure users can only update their own Instagram handle
    if (userId !== currentUserId) {
      return res.status(403).json({ message: "Forbidden: Cannot update another user's Instagram handle" });
    }

    // Validate request body
    const validationResult = instagramHandleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { instagram_handle } = validationResult.data;

    // Update user's Instagram handle
    const { storage } = await import("../storage");
    const updatedUser = await storage.updateUserInstagram(userId, instagram_handle);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return 204 No Content for successful idempotent update
    return res.status(204).send();
  } catch (error) {
    logger.error('USER_ROUTES', 'Error updating Instagram handle:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;