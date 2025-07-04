/**
 * Perplexity API Service for Ticket Verification
 * Uses Perplexity AI to verify event legitimacy
 */

import { logger } from "../utils/logger";

interface TicketVerificationRequest {
  listingTitle: string;
  eventDate: string;
  eventTime: string;
  venueLocation: string;
  eventCategory: string;
  ticketQuantity: number;
  additionalInfo?: string;
}

interface TicketVerificationResult {
  legitimacy: 'legit' | 'suspicious' | 'fake';
  legitimacyEmoji: '✅' | '⚠️' | '❌';
  explanation: string;
  confidence: number;
  checkDetails: {
    eventExists: boolean;
    venueValid: boolean;
    dateValid: boolean;
    possibleDuplicate: boolean;
  };
}

export class PerplexityVerificationService {
  private apiKey: string;
  private apiUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('PERPLEXITY', 'Perplexity API key not configured');
    }
  }

  /**
   * Verify ticket listing using Perplexity AI with retry mechanism
   */
  async verifyTicketListing(data: TicketVerificationRequest): Promise<TicketVerificationResult> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    if (!this.apiKey) {
      return this.generateDefaultResult('Unable to verify - API key not configured');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('PERPLEXITY', `Verification attempt ${attempt}/${maxRetries}`);
        
        const prompt = this.buildVerificationPrompt(data);
        const response = await this.callPerplexityAPI(prompt);
        const result = this.parseVerificationResponse(response);
        
        // Check if we got a valid result
        if (result.legitimacy && result.confidence > 0) {
          logger.info('PERPLEXITY', `Verification successful on attempt ${attempt}`);
          return result;
        }
        
        // If result is incomplete, try again
        if (attempt < maxRetries) {
          logger.warn('PERPLEXITY', `Incomplete result on attempt ${attempt}, retrying...`);
          await this.delay(retryDelay * attempt); // Exponential backoff
          continue;
        }
        
        return result; // Return even incomplete result on final attempt
        
      } catch (error) {
        logger.error('PERPLEXITY', `Verification attempt ${attempt} failed: ${error}`);
        
        if (attempt < maxRetries) {
          logger.info('PERPLEXITY', `Retrying in ${retryDelay * attempt}ms...`);
          await this.delay(retryDelay * attempt);
          continue;
        }
        
        // Final attempt failed
        return this.generateDefaultResult(`Verification failed after ${maxRetries} attempts`);
      }
    }
    
    return this.generateDefaultResult('Verification service temporarily unavailable');
  }

  /**
   * Delay helper for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build verification prompt for Perplexity
   */
  private buildVerificationPrompt(data: TicketVerificationRequest): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `You are a ticket listing fraud-check assistant. Analyze this ticket listing for legitimacy.

Current date: ${currentDate}

Listing Details:
- Listing Title: ${data.listingTitle}
- Event Date: ${data.eventDate}
- Event Time: ${data.eventTime}
- Venue Location: ${data.venueLocation}
- Event Category: ${data.eventCategory}
- Number of Tickets: ${data.ticketQuantity}
- Additional Info: ${data.additionalInfo || 'None provided'}

Please search the web to verify:
1. Is this a real, upcoming event? Search for the event name and date to confirm it exists.
2. Is the venue valid and does it host such events? Verify the venue location using maps/web search.
3. Does the event date and time match official sources? Check event websites, ticketing platforms.
4. Are there any red flags like non-existent venues, past dates, or fake event names?

Use live web data to validate these details. Be lenient - only flag clear red flags or obvious inconsistencies.

IMPORTANT: You MUST respond with ONLY a valid JSON object, no other text before or after. Return exactly this structure:
{
  "legitimacy": "legit" | "suspicious" | "fake",
  "explanation": "2-3 sentence explanation",
  "confidence": 0-100,
  "eventExists": true/false,
  "venueValid": true/false,
  "dateValid": true/false,
  "possibleDuplicate": true/false
}`;
  }

  /**
   * Call Perplexity API
   */
  private async callPerplexityAPI(prompt: string): Promise<any> {
    const requestBody = {
      model: 'r1-1776',
      messages: [
        {
          role: 'system',
          content: 'You are a ticket listing fraud-check assistant. Use live web search to verify event details, dates, and venue information. You must ALWAYS respond with ONLY valid JSON format, no other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      stream: false
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('PERPLEXITY', `API error response: ${errorBody}`);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Log the response for debugging
    logger.info('PERPLEXITY', `API Response (first 500 chars): ${content.substring(0, 500)}`);
    logger.info('PERPLEXITY', `API Response (last 500 chars): ${content.substring(Math.max(0, content.length - 500))}`);
    logger.info('PERPLEXITY', `Response length: ${content.length} characters`);
    
    return content;
  }

  /**
   * Parse verification response from Perplexity
   */
  private parseVerificationResponse(response: string): TicketVerificationResult {
    try {
      // Simple approach: Look for key information in the response
      const responseText = response.toLowerCase();
      
      // Determine legitimacy based on keywords
      let legitimacy: 'legit' | 'suspicious' | 'fake' = 'suspicious';
      let confidence = 50;
      let explanation = 'Verification completed with limited information';
      
      // Look for legitimacy indicators
      if (responseText.includes('"legitimacy"')) {
        // Try to extract legitimacy value
        const legitMatch = response.match(/"legitimacy"\s*:\s*"(legit|suspicious|fake)"/i);
        if (legitMatch) {
          legitimacy = legitMatch[1].toLowerCase() as any;
        }
      }
      
      // Look for confidence
      const confMatch = response.match(/"confidence"\s*:\s*(\d+)/);
      if (confMatch) {
        confidence = parseInt(confMatch[1]);
      }
      
      // Look for explanation
      const explMatch = response.match(/"explanation"\s*:\s*"([^"]+)"/);
      if (explMatch) {
        explanation = explMatch[1];
      }
      
      // Simple boolean extraction
      const eventExists = responseText.includes('"eventexists": true') || responseText.includes('"eventExists": true');
      const venueValid = responseText.includes('"venuevalid": true') || responseText.includes('"venueValid": true');
      const dateValid = responseText.includes('"datevalid": true') || responseText.includes('"dateValid": true');
      
      // If we couldn't find legitimacy in structured format, make a simple decision based on content
      if (!responseText.includes('"legitimacy"')) {
        if (responseText.includes('no evidence') || responseText.includes('could not be verified') || 
            responseText.includes('not found') || responseText.includes('suspicious')) {
          legitimacy = 'suspicious';
          confidence = 40;
        } else if (responseText.includes('fake') || responseText.includes('fraudulent') || 
                   responseText.includes('does not exist')) {
          legitimacy = 'fake';
          confidence = 20;
        } else if (responseText.includes('legitimate') || responseText.includes('valid') || 
                   responseText.includes('confirmed')) {
          legitimacy = 'legit';
          confidence = 80;
        }
      }
      
      // Create default explanation if none found
      if (!explanation || explanation === 'Verification completed with limited information') {
        if (legitimacy === 'legit') {
          explanation = 'Event verification indicates this is likely a legitimate listing';
        } else if (legitimacy === 'fake') {
          explanation = 'Event verification found significant issues with this listing';
        } else {
          explanation = 'Event verification found some concerns that require further review';
        }
      }
      
      const legitimacyMap = {
        'legit': '✅' as const,
        'suspicious': '⚠️' as const,
        'fake': '❌' as const
      };

      logger.info('PERPLEXITY', `Parsed result: legitimacy=${legitimacy}, confidence=${confidence}`);

      return {
        legitimacy,
        legitimacyEmoji: legitimacyMap[legitimacy],
        explanation,
        confidence,
        checkDetails: {
          eventExists,
          venueValid,
          dateValid,
          possibleDuplicate: false
        }
      };
    } catch (error) {
      logger.error('PERPLEXITY', `Failed to parse response: ${error}`);
      return this.generateDefaultResult('Verification completed but could not parse detailed results');
    }
  }

  /**
   * Generate default result when verification fails
   */
  private generateDefaultResult(reason: string): TicketVerificationResult {
    return {
      legitimacy: 'suspicious',
      legitimacyEmoji: '⚠️',
      explanation: reason,
      confidence: 0,
      checkDetails: {
        eventExists: false,
        venueValid: false,
        dateValid: false,
        possibleDuplicate: false
      }
    };
  }
}

export const perplexityVerificationService = new PerplexityVerificationService();