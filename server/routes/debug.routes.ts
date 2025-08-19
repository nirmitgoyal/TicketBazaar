import express from "express";
import { logger } from "../utils/logger";

const router = express.Router();

/**
 * Debug endpoint to log Instagram WebView information
 * Only available in development mode
 */
router.post("/instagram-webview", (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  try {
    const debugInfo = req.body;
    logger.info('INSTAGRAM_WEBVIEW_DEBUG', 'WebView information logged', debugInfo);
    
    // Also log to console for immediate visibility
    console.log('🔍 Instagram WebView Debug Info:', debugInfo);
    
    res.json({ success: true, message: 'Debug information logged' });
  } catch (error) {
    logger.error('INSTAGRAM_WEBVIEW_DEBUG', 'Failed to log debug info', error);
    res.status(500).json({ error: 'Failed to log debug information' });
  }
});

export default router;