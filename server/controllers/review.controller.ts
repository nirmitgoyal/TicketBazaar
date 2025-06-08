import { Request, Response } from "express";
import { ReviewService } from "../services";
import { userReviewSchema } from "@shared/schema";
import { z } from "zod";

/**
 * Controller for review-related endpoints
 */
export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Get review by ID
   */
  getReviewById = async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const review = await this.reviewService.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving review",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get reviews for a user
   */
  getUserReviews = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const reviews = await this.reviewService.getUserReviews(userId);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving reviews",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get reviews written by a reviewer
   */
  getReviewsByReviewer = async (req: Request, res: Response) => {
    try {
      const reviewerId = parseInt(req.params.reviewerId);
      if (isNaN(reviewerId)) {
        return res.status(400).json({ message: "Invalid reviewer ID" });
      }

      const reviews = await this.reviewService.getReviewsByReviewer(reviewerId);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving reviews",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Create a new review
   */
  createReview = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = userReviewSchema.parse(req.body);

      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res
          .status(401)
          .json({ message: "You must be logged in to create reviews" });
      }

      // Check if user is the reviewer
      if (req.user!.id !== validatedData.reviewerId) {
        return res
          .status(403)
          .json({ message: "You can only create reviews as yourself" });
      }

      // Check if the contact request exists (optional in P2P model)
      if (validatedData.contactRequestId) {
        // Import ContactRequestService if we need to validate the contact request
        // For now, we'll allow reviews without strict contact request validation
        // in the pure P2P model since users can interact outside the platform
      }

      // Create the review
      const review = await this.reviewService.createReview(validatedData as {
        userId: number;
        reviewerId: number;
        rating: number;
        comment?: string;
        contactRequestId?: number;
        reviewType: "buyer_review_seller" | "seller_review_buyer";
      });
      res.status(201).json(review);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("User not found") ||
          error.message.includes("Transaction not found") ||
          error.message.includes("Cannot review a transaction") ||
          error.message.includes("A review already exists"))
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Update a review
   */
  updateReview = async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      // Validate request body
      const updateSchema = z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      });

      const { rating, comment } = updateSchema.parse(req.body);

      // Check if user has permission to update this review
      const review = await this.reviewService.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Only the reviewer can update their review
      if (req.isAuthenticated() && req.user!.id !== review.reviewerId) {
        return res
          .status(403)
          .json({ message: "You can only update your own reviews" });
      }

      // Update the review
      const updatedReview = await this.reviewService.updateReview(
        reviewId,
        rating,
        comment,
      );
      if (!updatedReview) {
        return res
          .status(404)
          .json({ message: "Review not found or could not be updated" });
      }

      res.status(200).json(updatedReview);
    } catch (error) {
      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Delete a review
   */
  deleteReview = async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      // Check if user has permission to delete this review
      const review = await this.reviewService.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Only the reviewer can delete their review
      if (req.isAuthenticated() && req.user!.id !== review.reviewerId) {
        return res
          .status(403)
          .json({ message: "You can only delete your own reviews" });
      }

      // Delete the review
      const success = await this.reviewService.deleteReview(reviewId);
      if (!success) {
        return res
          .status(404)
          .json({ message: "Review not found or could not be deleted" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({
        message: "Error deleting review",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
