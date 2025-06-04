import { storage } from "../storage";
import { UserReview, InsertUserReview } from "@shared/schema";
import { UserService } from "./user.service";
import { TransactionService } from "./transaction.service";

/**
 * Service class to handle review-related business logic
 */
export class ReviewService {
  private userService: UserService;
  private transactionService: TransactionService;

  constructor() {
    this.userService = new UserService();
    this.transactionService = new TransactionService();
  }

  /**
   * Get review by ID
   * @param id Review ID
   * @returns Review object or undefined if not found
   */
  async getReviewById(id: number): Promise<UserReview | undefined> {
    return storage.getReview(id);
  }

  /**
   * Get reviews for a user
   * @param userId User ID being reviewed
   * @returns Array of reviews for the specified user
   */
  async getUserReviews(userId: number): Promise<UserReview[]> {
    return storage.getUserReviews(userId);
  }

  /**
   * Get reviews written by a reviewer
   * @param reviewerId User ID of reviewer
   * @returns Array of reviews written by the specified reviewer
   */
  async getReviewsByReviewer(reviewerId: number): Promise<UserReview[]> {
    return storage.getReviewsByReviewer(reviewerId);
  }

  /**
   * Get a review for a specific transaction
   * @param userId User ID being reviewed
   * @param transactionId Transaction ID
   * @returns Review for the transaction or undefined if not found
   */
  async getUserReviewForTransaction(
    userId: number,
    transactionId: number,
  ): Promise<UserReview | undefined> {
    return storage.getUserReviewForTransaction(userId, transactionId);
  }

  /**
   * Create a new review
   * @param reviewData Review data
   * @returns Created review
   */
  async createReview(reviewData: InsertUserReview): Promise<UserReview> {
    // Check if the user exists
    const user = await this.userService.getUserById(reviewData.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the reviewer exists
    const reviewer = await this.userService.getUserById(reviewData.reviewerId);
    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    // Check if the transaction exists and is completed
    const transaction = await this.transactionService.getTransactionById(
      reviewData.transactionId,
    );
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "completed") {
      throw new Error("Cannot review a transaction that is not completed");
    }

    // Check if a review already exists for this transaction
    const existingReview = await this.getUserReviewForTransaction(
      reviewData.userId,
      reviewData.transactionId,
    );

    if (existingReview) {
      throw new Error("A review already exists for this transaction");
    }

    // Validate rating (should be between 1 and 5)
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Create the review
    const review = await storage.createReview(reviewData);

    // Update user rating
    await this.updateUserRating(reviewData.userId);

    return review;
  }

  /**
   * Update a review
   * @param id Review ID
   * @param rating New rating
   * @param comment New comment (optional)
   * @returns Updated review or undefined if not found
   */
  async updateReview(
    id: number,
    rating: number,
    comment?: string,
  ): Promise<UserReview | undefined> {
    // Validate rating (should be between 1 and 5)
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await storage.getReview(id);
    if (!review) {
      return undefined;
    }

    // Update the review
    const updatedReview = await storage.updateReview(id, rating, comment);

    // Update user rating
    if (updatedReview) {
      await this.updateUserRating(updatedReview.userId);
    }

    return updatedReview;
  }

  /**
   * Delete a review
   * @param id Review ID
   * @returns True if deletion was successful, false otherwise
   */
  async deleteReview(id: number): Promise<boolean> {
    const review = await storage.getReview(id);
    if (!review) {
      return false;
    }

    const result = await storage.deleteReview(id);

    // Update user rating
    if (result) {
      await this.updateUserRating(review.userId);
    }

    return result;
  }

  /**
   * Update a user's rating based on their reviews
   * @param userId User ID
   * @returns Updated user
   */
  private async updateUserRating(userId: number): Promise<void> {
    const reviews = await this.getUserReviews(userId);

    if (reviews.length === 0) {
      await this.userService.updateUserRating(userId, 0);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update user rating
    await this.userService.updateUserRating(userId, averageRating);
  }
}
