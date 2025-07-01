/**
 * Unified Communication Service
 * Consolidates email, notifications, and messaging functionality
 * Replaces: email.service.ts, notification.service.ts
 */

import { MailService } from '@sendgrid/mail';
import { WebSocketService } from './websocket.service';
import { logger } from '../utils/logger';
import { User, Ticket } from '@shared/schema';

// Unified communication types
export interface CommunicationMessage {
  type: 'email' | 'sms' | 'push' | 'websocket';
  recipient: string | User;
  subject?: string;
  content: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  templateId?: string;
}

export interface NotificationData {
  userId?: number;
  userName?: string;
  ticketTitle?: string;
  eventTitle?: string;
  venue?: string;
  eventDate?: string;
  contactDetails?: string;
  appUrl?: string;
  [key: string]: any;
}

export interface CommunicationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// Strategy pattern for different communication channels
interface ICommunicationChannel {
  send(message: CommunicationMessage): Promise<CommunicationResult>;
  isAvailable(): boolean;
}

/**
 * Main Unified Communication Service
 */
export class UnifiedCommunicationService {
  private channels: Map<CommunicationMessage['type'], ICommunicationChannel>;
  private readonly appUrl: string;
  private websocketChannel: WebSocketChannel;
  
  constructor() {
    this.appUrl = process.env.APP_URL || 'https://ticketbazaar.co.in';
    
    this.channels = new Map();
    this.channels.set('email', new EmailChannel());
    
    // WebSocket channel will be initialized separately
    this.websocketChannel = new WebSocketChannel();
    this.channels.set('websocket', this.websocketChannel);
  }
  
  /**
   * Initialize WebSocket service (call this after server is created)
   */
  initializeWebSocket(wsService: WebSocketService): void {
    this.websocketChannel.setWebSocketService(wsService);
  }

  /**
   * Send a message through specified channel
   */
  async send(message: CommunicationMessage): Promise<CommunicationResult> {
    const channel = this.channels.get(message.type);
    
    if (!channel) {
      return {
        success: false,
        error: `Unknown communication channel: ${message.type}`,
        timestamp: new Date()
      };
    }
    
    if (!channel.isAvailable()) {
      return {
        success: false,
        error: `Channel ${message.type} is not available`,
        timestamp: new Date()
      };
    }
    
    try {
      return await channel.send(message);
    } catch (error) {
      logger.error('COMMUNICATION', `Failed to send ${message.type}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send multiple messages in parallel
   */
  async sendBulk(messages: CommunicationMessage[]): Promise<CommunicationResult[]> {
    return Promise.all(messages.map(msg => this.send(msg)));
  }

  /**
   * Send notification through multiple channels
   */
  async sendMultiChannel(
    recipient: string | User,
    content: string,
    channels: CommunicationMessage['type'][] = ['email', 'websocket']
  ): Promise<CommunicationResult[]> {
    const messages = channels.map(type => ({
      type,
      recipient,
      content
    }));
    
    return this.sendBulk(messages);
  }

  // Convenience methods for common notifications

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: User): Promise<CommunicationResult> {
    return this.send({
      type: 'email',
      recipient: user,
      subject: 'Welcome to TicketBazaar! 🎉',
      content: this.generateWelcomeContent(user.fullName),
      priority: 'high'
    });
  }

  /**
   * Send contact request notification
   */
  async sendContactRequest(
    seller: User,
    buyer: User,
    ticket: Ticket
  ): Promise<CommunicationResult[]> {
    return Promise.all([
      // Email to seller
      this.send({
        type: 'email',
        recipient: seller,
        subject: `New Contact Request for ${ticket.eventTitle}`,
        content: this.generateContactRequestContent({
          userName: seller.fullName,
          buyerName: buyer.fullName,
          ticketTitle: ticket.title,
          eventTitle: ticket.eventTitle,
          venue: ticket.venue,
          eventDate: ticket.eventDate?.toISOString()
        }),
        priority: 'high'
      }),
      // WebSocket notification
      this.send({
        type: 'websocket',
        recipient: seller,
        content: 'New contact request received',
        data: {
          type: 'contact_request',
          buyerId: buyer.id,
          ticketId: ticket.id
        }
      })
    ]);
  }

  /**
   * Send ticket update notification
   */
  async sendTicketUpdate(
    user: User,
    ticket: Ticket,
    updateType: 'created' | 'updated' | 'deleted'
  ): Promise<CommunicationResult> {
    return this.send({
      type: 'websocket',
      recipient: user,
      content: `Ticket ${updateType}`,
      data: {
        type: 'ticket_update',
        action: updateType,
        ticketId: ticket.id,
        ticketTitle: ticket.title
      }
    });
  }

  // Template generation methods
  
  private generateWelcomeContent(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TicketBazaar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TicketBazaar!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>We're thrilled to have you join India's most trusted peer-to-peer ticket marketplace.</p>
            <p>With TicketBazaar, you can:</p>
            <ul>
              <li>🎫 Buy and sell tickets directly with other verified users</li>
              <li>🔒 Enjoy secure transactions with our verification system</li>
              <li>💰 Save money with no platform fees</li>
              <li>🌟 Build trust through our social verification features</li>
            </ul>
            <p>Get started by browsing available tickets or listing your own!</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${this.appUrl}" class="button">Browse Tickets</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateContactRequestContent(data: NotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Request!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>${data.buyerName} is interested in your ticket listing.</p>
            <div class="ticket-info">
              <h3>Ticket Details:</h3>
              <p><strong>Event:</strong> ${data.eventTitle}</p>
              <p><strong>Venue:</strong> ${data.venue}</p>
              <p><strong>Date:</strong> ${data.eventDate ? new Date(data.eventDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Listing:</strong> ${data.ticketTitle}</p>
            </div>
            <p>Please respond to the buyer as soon as possible to complete the transaction.</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${this.appUrl}/my-tickets" class="button">View Contact Requests</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * Email Channel Implementation
 */
class EmailChannel implements ICommunicationChannel {
  private mailService: MailService;
  private readonly defaultFrom: string;
  
  constructor() {
    this.defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@ticketbazaar.co.in';
    
    if (process.env.SENDGRID_API_KEY) {
      this.mailService = new MailService();
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
      logger.info('EMAIL', 'SendGrid mail service initialized');
    }
  }
  
  async send(message: CommunicationMessage): Promise<CommunicationResult> {
    if (!this.isAvailable()) {
      throw new Error('Email service not configured');
    }
    
    const recipient = typeof message.recipient === 'string' 
      ? message.recipient 
      : message.recipient.email;
    
    try {
      const response = await this.mailService.send({
        to: recipient,
        from: {
          email: this.defaultFrom,
          name: 'TicketBazaar'
        },
        subject: message.subject || 'Notification from TicketBazaar',
        html: message.content,
        ...(message.templateId && { templateId: message.templateId }),
        ...(message.data && { dynamicTemplateData: message.data })
      });
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        timestamp: new Date()
      };
    } catch (error) {
      throw error;
    }
  }
  
  isAvailable(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}

/**
 * WebSocket Channel Implementation
 */
class WebSocketChannel implements ICommunicationChannel {
  private wsService: WebSocketService | null = null;
  
  setWebSocketService(service: WebSocketService) {
    this.wsService = service;
  }
  
  async send(message: CommunicationMessage): Promise<CommunicationResult> {
    if (!this.wsService) {
      throw new Error('WebSocket service not initialized');
    }
    
    const userId = typeof message.recipient === 'string' 
      ? parseInt(message.recipient) 
      : message.recipient.id;
    
    if (isNaN(userId)) {
      throw new Error('Invalid user ID for WebSocket notification');
    }
    
    // Use the proper WebSocketEvent interface
    this.wsService.notifyUser(userId, message.content);
    
    return {
      success: true,
      timestamp: new Date()
    };
  }
  
  isAvailable(): boolean {
    return this.wsService !== null;
  }
}

// Export singleton instance
export const unifiedCommunicationService = new UnifiedCommunicationService();