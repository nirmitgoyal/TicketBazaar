import { storage } from "../storage";
import { logger } from "../utils/logger";

export class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    this.startPeriodicCleanup();
  }

  /**
   * Start the periodic cleanup service
   */
  startPeriodicCleanup() {
    // Run cleanup immediately on startup
    this.runCleanup();
    
    // Schedule periodic cleanup every 24 hours
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL);

    logger.info('CLEANUP', 'Automated cleanup service started - will run every 24 hours');
  }

  /**
   * Stop the periodic cleanup service
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('CLEANUP', 'Automated cleanup service stopped');
    }
  }

  /**
   * Run the cleanup process manually
   */
  async runCleanup(): Promise<number> {
    try {
      logger.info('CLEANUP', 'Starting automated cleanup of expired tickets');
      
      const deletedCount = await storage.deleteExpiredTickets();
      
      if (deletedCount > 0) {
        logger.info('CLEANUP', `Successfully deleted ${deletedCount} expired tickets`);
      } else {
        logger.info('CLEANUP', 'No expired tickets found to delete');
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('CLEANUP', 'Error during automated cleanup:', error);
      throw error;
    }
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      isRunning: this.cleanupInterval !== null,
      intervalHours: this.CLEANUP_INTERVAL / (60 * 60 * 1000),
      nextCleanup: this.cleanupInterval ? 
        new Date(Date.now() + this.CLEANUP_INTERVAL).toISOString() : 
        null
    };
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();