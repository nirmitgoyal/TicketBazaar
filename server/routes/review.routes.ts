import { Router } from "express";
import { validateBody } from "../middleware/validation.middleware";
import { userReviewSchema } from "@shared/schema";
import { ReviewController } from "../controllers/index";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();
const reviewController = new ReviewController();

// Get review by ID
router.get("/:id", reviewController.getReviewById);

// Get user reviews (reviews given to a user)
router.get("/user/:userId", reviewController.getUserReviews);

// Get reviews by reviewer (reviews given by a user)
router.get("/reviewer/:reviewerId", reviewController.getReviewsByReviewer);

// Create a new review
router.post(
  "/",
  isAuthenticated,
  validateBody(userReviewSchema),
  reviewController.createReview,
);

// Update a review
router.put(
  "/:id",
  isAuthenticated,
  validateBody(userReviewSchema),
  reviewController.updateReview,
);

// Delete a review
router.delete("/:id", isAuthenticated, reviewController.deleteReview);

export default router;
