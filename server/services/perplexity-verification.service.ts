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
   * Verify ticket listing using Perplexity AI
   */
  async verifyTicketListing(data: TicketVerificationRequest): Promise<TicketVerificationResult> {
    try {
      if (!this.apiKey) {
        return this.generateDefaultResult('Unable to verify - API key not configured');
      }

      const prompt = this.buildVerificationPrompt(data);
      const response = await this.callPerplexityAPI(prompt);
      
      return this.parseVerificationResponse(response);
    } catch (error) {
      logger.error('PERPLEXITY', `Verification failed: ${error}`);
      return this.generateDefaultResult('Verification service temporarily unavailable');
    }
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
      // Remove thinking tags if present
      let cleanResponse = response;
      if (response.includes('<think>')) {
        // Extract content after </think> tag
        const thinkEndIndex = response.indexOf('</think>');
        if (thinkEndIndex !== -1) {
          cleanResponse = response.substring(thinkEndIndex + 8).trim();
          logger.info('PERPLEXITY', `Cleaned response (first 200 chars): ${cleanResponse.substring(0, 200)}`);
        }
      }
      
      // Try to parse as pure JSON first
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (e) {
        logger.info('PERPLEXITY', `Failed to parse as pure JSON: ${e.message}`);
        
        // If that fails, try to extract a complete JSON object
        // Look for JSON starting with legitimacy field
        const jsonStartIndex = cleanResponse.indexOf('{"legitimacy"');
        if (jsonStartIndex === -1) {
          // Try alternative: find any JSON object start
          const altJsonStart = cleanResponse.indexOf('{');
          if (altJsonStart === -1) {
            throw new Error('No JSON found in response');
          }
        }
        
        logger.info('PERPLEXITY', `Found JSON at index: ${jsonStartIndex >= 0 ? jsonStartIndex : cleanResponse.indexOf('{')}`)
        
        // Find the matching closing brace
        let braceCount = 0;
        let jsonEndIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = jsonStartIndex >= 0 ? jsonStartIndex : cleanResponse.indexOf('{'); i < cleanResponse.length; i++) {
          const char = cleanResponse[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                jsonEndIndex = i;
                break;
              }
            }
          }
        }
        
        if (jsonEndIndex === -1) {
          // If we can't find the end, try to construct valid JSON from what we have
          const partialJson = cleanResponse.substring(jsonStartIndex >= 0 ? jsonStartIndex : cleanResponse.indexOf('{'));
          // Check if it's just missing closing braces
          const openBraces = (partialJson.match(/{/g) || []).length;
          const closeBraces = (partialJson.match(/}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          if (missingBraces > 0) {
            const fixedJson = partialJson + '}'.repeat(missingBraces);
            try {
              parsed = JSON.parse(fixedJson);
            } catch {
              throw new Error('Incomplete JSON in response');
            }
          } else {
            throw new Error('Could not find complete JSON in response');
          }
        } else {
          const jsonStr = cleanResponse.substring(jsonStartIndex >= 0 ? jsonStartIndex : cleanResponse.indexOf('{'), jsonEndIndex + 1);
          parsed = JSON.parse(jsonStr);
        }
      }
      
      // Additional fallback: try to extract basic fields manually if all else fails
      if (!parsed) {
        const legitimacyMatch = cleanResponse.match(/"legitimacy"\s*:\s*"([^"]+)"/);
        const explanationMatch = cleanResponse.match(/"explanation"\s*:\s*"([^"]+)"/);
        const confidenceMatch = cleanResponse.match(/"confidence"\s*:\s*(\d+)/);
        const eventExistsMatch = cleanResponse.match(/"eventExists"\s*:\s*(true|false)/);
        const venueValidMatch = cleanResponse.match(/"venueValid"\s*:\s*(true|false)/);
        const dateValidMatch = cleanResponse.match(/"dateValid"\s*:\s*(true|false)/);
        
        if (legitimacyMatch) {
          parsed = {
            legitimacy: legitimacyMatch[1],
            explanation: explanationMatch ? explanationMatch[1] : 'Unable to extract explanation',
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
            eventExists: eventExistsMatch ? eventExistsMatch[1] === 'true' : false,
            venueValid: venueValidMatch ? venueValidMatch[1] === 'true' : false,
            dateValid: dateValidMatch ? dateValidMatch[1] === 'true' : false,
            possibleDuplicate: false
          };
          logger.info('PERPLEXITY', 'Used fallback field extraction');
        }
      }
      
      const legitimacyMap = {
        'legit': '✅' as const,
        'suspicious': '⚠️' as const,
        'fake': '❌' as const
      };

      return {
        legitimacy: parsed.legitimacy || 'suspicious',
        legitimacyEmoji: legitimacyMap[parsed.legitimacy] || '⚠️',
        explanation: parsed.explanation || 'Unable to determine legitimacy',
        confidence: parsed.confidence || 50,
        checkDetails: {
          eventExists: parsed.eventExists || false,
          venueValid: parsed.venueValid || false,
          dateValid: parsed.dateValid || false,
          possibleDuplicate: parsed.possibleDuplicate || false
        }
      };
    } catch (error) {
      logger.error('PERPLEXITY', `Failed to parse response: ${error}`);
      return this.generateDefaultResult('Invalid response from verification service');
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