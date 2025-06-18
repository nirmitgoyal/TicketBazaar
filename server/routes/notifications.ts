import { Router } from "express";
import { notificationService } from "../services/notification.service";
import { isAuthenticated } from "../auth";
import { logger } from "../utils/logger";

const router = Router();

// Get user notifications
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const notifications = notificationService.getNotifications(userId, limit);
    
    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to get notifications', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Get user notification preferences
router.get("/preferences", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const preferences = notificationService.getPreferences(userId);
    
    res.json({
      success: true,
      preferences
    });
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to get preferences', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
});

// Update user notification preferences
router.put("/preferences", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { preferences } = req.body;
    
    const updated = notificationService.updatePreferences(userId, preferences);
    
    res.json({
      success: true,
      preferences: updated
    });
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to update preferences', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Mark notification as read
router.put("/:notificationId/read", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;
    
    const success = notificationService.markAsRead(userId, notificationId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to mark notification as read', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Get notification statistics (admin only)
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    // In a real app, you'd check if user is admin
    const stats = notificationService.getStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to get stats', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Test notification endpoint (development only)
router.post("/test", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type, title, message } = req.body;
    
    const success = await notificationService.sendNotification({
      userId,
      type: type || 'new_listing',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority: 'medium'
    });
    
    res.json({
      success,
      message: success ? 'Test notification sent' : 'Failed to send notification'
    });
    
  } catch (error) {
    logger.error('NOTIFICATIONS', 'Failed to send test notification', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router;