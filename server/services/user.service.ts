import { storage } from "../storage";
import { InsertUser, User } from "@shared/schema";
import { randomBytes } from "crypto";

/**
 * Service class to handle user-related business logic
 */
export class UserService {
  /**
   * Get user by ID
   * @param id User ID
   * @returns User object or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return storage.getUser(id);
  }

  /**
   * Get user by username
   * @param username Username
   * @returns User object or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.getUserByUsername(username);
  }

  /**
   * Get user by email
   * @param email Email address
   * @returns User object or undefined if not found
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.getUserByEmail(email);
  }

  /**
   * Get user by Google ID
   * @param googleId Google ID
   * @returns User object or undefined if not found
   */
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return storage.getUserByGoogleId(googleId);
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
   * Create a user from Google profile
   * @param profile Google profile data
   * @returns Created or updated user
   */
  async createOrUpdateUserFromGoogle(profile: {
    id: string;
    emails?: { value: string }[];
    displayName?: string;
  }): Promise<User | undefined> {
    try {
      // Get email from profile
      const email = profile.emails?.[0]?.value;
      if (!email) {
        throw new Error("No email found in Google profile");
      }

      // Check if user exists by Google ID first
      let user = await this.getUserByGoogleId(profile.id);

      // If not found by Google ID, try email
      if (!user) {
        user = await this.getUserByEmail(email);
      }

      // If user doesn't exist, create a new one
      if (!user) {
        const newUser = {
          username: `${email.split("@")[0]}${Math.floor(Math.random() * 1000)}`, // Generate a username
          password: randomBytes(16).toString("hex"), // Random password (not used for login)
          fullName: profile.displayName || "Google User",
          email: email,
          phone: "",
          googleId: profile.id,
        };

        user = await this.createUser(newUser);
      }
      // If user exists but doesn't have googleId, update it
      else if (!user.googleId) {
        user = await this.updateUserGoogleId(user.id, profile.id);
      }

      return user;
    } catch (error) {
      console.error("Error in createOrUpdateUserFromGoogle:", error);
      throw error;
    }
  }

  /**
   * Update a user's Google ID
   * @param userId User ID
   * @param googleId Google ID
   * @returns Updated user or undefined if not found
   */
  async updateUserGoogleId(
    userId: number,
    googleId: string,
  ): Promise<User | undefined> {
    return storage.updateUserGoogleId(userId, googleId);
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
}
