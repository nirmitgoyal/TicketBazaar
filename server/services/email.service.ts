import { MailService } from '@sendgrid/mail';
import { logger } from '../utils/logger';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
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

export class EmailService {
  private readonly defaultFromEmail = 'noreply@ticketbazaar.com';
  private readonly appUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.replit.app' 
    : 'http://localhost:5000';

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const emailData = {
        to: params.to,
        from: params.from || this.defaultFromEmail,
        subject: params.subject,
        text: params.text,
        html: params.html,
        templateId: params.templateId,
        dynamicTemplateData: params.dynamicTemplateData,
      };

      // Remove undefined fields
      Object.keys(emailData).forEach(key => {
        if (emailData[key] === undefined) {
          delete emailData[key];
        }
      });

      await mailService.send(emailData);
      logger.info('EMAIL', `Email sent successfully to ${params.to}: ${params.subject}`);
      return true;
    } catch (error) {
      logger.error('EMAIL', `Failed to send email to ${params.to}`, error);
      return false;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to TicketBazaar! 🎟️';
    const html = this.generateWelcomeEmailHTML(userName);
    const text = this.generateWelcomeEmailText(userName);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // Contact request notification to seller
  async sendContactRequestEmail(
    sellerEmail: string, 
    data: NotificationEmailData
  ): Promise<boolean> {
    const subject = `New Contact Request for ${data.ticketTitle}`;
    const html = this.generateContactRequestEmailHTML(data);
    const text = this.generateContactRequestEmailText(data);

    return await this.sendEmail({
      to: sellerEmail,
      subject,
      html,
      text
    });
  }

  // Ticket sold notification
  async sendTicketSoldEmail(
    sellerEmail: string,
    data: NotificationEmailData
  ): Promise<boolean> {
    const subject = `🎉 Your ticket has been sold!`;
    const html = this.generateTicketSoldEmailHTML(data);
    const text = this.generateTicketSoldEmailText(data);

    return await this.sendEmail({
      to: sellerEmail,
      subject,
      html,
      text
    });
  }

  // Price drop alert
  async sendPriceDropEmail(
    buyerEmail: string,
    data: NotificationEmailData
  ): Promise<boolean> {
    const subject = `💰 Price Drop Alert: ${data.ticketTitle}`;
    const html = this.generatePriceDropEmailHTML(data);
    const text = this.generatePriceDropEmailText(data);

    return await this.sendEmail({
      to: buyerEmail,
      subject,
      html,
      text
    });
  }

  // New listing alert
  async sendNewListingEmail(
    buyerEmail: string,
    data: NotificationEmailData
  ): Promise<boolean> {
    const subject = `🎫 New Ticket Available: ${data.ticketTitle}`;
    const html = this.generateNewListingEmailHTML(data);
    const text = this.generateNewListingEmailText(data);

    return await this.sendEmail({
      to: buyerEmail,
      subject,
      html,
      text
    });
  }

  // Email verification
  async sendVerificationEmail(
    userEmail: string,
    userName: string,
    verificationCode: string
  ): Promise<boolean> {
    const subject = 'Verify your TicketBazaar account';
    const html = this.generateVerificationEmailHTML(userName, verificationCode);
    const text = this.generateVerificationEmailText(userName, verificationCode);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // Password reset email
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<boolean> {
    const subject = 'Reset your TicketBazaar password';
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    const html = this.generatePasswordResetEmailHTML(userName, resetUrl);
    const text = this.generatePasswordResetEmailText(userName, resetUrl);

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // HTML Email Templates
  private generateWelcomeEmailHTML(userName: string): string {
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

  private generateContactRequestEmailHTML(data: NotificationEmailData): string {
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

  private generateTicketSoldEmailHTML(data: NotificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Sold!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .celebration { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffd700; text-align: center; }
          .button { display: inline-block; background: #ff8c00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            
            <div class="celebration">
              <h3>🎊 Your ticket has been sold! 🎊</h3>
              <p><strong>Event:</strong> ${data.ticketTitle}</p>
              <p><strong>Sale Price:</strong> ₹${data.salePrice}</p>
            </div>
            
            <p>Fantastic! Your ticket listing has found a buyer. The sale has been completed successfully.</p>
            
            <h3>Next Steps:</h3>
            <ul>
              <li>Transfer the ticket to the buyer using your preferred method</li>
              <li>Keep records of the transaction for your reference</li>
              <li>Consider listing more tickets if you have them!</li>
            </ul>
            
            <a href="${this.appUrl}/dashboard" class="button">View Dashboard</a>
            
            <p>Thank you for using TicketBazaar for your ticket sale. We hope you'll continue to use our platform for future transactions!</p>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>You received this email because your ticket was successfully sold on TicketBazaar.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePriceDropEmailHTML(data: NotificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Drop Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .price-alert { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
          .savings { background: #e8f5e8; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Price Drop Alert!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Great news! The price has dropped on a ticket you're watching.</p>
            
            <div class="price-alert">
              <h3>Event: ${data.ticketTitle}</h3>
              ${data.venue ? `<p><strong>Venue:</strong> ${data.venue}</p>` : ''}
              ${data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}</p>` : ''}
              
              <div class="savings">
                <p><strong>Was:</strong> <span style="text-decoration: line-through;">₹${data.oldPrice}</span></p>
                <p><strong>Now:</strong> <span style="color: #e74c3c; font-size: 1.2em; font-weight: bold;">₹${data.newPrice}</span></p>
                <p><strong>You Save:</strong> ₹${data.savings} (${data.percentageOff}% off!)</p>
              </div>
            </div>
            
            <p>This is a great opportunity to grab this ticket at a lower price. Don't wait too long - good deals go fast!</p>
            
            <a href="${this.appUrl}" class="button">View Ticket</a>
            
            <p>Happy ticket hunting!<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you have price alerts enabled for this event category.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateNewListingEmailHTML(data: NotificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Ticket Available</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
          .button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 New Ticket Available!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>A new ticket has been listed that matches your interests!</p>
            
            <div class="ticket-info">
              <h3>${data.ticketTitle}</h3>
              ${data.city ? `<p><strong>Location:</strong> ${data.city}</p>` : ''}
              ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
              ${data.venue ? `<p><strong>Venue:</strong> ${data.venue}</p>` : ''}
              ${data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}</p>` : ''}
            </div>
            
            <p>This ticket was just listed and matches your preferences. Check it out before someone else grabs it!</p>
            
            <a href="${this.appUrl}" class="button">View Ticket</a>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you have new listing alerts enabled for this category.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateVerificationEmailHTML(userName: string, verificationCode: string): string {
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
          .header { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .verification-code { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #9b59b6; }
          .code { font-size: 24px; font-weight: bold; color: #9b59b6; letter-spacing: 3px; }
          .button { display: inline-block; background: #9b59b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>Thank you for signing up with TicketBazaar! To complete your registration, please verify your email address.</p>
            
            <div class="verification-code">
              <p>Your verification code is:</p>
              <div class="code">${verificationCode}</div>
            </div>
            
            <p>Enter this code in the verification page to activate your account. This code will expire in 24 hours.</p>
            
            <a href="${this.appUrl}/verify" class="button">Verify Account</a>
            
            <p>If you didn't create an account with TicketBazaar, please ignore this email.</p>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>This verification code expires in 24 hours for security reasons.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailHTML(userName: string, resetUrl: string): string {
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
          .header { background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>You requested to reset your password for your TicketBazaar account.</p>
            
            <div class="security-notice">
              <p><strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.</p>
            </div>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            
            <p>Best regards,<br>The TicketBazaar Team</p>
          </div>
          <div class="footer">
            <p>This password reset link expires in 1 hour for security reasons.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Text versions for better email client compatibility
  private generateWelcomeEmailText(userName: string): string {
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
    `;
  }

  private generateContactRequestEmailText(data: NotificationEmailData): string {
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

Visit your dashboard: ${this.appUrl}/dashboard

Remember to be responsive to potential buyers to increase your chances of a successful sale!

Best regards,
The TicketBazaar Team

You received this email because someone contacted you about your ticket listing on TicketBazaar.
    `;
  }

  private generateTicketSoldEmailText(data: NotificationEmailData): string {
    return `
Congratulations! Your ticket has been sold!

Hi ${data.userName}!

Your ticket listing has found a buyer. The sale has been completed successfully.

Event: ${data.ticketTitle}
Sale Price: ₹${data.salePrice}

Next Steps:
- Transfer the ticket to the buyer using your preferred method
- Keep records of the transaction for your reference
- Consider listing more tickets if you have them!

View your dashboard: ${this.appUrl}/dashboard

Thank you for using TicketBazaar for your ticket sale. We hope you'll continue to use our platform for future transactions!

Best regards,
The TicketBazaar Team

You received this email because your ticket was successfully sold on TicketBazaar.
    `;
  }

  private generatePriceDropEmailText(data: NotificationEmailData): string {
    return `
Price Drop Alert!

Hi ${data.userName}!

Great news! The price has dropped on a ticket you're watching.

Event: ${data.ticketTitle}
${data.venue ? `Venue: ${data.venue}` : ''}
${data.eventDate ? `Date: ${data.eventDate}` : ''}

Was: ₹${data.oldPrice}
Now: ₹${data.newPrice}
You Save: ₹${data.savings} (${data.percentageOff}% off!)

This is a great opportunity to grab this ticket at a lower price. Don't wait too long - good deals go fast!

View ticket: ${this.appUrl}

Happy ticket hunting!
The TicketBazaar Team

You received this email because you have price alerts enabled for this event category.
    `;
  }

  private generateNewListingEmailText(data: NotificationEmailData): string {
    return `
New Ticket Available!

Hi ${data.userName}!

A new ticket has been listed that matches your interests!

${data.ticketTitle}
${data.city ? `Location: ${data.city}` : ''}
${data.category ? `Category: ${data.category}` : ''}
${data.venue ? `Venue: ${data.venue}` : ''}
${data.eventDate ? `Date: ${data.eventDate}` : ''}

This ticket was just listed and matches your preferences. Check it out before someone else grabs it!

View ticket: ${this.appUrl}

Best regards,
The TicketBazaar Team

You received this email because you have new listing alerts enabled for this category.
    `;
  }

  private generateVerificationEmailText(userName: string, verificationCode: string): string {
    return `
Verify Your Account

Hi ${userName}!

Thank you for signing up with TicketBazaar! To complete your registration, please verify your email address.

Your verification code is: ${verificationCode}

Enter this code in the verification page to activate your account. This code will expire in 24 hours.

Verify your account: ${this.appUrl}/verify

If you didn't create an account with TicketBazaar, please ignore this email.

Best regards,
The TicketBazaar Team

This verification code expires in 24 hours for security reasons.
    `;
  }

  private generatePasswordResetEmailText(userName: string, resetUrl: string): string {
    return `
Password Reset

Hi ${userName}!

You requested to reset your password for your TicketBazaar account.

Security Notice: This password reset link will expire in 1 hour for your security.

Reset your password by visiting: ${resetUrl}

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
The TicketBazaar Team

This password reset link expires in 1 hour for security reasons.
    `;
  }
}

export const emailService = new EmailService();