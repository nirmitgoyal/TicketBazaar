import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

const router = Router();

/**
 * GET /api/verification/ticket/:id
 * Verify ticket authenticity using Perplexity AI
 */
router.get('/ticket/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ticket ID' 
      });
    }

    const verificationResult = await storage.verifyTicketAuthenticity(ticketId);
    
    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('Ticket verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Verification failed'
    });
  }
});

/**
 * GET /api/verification/seller/:id
 * Verify seller authenticity using Perplexity AI
 */
router.get('/seller/:id', async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);
    if (isNaN(sellerId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid seller ID' 
      });
    }

    const verificationResult = await storage.verifySellerAuthenticity(sellerId);
    
    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('Seller verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Verification failed'
    });
  }
});

/**
 * GET /api/verification/comprehensive/:ticketId
 * Perform comprehensive verification of ticket, seller, and pricing
 */
router.get('/comprehensive/:ticketId', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ticket ID' 
      });
    }

    const comprehensiveResult = await storage.getComprehensiveVerification(ticketId);
    
    res.json({
      success: true,
      data: comprehensiveResult
    });
  } catch (error) {
    console.error('Comprehensive verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Verification failed'
    });
  }
});

/**
 * POST /api/verification/batch
 * Verify multiple tickets at once
 */
router.post('/batch', isAuthenticated, async (req, res) => {
  try {
    const { ticketIds } = req.body;
    
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket IDs array'
      });
    }

    if (ticketIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 tickets can be verified at once'
      });
    }

    const verificationPromises = ticketIds.map(async (ticketId: number) => {
      try {
        const result = await storage.verifyTicketAuthenticity(ticketId);
        return { ticketId, success: true, data: result };
      } catch (error) {
        return { 
          ticketId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Verification failed' 
        };
      }
    });

    const results = await Promise.all(verificationPromises);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Batch verification failed'
    });
  }
});

export default router;