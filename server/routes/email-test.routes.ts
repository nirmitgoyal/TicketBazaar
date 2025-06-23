import { Router } from "express";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

const router = Router();

// Test email endpoint (no authentication required)
router.post("/send", async (req, res) => {
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
        success: true,
        message: "Test email sent successfully",
        from: "Ticket Bazaar <nirmit@ticketbazaar.co.in>",
        to: testEmail,
        status: "delivered"
      });
    } else {
      logger.error('EMAIL', `Failed to send test email to ${testEmail}`);
      res.status(500).json({ 
        success: false,
        message: "Failed to send test email" 
      });
    }
  } catch (error) {
    logger.error('EMAIL', 'Test email error', error);
    res.status(500).json({ 
      success: false,
      message: "Error sending test email",
      error: error.message 
    });
  }
});

// Test welcome email
router.post("/welcome", async (req, res) => {
  try {
    const testEmail = req.body.email || "nirmitgoyal.goyal@gmail.com";
    const testName = req.body.name || "Test User";

    const emailSent = await emailService.sendWelcomeEmail(testEmail, testName);

    if (emailSent) {
      logger.info('EMAIL', `Welcome email sent successfully to ${testEmail}`);
      res.status(200).json({ 
        success: true,
        message: "Welcome email sent successfully",
        type: "welcome",
        to: testEmail
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "Failed to send welcome email" 
      });
    }
  } catch (error) {
    logger.error('EMAIL', 'Welcome email test error', error);
    res.status(500).json({ 
      success: false,
      message: "Error sending welcome email",
      error: error.message 
    });
  }
});

// Get email service status
router.get("/status", async (req, res) => {
  try {
    const { emailService } = await import("../services/email.service");
    const dataResidencyInfo = emailService.getDataResidencyInfo();
    
    res.status(200).json({
      status: "operational",
      from: "Ticket Bazaar <nirmit@ticketbazaar.co.in>",
      dataResidency: dataResidencyInfo,
      apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
      apiKeyType: process.env.SENDGRID_API_KEY?.includes('eu-') ? 'EU Subuser' : 'Global'
    });
  } catch (error) {
    logger.error('EMAIL', 'Status check error', error);
    res.status(500).json({ 
      status: "error",
      message: "Error checking email service status",
      error: error.message 
    });
  }
});

export default router;