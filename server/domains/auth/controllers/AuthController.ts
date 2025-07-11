/**
 * Auth Controller
 * 
 * This controller handles HTTP requests for authentication.
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { container, TOKENS } from '../../../core/DIContainer';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = container.get<AuthService>(TOKENS.AUTH_SERVICE);
  }

  /**
   * Login with email and password
   */
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const user = await this.authService.login({ email, password });

      // Set session
      req.session.userId = user.id;
      await req.session.save();

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  /**
   * Register new user
   */
  register = async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, phone, whatsapp, instagram, country } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Full name, email, and password are required',
        });
      }

      const user = await this.authService.register({
        fullName,
        email,
        password,
        phone,
        whatsapp,
        instagram,
        country,
      });

      // Set session
      req.session.userId = user.id;
      await req.session.save();

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Logout failed',
          });
        }

        res.json({
          success: true,
          message: 'Logged out successfully',
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  };

  /**
   * Get current user
   */
  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const user = await this.authService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'User not found',
      });
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { fullName, phone, whatsapp, instagram, country } = req.body;

      const user = await this.authService.updateProfile(userId, {
        fullName,
        phone,
        whatsapp,
        instagram,
        country,
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      });
    }
  };

  /**
   * Change password
   */
  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
        });
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Password change failed',
      });
    }
  };
}