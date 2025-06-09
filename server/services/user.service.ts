import { storage } from "../storage";
import { InsertUser, User } from "@shared/schema";

/**
 * Service class to handle user-related business logic for P2P model
 */
export class UserService {
  /**
   * Process referral code during user registration
   */
  async processReferralCode(userId: number, referralCode: string): Promise<void> {
    try {
      console.log(`Processing referral code ${referralCode} for user ${userId}`);
      // The referral processing will be implemented once the database schema is properly integrated
      // For now, we log the attempt and the system will work without referral rewards
    } catch (error) {
      console.error('Error processing referral code:', error);
    }
  }
  /**
   * Get user by ID
   * @param id User ID
   * @returns User object or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return storage.getUser(id);
  }

  /**
   * Get user by email (main identifier in P2P model)
   * @param email Email address
   * @returns User object or undefined if not found
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.getUserByEmail(email);
  }

  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  async createUser(userData: InsertUser): Promise<User> {
    return storage.createUser(userData);
  }

  /**
   * Update a user's rating
   * @param userId User ID
   * @param newRating New rating value
   * @returns Updated user or undefined if not found
   */
  async updateUserRating(
    userId: number,
    newRating: number,
  ): Promise<User | undefined> {
    return storage.updateUserRating(userId, newRating);
  }

  /**
   * Update a user's phone number
   * @param userId User ID
   * @param phone New phone number
   * @returns Updated user or undefined if not found
   */
  async updateUserPhone(
    userId: number,
    phone: string,
  ): Promise<User | undefined> {
    return storage.updateUserPhone(userId, phone);
  }
}
