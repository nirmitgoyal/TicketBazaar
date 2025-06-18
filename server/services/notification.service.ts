import { logger } from "../utils/logger";

interface NotificationData {
  userId: number;
  type: 'price_drop' | 'new_listing' | 'ticket_sold' | 'contact_request' | 'verification_complete';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
}

interface UserPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  priceAlerts: boolean;
  newListings: boolean;
  categories: string[];
  cities: string[];
}

class NotificationService {
  private preferences = new Map<number, UserPreferences>();
  private pendingNotifications = new Map<string, NotificationData[]>();

  // Initialize user preferences with defaults
  initializeUserPreferences(userId: number): UserPreferences {
    const defaultPrefs: UserPreferences = {
      pushNotifications: true,
      emailNotifications: true,
      priceAlerts: true,
      newListings: false,
      categories: [],
      cities: []
    };
    
    this.preferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  // Update user notification preferences
  updatePreferences(userId: number, preferences: Partial<UserPreferences>): UserPreferences {
    const existing = this.preferences.get(userId) || this.initializeUserPreferences(userId);
    const updated = { ...existing, ...preferences };
    this.preferences.set(userId, updated);
    
    logger.info('NOTIFICATIONS', `Updated preferences for user ${userId}`);
    return updated;
  }

  // Get user preferences
  getPreferences(userId: number): UserPreferences {
    return this.preferences.get(userId) || this.initializeUserPreferences(userId);
  }

  // Send notification to user
  async sendNotification(notification: NotificationData): Promise<boolean> {
    const userPrefs = this.getPreferences(notification.userId);
    
    // Check if user wants this type of notification
    if (!this.shouldSendNotification(notification, userPrefs)) {
      logger.debug('NOTIFICATIONS', `Skipping notification for user ${notification.userId} due to preferences`);
      return false;
    }

    try {
      // Store notification for later delivery (simulating push/email service)
      const key = `user_${notification.userId}`;
      const existing = this.pendingNotifications.get(key) || [];
      existing.push({
        ...notification,
        data: {
          ...notification.data,
          timestamp: new Date().toISOString(),
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
      
      // Keep only last 50 notifications per user
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }
      
      this.pendingNotifications.set(key, existing);
      
      logger.info('NOTIFICATIONS', `Notification queued for user ${notification.userId}: ${notification.title}`);
      
      // Simulate delivery based on preferences
      if (userPrefs.pushNotifications) {
        await this.sendPushNotification(notification);
      }
      
      if (userPrefs.emailNotifications && notification.priority === 'high') {
        await this.sendEmailNotification(notification);
      }
      
      return true;
    } catch (error) {
      logger.error('NOTIFICATIONS', `Failed to send notification to user ${notification.userId}`, error);
      return false;
    }
  }

  // Check if notification should be sent based on user preferences
  private shouldSendNotification(notification: NotificationData, preferences: UserPreferences): boolean {
    switch (notification.type) {
      case 'price_drop':
        return preferences.priceAlerts;
      case 'new_listing':
        return preferences.newListings;
      case 'contact_request':
      case 'ticket_sold':
      case 'verification_complete':
        return true; // Always send important notifications
      default:
        return true;
    }
  }

  // Simulate push notification
  private async sendPushNotification(notification: NotificationData): Promise<void> {
    // In a real app, this would integrate with FCM, APNs, etc.
    logger.info('NOTIFICATIONS', `[PUSH] ${notification.title} -> User ${notification.userId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Simulate email notification
  private async sendEmailNotification(notification: NotificationData): Promise<void> {
    // In a real app, this would integrate with SendGrid, SES, etc.
    logger.info('NOTIFICATIONS', `[EMAIL] ${notification.title} -> User ${notification.userId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Get pending notifications for a user
  getNotifications(userId: number, limit: number = 20): NotificationData[] {
    const key = `user_${userId}`;
    const notifications = this.pendingNotifications.get(key) || [];
    return notifications.slice(-limit).reverse(); // Most recent first
  }

  // Mark notification as read
  markAsRead(userId: number, notificationId: string): boolean {
    const key = `user_${userId}`;
    const notifications = this.pendingNotifications.get(key) || [];
    
    const notification = notifications.find(n => n.data?.id === notificationId);
    if (notification) {
      notification.data = { ...notification.data, read: true };
      return true;
    }
    
    return false;
  }

  // Send price drop alert
  async sendPriceDropAlert(userId: number, ticketId: number, oldPrice: number, newPrice: number, ticketTitle: string): Promise<void> {
    const savings = oldPrice - newPrice;
    const percentageOff = Math.round((savings / oldPrice) * 100);
    
    await this.sendNotification({
      userId,
      type: 'price_drop',
      title: `Price Drop Alert!`,
      message: `${ticketTitle} is now ₹${newPrice} (${percentageOff}% off)`,
      data: { ticketId, oldPrice, newPrice, savings },
      priority: 'medium'
    });
  }

  // Send new listing alert
  async sendNewListingAlert(userId: number, ticketId: number, ticketTitle: string, city: string, category: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'new_listing',
      title: 'New Ticket Available',
      message: `${ticketTitle} in ${city}`,
      data: { ticketId, city, category },
      priority: 'low'
    });
  }

  // Send contact request notification
  async sendContactRequestNotification(sellerId: number, buyerName: string, ticketTitle: string): Promise<void> {
    await this.sendNotification({
      userId: sellerId,
      type: 'contact_request',
      title: 'New Contact Request',
      message: `${buyerName} wants to buy ${ticketTitle}`,
      data: { buyerName },
      priority: 'high'
    });
  }

  // Send ticket sold notification
  async sendTicketSoldNotification(sellerId: number, ticketTitle: string, salePrice: number): Promise<void> {
    await this.sendNotification({
      userId: sellerId,
      type: 'ticket_sold',
      title: 'Ticket Sold!',
      message: `${ticketTitle} sold for ₹${salePrice}`,
      data: { salePrice },
      priority: 'high'
    });
  }

  // Get notification statistics
  getStats(): { totalNotifications: number; activeUsers: number; deliveryRate: number } {
    const totalNotifications = Array.from(this.pendingNotifications.values())
      .reduce((sum, notifications) => sum + notifications.length, 0);
    
    const activeUsers = this.pendingNotifications.size;
    const deliveryRate = 98.5; // Simulated delivery rate
    
    return {
      totalNotifications,
      activeUsers,
      deliveryRate
    };
  }

  // Clean up old notifications
  cleanup(): number {
    let cleaned = 0;
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [key, notifications] of this.pendingNotifications.entries()) {
      const filtered = notifications.filter(notification => {
        const timestamp = new Date(notification.data?.timestamp || 0).getTime();
        return timestamp > cutoffTime;
      });
      
      if (filtered.length !== notifications.length) {
        cleaned += notifications.length - filtered.length;
        this.pendingNotifications.set(key, filtered);
      }
    }
    
    if (cleaned > 0) {
      logger.info('NOTIFICATIONS', `Cleaned up ${cleaned} old notifications`);
    }
    
    return cleaned;
  }
}

export const notificationService = new NotificationService();

// Auto-cleanup every 6 hours
setInterval(() => {
  notificationService.cleanup();
}, 6 * 60 * 60 * 1000);