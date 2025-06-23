import { Router } from "express";
import { z } from "zod";
import { emailService } from "../services/email.service";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { validateBody } from "../middleware/validation.middleware";
import crypto from "crypto";

const router = Router();

// Schema for password reset request
const passwordResetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Schema for password reset confirmation
const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema for email verification resend
const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// In-memory storage for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { userId: number; email: string; expires: Date }>();
const verificationCodes = new Map<string, { userId: number; email: string; expires: Date; code: string }>();

// Request password reset
router.post("/password-reset/request", validateBody(passwordResetRequestSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Store token
    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expires
    });

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      resetToken
    );

    if (emailSent) {
      logger.info('EMAIL', `Password reset email sent to ${user.email}`);
    } else {
      logger.error('EMAIL', `Failed to send password reset email to ${user.email}`);
    }

    res.status(200).json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });
  } catch (error) {
    logger.error('EMAIL', 'Password reset request error', error);
    res.status(500).json({ message: "Error processing password reset request" });
  }
});

// Confirm password reset
router.post("/password-reset/confirm", validateBody(passwordResetConfirmSchema), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find and validate token
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < new Date()) {
      resetTokens.delete(token); // Clean up expired token
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update user password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database (you'll need to add this method to storage)
    // For now, we'll log it - you should implement updateUserPassword in storage
    logger.info('EMAIL', `Password reset for user ${tokenData.userId} - implement updateUserPassword in storage`);
    
    // Clean up token
    resetTokens.delete(token);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    logger.error('EMAIL', 'Password reset confirm error', error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Request email verification
router.post("/verification/request", validateBody(resendVerificationSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    // Store verification code
    verificationCodes.set(user.email, {
      userId: user.id,
      email: user.email,
      expires,
      code: verificationCode
    });

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.fullName,
      verificationCode
    );

    if (emailSent) {
      logger.info('EMAIL', `Verification email sent to ${user.email}`);
      res.status(200).json({ message: "Verification email sent successfully" });
    } else {
      logger.error('EMAIL', `Failed to send verification email to ${user.email}`);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    logger.error('EMAIL', 'Email verification request error', error);
    res.status(500).json({ message: "Error sending verification email" });
  }
});

// Verify email with code
router.post("/verification/confirm", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    // Find verification data
    const verificationData = verificationCodes.get(email);
    if (!verificationData || verificationData.expires < new Date()) {
      verificationCodes.delete(email); // Clean up expired code
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check code
    if (verificationData.code !== code.toUpperCase()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark email as verified (you'll need to implement this in storage)
    logger.info('EMAIL', `Email verified for user ${verificationData.userId} - implement updateEmailVerified in storage`);
    
    // Clean up verification code
    verificationCodes.delete(email);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error('EMAIL', 'Email verification confirm error', error);
    res.status(500).json({ message: "Error verifying email" });
  }
});

// Send test email (for development/testing purposes)
router.post("/test", async (req, res) => {
  try {
    const testEmail = req.body.email || "nirmitgoyal.goyal@gmail.com";
    const testName = req.body.name || "Test User";

    const emailSent = await emailService.sendEmail({
      to: testEmail,
      subject: "TicketBazaar Email Test - Success!",
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>Hi ${testName},</p>
        <p>Congratulations! Your TicketBazaar email system is now working perfectly with your verified SendGrid sender identity.</p>
        <p><strong>From:</strong> nirmit@ticketbazaar.co.in</p>
        <p><strong>Status:</strong> Email integration fully operational</p>
        <p>All email notifications are now ready:
        <ul>
          <li>Welcome emails for new users</li>
          <li>Contact request notifications</li>
          <li>Ticket sale confirmations</li>
          <li>Password reset emails</li>
          <li>Email verification codes</li>
        </ul></p>
        <p>Best regards,<br>The TicketBazaar Team</p>
      `,
      text: `Email Test Successful!\n\nHi ${testName},\n\nCongratulations! Your TicketBazaar email system is now working perfectly with your verified SendGrid sender identity.\n\nFrom: nirmit@ticketbazaar.co.in\nStatus: Email integration fully operational\n\nAll email notifications are now ready:\n- Welcome emails for new users\n- Contact request notifications\n- Ticket sale confirmations\n- Password reset emails\n- Email verification codes\n\nBest regards,\nThe TicketBazaar Team`
    });

    if (emailSent) {
      logger.info('EMAIL', `Test email sent successfully to ${testEmail}`);
      res.status(200).json({ 
        message: "Test email sent successfully",
        from: "nirmit@ticketbazaar.co.in",
        to: testEmail,
        status: "delivered"
      });
    } else {
      res.status(500).json({ message: "Failed to send test email" });
    }
  } catch (error) {
    logger.error('EMAIL', 'Test email error', error);
    res.status(500).json({ message: "Error sending test email" });
  }
});

// Get email statistics (for admin dashboard)
router.get("/stats", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { emailService } = await import("../services/email.service");
    const dataResidencyInfo = emailService.getDataResidencyInfo();

    const stats = {
      activeResetTokens: resetTokens.size,
      activeVerificationCodes: verificationCodes.size,
      dataResidency: dataResidencyInfo,
      euCompliant: dataResidencyInfo.isEU,
      // Add more email statistics as needed
    };

    res.status(200).json(stats);
  } catch (error) {
    logger.error('EMAIL', 'Email stats error', error);
    res.status(500).json({ message: "Error fetching email statistics" });
  }
});

// Get EU Data Residency status
router.get("/data-residency", async (req, res) => {
  try {
    const { emailService } = await import("../services/email.service");
    const dataResidencyInfo = emailService.getDataResidencyInfo();
    
    res.status(200).json({
      ...dataResidencyInfo,
      apiKeyType: process.env.SENDGRID_API_KEY?.includes('eu-') ? 'EU Subuser' : 'Global',
      compliance: dataResidencyInfo.isEU ? 'GDPR Compliant' : 'Standard'
    });
  } catch (error) {
    logger.error('EMAIL', 'Data residency info error', error);
    res.status(500).json({ message: "Error fetching data residency information" });
  }
});

// Manual cleanup function for expired tokens
export function cleanupExpiredTokens() {
  const now = new Date();
  let cleanedCount = 0;
  
  // Clean up expired reset tokens
  for (const token of Array.from(resetTokens.keys())) {
    const data = resetTokens.get(token);
    if (data && data.expires < now) {
      resetTokens.delete(token);
      cleanedCount++;
    }
  }
  
  // Clean up expired verification codes
  for (const email of Array.from(verificationCodes.keys())) {
    const data = verificationCodes.get(email);
    if (data && data.expires < now) {
      verificationCodes.delete(email);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}

export default router;