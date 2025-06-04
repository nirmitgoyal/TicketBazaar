import { Request, Response } from "express";
import { UserService } from "../services";
import { userLoginSchema, userRegisterSchema } from "@shared/schema";
import passport from "passport";
import { z } from "zod";

/**
 * Controller for user-related endpoints
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get the currently authenticated user
   */
  getCurrentUser = (req: Request, res: Response) => {
    // If not authenticated, return 401
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Return the user object (passport already attaches it to req.user)
    res.status(200).json(req.user);
  };

  /**
   * Register a new user
   */
  registerUser = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = userRegisterSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await this.userService.getUserByUsername(
        validatedData.username,
      );
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await this.userService.getUserByEmail(
        validatedData.email,
      );
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create the user
      const { confirmPassword, ...userData } = validatedData;
      const user = await this.userService.createUser(userData);

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error logging in after registration" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Login with username and password
   */
  loginUser = (req: Request, res: Response, next: Function) => {
    try {
      // Validate request body
      userLoginSchema.parse(req.body);

      // Use passport to authenticate
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });
        }

        // Log the user in
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Logout the current user
   */
  logoutUser = (req: Request, res: Response, next: Function) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  };

  /**
   * Get user profile by ID
   */
  getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove sensitive information
      const { password, ...userProfile } = user;

      res.status(200).json(userProfile);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Validate Instagram profile URL
   */
  private async validateInstagramProfile(url: string): Promise<boolean> {
    try {
      // Basic URL format validation
      const instagramRegex =
        /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/;
      if (!instagramRegex.test(url)) {
        return false;
      }

      // Check if the profile exists by making a request
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Update user Instagram profile
   */
  updateInstagramProfile = async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const instagramSchema = z.object({
        instagram: z
          .string()
          .min(1, "Instagram profile link is required")
          .refine((url) => {
            const instagramRegex =
              /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/;
            return instagramRegex.test(url);
          }, "Please enter a valid Instagram profile URL"),
      });

      const { instagram } = instagramSchema.parse(req.body);

      // Validate that the Instagram profile exists
      const isValidProfile = await this.validateInstagramProfile(instagram);
      if (!isValidProfile) {
        return res.status(400).json({
          message:
            "Instagram profile not found or inaccessible. Please check the URL and try again.",
        });
      }

      // Update user's Instagram profile
      const { storage } = await import("../storage");
      const updatedUser = await storage.updateUserInstagram(
        req.user!.id,
        instagram,
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
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
  };
}
