import { Router } from "express";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

const router = Router();

// Comprehensive email debugging endpoint
router.post("/debug", async (req, res) => {
  try {
    const { testEmail } = req.body;
    const email = testEmail || 'test@example.com';
    
    // Check SendGrid API key
    const apiKey = process.env.SENDGRID_API_KEY;
    const apiKeyInfo = {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey?.substring(0, 10) || 'none',
      isValid: apiKey?.startsWith('SG.') || false
    };

    logger.info('EMAIL_DEBUG', 'API Key Analysis', apiKeyInfo);

    // Test basic email sending with minimal data
    const testResult = await emailService.sendEmail({
      to: email,
      subject: 'SendGrid Debug Test',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    });

    res.json({
      success: testResult,
      apiKey: apiKeyInfo,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      testEmail: email
    });

  } catch (error) {
    logger.error('EMAIL_DEBUG', 'Debug endpoint error', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Test SendGrid API connectivity
router.get("/connectivity", async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    res.json({
      status: response.status,
      ok: response.ok,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (error) {
    logger.error('EMAIL_DEBUG', 'Connectivity test error', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to test SendGrid connectivity'
    });
  }
});

// Check SendGrid API key permissions
router.get("/permissions", async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.sendgrid.com/v3/scopes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const scopes = await response.json();
    
    res.json({
      status: response.status,
      scopes: scopes,
      hasMailSend: Array.isArray((scopes as any)?.scopes) ? (scopes as any).scopes.includes('mail.send') : false
    });

  } catch (error) {
    logger.error('EMAIL_DEBUG', 'Permissions check error', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to check SendGrid permissions'
    });
  }
});

export default router;