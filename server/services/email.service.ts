import { MailService } from '@sendgrid/mail';
import { logger } from '../utils/logger';

// Types and Interfaces
interface EmailParams {
  to: string;
  from?: string | EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface NotificationEmailData {
  userName: string;
  ticketTitle?: string;
  eventTitle?: string;
  venue?: string;
  eventDate?: string;
  price?: number;
  oldPrice?: number;
  newPrice?: number;
  savings?: number;
  percentageOff?: number;
  buyerName?: string;
  salePrice?: number;
  city?: string;
  category?: string;
  contactDetails?: string;
  appUrl?: string;
}

interface DataResidencyInfo {
  isEU: boolean;
  description: string;
}

interface EmailServiceConfig {
  defaultFromEmail: string;
  defaultFromName: string;
  appUrl: string;
  isEUDataResidency: boolean;
}

// Configuration and Setup
class EmailServiceSetup {
  private static instance: MailService;

  static initialize(): MailService {
    if (!EmailServiceSetup.instance) {
      // In test environment, allow initialization without real SendGrid API key
      if (process.env.NODE_ENV === 'test' && !process.env.SENDGRID_API_KEY) {
        logger.info('EMAIL', 'Test mode: Using mock email service (no real emails will be sent)');
        EmailServiceSetup.instance = new MailService();
        EmailServiceSetup.instance.setApiKey('SG.test_key_for_testing_only');
        return EmailServiceSetup.instance;
      }

      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SENDGRID_API_KEY environment variable must be set");
      }

      EmailServiceSetup.instance = new MailService();
      EmailServiceSetup.instance.setApiKey(process.env.SENDGRID_API_KEY);
      
      logger.info('EMAIL', 'SendGrid mail service initialized');
    }
    return EmailServiceSetup.instance;
  }

  static configureEUDataResidency(): boolean {
    const isEURequired = process.env.SENDGRID_EU_DATA_RESIDENCY === 'true' ||
                        (process.env.SENDGRID_API_KEY?.includes('eu-') ?? false) ||
                        (process.env.SENDGRID_API_KEY?.includes('.eu.') ?? false);

    if (isEURequired) {
      logger.info('EMAIL', 'EU Data Residency configured - emails will be processed in EU');
      return true;
    }
    
    logger.info('EMAIL', 'Using global data residency');
    return false;
  }
}

// Email Template Generator
class EmailTemplateGenerator {
  private readonly appUrl: string;

  constructor(appUrl: string) {
    this.appUrl = appUrl;
  }

  generateWelcomeEmailHTML(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TicketBazaar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ Welcome to TicketBazaar!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Welcome to TicketBazaar, the global marketplace for secure ticket resales! We're thrilled to have you join our community of ticket enthusiasts.</p>
            
            <h3>What you can do with TicketBazaar:</h3>
            <ul>
              <li>🎭 Browse tickets for events worldwide</li>
              <li>💰 Sell your unwanted tickets safely</li>
              <li>🔔 Get alerts for price drops and new listings</li>
              <li>✅ Verified ticket authentication</li>
              <li>🌍 Multi-currency support</li>
            </ul>
            
            <p>Ready to find your next event? Start exploring now!</p>
            
            <a href="${this.appUrl}" class="button">Explore Tickets</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy ticket hunting!<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you created an account on TicketBazaar.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmailText(userName: string): string {
    return `
Welcome to TicketBazaar!

Hi ${userName}!

Welcome to TicketBazaar, the global marketplace for secure ticket resales! We're thrilled to have you join our community of ticket enthusiasts.

What you can do with TicketBazaar:
- Browse tickets for events worldwide
- Sell your unwanted tickets safely
- Get alerts for price drops and new listings
- Verified ticket authentication
- Multi-currency support

Ready to find your next event? Visit: ${this.appUrl}

If you have any questions, feel free to reach out to our support team.

Happy ticket hunting!
The TicketBazaar Team

This email was sent to you because you created an account on TicketBazaar.
    `.trim();
  }

  generateContactRequestEmailHTML(data: NotificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #32cd32 0%, #228b22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #32cd32; }
          .button { display: inline-block; background: #32cd32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Contact Request!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Great news! Someone is interested in buying your ticket.</p>
            
            <div class="ticket-details">
              <h3>Ticket Details:</h3>
              <p><strong>Event:</strong> ${data.ticketTitle}</p>
              ${data.venue ? `<p><strong>Venue:</strong> ${data.venue}</p>` : ''}
              ${data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}</p>` : ''}
              ${data.price ? `<p><strong>Price:</strong> ₹${data.price}</p>` : ''}
            </div>
            
            <p><strong>Buyer:</strong> ${data.buyerName}</p>
            <p>Please log in to your TicketBazaar account to view the full contact details and respond to this request.</p>
            
            <a href="${this.appUrl}/dashboard" class="button">View Contact Request</a>
            
            <p><em>Remember to be responsive to potential buyers to increase your chances of a successful sale!</em></p>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>You received this email because someone contacted you about your ticket listing on TicketBazaar.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateContactRequestEmailText(data: NotificationEmailData): string {
    return `
New Contact Request!

Hi ${data.userName}!

Great news! Someone is interested in buying your ticket.

Ticket Details:
Event: ${data.ticketTitle}
${data.venue ? `Venue: ${data.venue}` : ''}
${data.eventDate ? `Date: ${data.eventDate}` : ''}
${data.price ? `Price: ₹${data.price}` : ''}

Buyer: ${data.buyerName}

Please log in to your TicketBazaar account to view the full contact details and respond to this request.

Visit: ${this.appUrl}/dashboard

Remember to be responsive to potential buyers to increase your chances of a successful sale!

Best regards,
The TicketBazaar Team

You received this email because someone contacted you about your ticket listing on TicketBazaar.
    `.trim();
  }

  generateVerificationEmailHTML(userName: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #4285f4; }
          .verification-code { font-size: 24px; font-weight: bold; color: #4285f4; letter-spacing: 2px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Verify Your Account</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Thank you for signing up for TicketBazaar! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="code">
              <p>Your verification code is:</p>
              <div class="verification-code">${verificationCode}</div>
            </div>
            
            <p>This code will expire in 24 hours for security reasons.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            
            <p>Welcome to the TicketBazaar community!<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to verify your TicketBazaar account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateVerificationEmailText(userName: string, verificationCode: string): string {
    return `
Verify Your Account

Hi ${userName}!

Thank you for signing up for TicketBazaar! To complete your registration, please verify your email address using the code below:

Your verification code is: ${verificationCode}

This code will expire in 24 hours for security reasons.

If you didn't request this verification, please ignore this email.

Welcome to the TicketBazaar community!
The TicketBazaar Team

This email was sent to verify your TicketBazaar account.
    `.trim();
  }

  generatePasswordResetEmailHTML(userName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>We received a request to reset your TicketBazaar password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>This email was sent because someone requested a password reset for your TicketBazaar account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailText(userName: string, resetUrl: string): string {
    return `
Reset Your Password

Hi ${userName}!

We received a request to reset your TicketBazaar password. Use the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The TicketBazaar Team

This email was sent because someone requested a password reset for your TicketBazaar account.
    `.trim();
  }
}

// Main Email Service Class
export class EmailService {
  private readonly config: EmailServiceConfig;
  private readonly mailService: MailService;
  private readonly templateGenerator: EmailTemplateGenerator;

  constructor() {
    this.config = {
      defaultFromEmail: 'nirmit@ticketbazaar.co.in',
      defaultFromName: 'Ticket Bazaar',
      appUrl: process.env.NODE_ENV === 'production' 
        ? 'https://your-app.replit.app' 
        : 'http://localhost:5000',
      isEUDataResidency: EmailServiceSetup.configureEUDataResidency()
    };

    this.mailService = EmailServiceSetup.initialize();
    this.templateGenerator = new EmailTemplateGenerator(this.config.appUrl);
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      this.validateEmailParams(params);
      
      // In test mode, mock email sending
      if (process.env.NODE_ENV === 'test') {
        logger.info('EMAIL', 'Test mode: Mocking email send', {
          to: params.to,
          subject: params.subject,
          from: params.from || this.config.defaultFromEmail
        });
        return true;
      }
      
      const emailData = this.prepareEmailData(params);
      this.logEmailAttempt(emailData);
      
      const response = await this.mailService.send(emailData);
      this.logEmailSuccess(params, response);
      
      return true;
    } catch (error) {
      this.logEmailError(params, error);
      return false;
    }
  }

  private validateEmailParams(params: EmailParams): void {
    if (!params.to || !params.subject) {
      throw new Error(`Missing required email parameters: to=${params.to}, subject=${params.subject}`);
    }

    // Skip API key validation in test mode
    if (process.env.NODE_ENV !== 'test' && (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.length < 10)) {
      throw new Error('Invalid or missing SendGrid API key');
    }
  }

  private prepareEmailData(params: EmailParams): any {
    const fromField = params.from || {
      email: this.config.defaultFromEmail,
      name: this.config.defaultFromName
    };

    const emailData = {
      to: params.to,
      from: fromField,
      subject: params.subject,
      text: params.text,
      html: params.html,
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData,
    };

    Object.keys(emailData).forEach(key => {
      if (emailData[key] === undefined) {
        delete emailData[key];
      }
    });

    return emailData;
  }

  private logEmailAttempt(emailData: any): void {
    logger.info('EMAIL', 'Attempting to send email', {
      to: emailData.to,
      from: typeof emailData.from === 'string' ? emailData.from : `${emailData.from.name} <${emailData.from.email}>`,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
      apiKeyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 10) + '...'
    });
  }

  private logEmailSuccess(params: EmailParams, response: any): void {
    const residencyInfo = this.config.isEUDataResidency ? ' (EU Data Residency)' : ' (Global)';
    logger.info('EMAIL', `Email sent successfully to ${params.to}: ${params.subject}${residencyInfo}`, {
      messageId: response?.[0]?.headers?.['x-message-id'],
      statusCode: response?.[0]?.statusCode,
      headers: response?.[0]?.headers
    });
  }

  private logEmailError(params: EmailParams, error: any): void {
    logger.error('EMAIL', `Failed to send email to ${params.to}`, {
      error: error.message,
      response: error.response?.body,
      statusCode: error.code || error.response?.statusCode,
      stack: error.stack
    });
  }

  getDataResidencyInfo(): DataResidencyInfo {
    return {
      isEU: this.config.isEUDataResidency,
      description: this.config.isEUDataResidency 
        ? 'EU Data Residency - Emails processed within European Union'
        : 'Global Data Residency - Standard processing'
    };
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to TicketBazaar! 🎟️';
    const html = this.templateGenerator.generateWelcomeEmailHTML(userName);
    const text = this.templateGenerator.generateWelcomeEmailText(userName);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  async sendContactRequestEmail(sellerEmail: string, data: NotificationEmailData): Promise<boolean> {
    const subject = `New Contact Request for ${data.ticketTitle}`;
    const html = this.templateGenerator.generateContactRequestEmailHTML(data);
    const text = this.templateGenerator.generateContactRequestEmailText(data);

    return await this.sendEmail({
      to: sellerEmail,
      subject,
      html,
      text
    });
  }

  async sendVerificationEmail(userEmail: string, userName: string, verificationCode: string): Promise<boolean> {
    const subject = 'Verify your TicketBazaar account';
    const html = this.templateGenerator.generateVerificationEmailHTML(userName, verificationCode);
    const text = this.templateGenerator.generateVerificationEmailText(userName, verificationCode);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<boolean> {
    const subject = 'Reset your TicketBazaar password';
    const resetUrl = `${this.config.appUrl}/reset-password?token=${resetToken}`;
    const html = this.templateGenerator.generatePasswordResetEmailHTML(userName, resetUrl);
    const text = this.templateGenerator.generatePasswordResetEmailText(userName, resetUrl);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }
}

export const emailService = new EmailService();