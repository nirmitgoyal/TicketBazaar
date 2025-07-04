import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { InsertUser } from "@shared/schema";

interface InstagramProfile {
  id: string;
  username: string;
  media_count: number;
  followers_count: number;
  account_type?: string;
  name?: string;
}

interface InstagramAuthTokenResponse {
  access_token: string;
  user_id: string;
}

export class InstagramAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly apiVersion = "v23.0";
  private readonly baseUrl = "https://api.instagram.com";
  private readonly graphUrl = "https://graph.instagram.com";

  constructor() {
    this.appId = process.env.INSTAGRAM_APP_ID || "";
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || "";
    
    // Get the proper redirect URI based on environment
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : "http://localhost:5000";
    this.redirectUri = `${baseUrl}/api/auth/instagram/callback`;

    if (!this.appId || !this.appSecret) {
      logger.error("AUTH", "Instagram API credentials not configured");
    }
  }

  /**
   * Generate Instagram OAuth URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: "instagram_basic",
      response_type: "code",
      ...(state && { state })
    });

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<InstagramAuthTokenResponse> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code
      });

      const response = await axios.post(
        `${this.baseUrl}/oauth/access_token`,
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error("AUTH", "Failed to exchange Instagram code for token", error);
      throw new Error("Failed to authenticate with Instagram");
    }
  }

  /**
   * Fetch user profile from Instagram
   */
  async getUserProfile(accessToken: string): Promise<InstagramProfile> {
    try {
      const response = await axios.get(
        `${this.graphUrl}/${this.apiVersion}/me`,
        {
          params: {
            fields: "id,username,media_count,followers_count,account_type,name",
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error("AUTH", "Failed to fetch Instagram profile", error);
      throw new Error("Failed to fetch Instagram profile");
    }
  }

  /**
   * Check if user meets eligibility requirements
   */
  checkEligibility(profile: InstagramProfile): { eligible: boolean; reason?: string } {
    // During development/testing, bypass restrictions for test accounts
    if (process.env.NODE_ENV === "development" && profile.account_type === "TEST") {
      return { eligible: true };
    }

    if (profile.media_count < 1) {
      return { 
        eligible: false, 
        reason: "You need at least 1 post on Instagram to continue" 
      };
    }

    if (profile.followers_count < 50) {
      return { 
        eligible: false, 
        reason: "You need at least 50 followers on Instagram to continue" 
      };
    }

    return { eligible: true };
  }

  /**
   * Create or update user from Instagram profile
   */
  async createOrUpdateUser(profile: InstagramProfile, accessToken: string) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByInstagramId(profile.id);

      if (existingUser) {
        // Update existing user
        const updatedUser = await storage.updateUser(existingUser.id, {
          instagram: profile.username,
          instagramAccessToken: this.encryptToken(accessToken),
          lastLoginAt: new Date()
        });
        return updatedUser;
      }

      // Create new user
      const newUser: InsertUser = {
        email: `${profile.username}@instagram.local`, // Placeholder email
        password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
        fullName: profile.name || profile.username,
        country: "IN", // Default to India
        instagram: profile.username,
        instagramId: profile.id,
        instagramAccessToken: this.encryptToken(accessToken),
        isVerified: true // Auto-verify Instagram users
      };

      const createdUser = await storage.createUser(newUser);
      return createdUser;
    } catch (error) {
      logger.error("AUTH", "Failed to create/update user from Instagram", error);
      throw new Error("Failed to process Instagram login");
    }
  }

  /**
   * Encrypt access token for storage
   */
  private encryptToken(token: string): string {
    // Simple encryption for now - in production, use proper encryption
    const secret = process.env.SESSION_SECRET || "default-secret";
    const cipher = crypto.createCipher('aes-256-cbc', secret);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt access token
   */
  private decryptToken(encryptedToken: string): string {
    const secret = process.env.SESSION_SECRET || "default-secret";
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Handle the complete Instagram login flow
   */
  async handleInstagramCallback(req: Request, res: Response) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        logger.warn("AUTH", `Instagram auth denied: ${error}`);
        return res.redirect("/login?error=instagram_denied");
      }

      if (!code || typeof code !== 'string') {
        return res.redirect("/login?error=invalid_code");
      }

      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code);

      // Fetch user profile
      const profile = await this.getUserProfile(tokenData.access_token);

      // Check eligibility
      const eligibility = this.checkEligibility(profile);
      if (!eligibility.eligible) {
        return res.redirect(`/login?error=eligibility&message=${encodeURIComponent(eligibility.reason!)}`);
      }

      // Create or update user
      const user = await this.createOrUpdateUser(profile, tokenData.access_token);

      // Login the user
      req.login(user, (err) => {
        if (err) {
          logger.error("AUTH", "Failed to login user after Instagram auth", err);
          return res.redirect("/login?error=login_failed");
        }

        // Redirect to original page or home
        let returnTo = "/";
        if (typeof state === 'string') {
          returnTo = state;
        }
        res.redirect(returnTo);
      });
    } catch (error) {
      logger.error("AUTH", "Instagram callback error", error);
      res.redirect("/login?error=instagram_error");
    }
  }
}

export const instagramAuthService = new InstagramAuthService();