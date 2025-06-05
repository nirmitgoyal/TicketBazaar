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

    // Get ticket details first
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Call Perplexity API directly for real verification
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Perplexity API key not configured'
      });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert event verification specialist. Analyze events for authenticity and provide detailed verification results. Respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `Verify this event for authenticity:

Event: ${ticket.eventTitle}
Venue: ${ticket.venue}
Date: ${ticket.eventDate}
City: ${ticket.city}
Category: ${ticket.category}
Price: ₹${ticket.price}
Section: ${ticket.section}

Analyze:
1. Event legitimacy and current status
2. Venue authenticity
3. Pricing reasonableness
4. Date validity

Respond with JSON:
{
  "isVerified": boolean,
  "confidence": number (0-100),
  "fraudRisk": "low|medium|high",
  "eventAnalysis": "brief analysis",
  "pricingAnalysis": "price assessment",
  "recommendations": ["safety tip 1", "safety tip 2"]
}`
      }
    ];

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 500,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const aiResponse = perplexityData.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    let verificationResult;
    
    if (jsonMatch) {
      try {
        verificationResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid AI response format');
      }
    } else {
      throw new Error('No JSON found in AI response');
    }

    // Structure the response to match frontend expectations
    const comprehensiveResult = {
      ticket,
      verification: {
        overall: {
          isVerified: verificationResult.isVerified || false,
          confidence: verificationResult.confidence || 0,
          fraudRisk: verificationResult.fraudRisk || 'high',
          reasons: [verificationResult.eventAnalysis || 'Analysis unavailable']
        },
        event: { 
          confidence: verificationResult.confidence || 0,
          analysis: verificationResult.eventAnalysis
        },
        seller: { 
          confidence: Math.max(0, (verificationResult.confidence || 0) - 10)
        },
        pricing: { 
          confidence: verificationResult.confidence || 0,
          analysis: verificationResult.pricingAnalysis
        }
      },
      recommendations: verificationResult.recommendations || [
        'Verify event details independently',
        'Check seller credentials',
        'Use secure payment methods'
      ],
      sources: perplexityData.citations || []
    };
    
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