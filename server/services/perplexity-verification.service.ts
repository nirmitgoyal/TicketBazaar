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

DO NOT SEARCH THE WEB. Analyze only the provided information.

ONLY these are red flags:
1. Event date is in the past (Current date: ${currentDate})
2. Venue name contains words like "Scam", "Fake", "Test", "123", "XXX"
3. Ticket quantity over 10,000
4. Price is 0 or negative
5. Event title is odd/nonsensical (e.g., random characters, gibberish, test data)

EVERYTHING ELSE IS LEGITIMATE:
- Misspellings are FINE
- Unknown performers are FINE
- Hotels hosting concerts are FINE
- Any future date is FINE
- Any reasonable venue name is FINE

If none of the 4 red flags above are present, ALWAYS return:
legitimacy: "legit"
confidence: 95

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
          content: 'You are a ticket verification assistant. DO NOT USE WEB SEARCH. Analyze only the provided information using logic. You must ALWAYS respond with ONLY valid JSON format, no other text. Be EXTREMELY LENIENT - mark tickets as "legit" unless there are OBVIOUS red flags like past dates or clearly fake venue names.'
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
      let legitMatch = null;
      if (responseText.includes('"legitimacy"')) {
        // Try to extract legitimacy value
        legitMatch = response.match(/"legitimacy"\s*:\s*"(legit|suspicious|fake)"/i);
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
      
      // If we couldn't find legitimacy, make a lenient decision based on content
      if (!legitMatch) {
        // Only mark as fake/suspicious for CLEAR red flags
        if (responseText.includes('fake') || responseText.includes('fraudulent') || 
            responseText.includes('scam') || responseText.includes('past date')) {
          legitimacy = 'fake';
          confidence = 20;
        } else if (responseText.includes('does not exist') || responseText.includes('invalid venue') ||
                   responseText.includes('no such venue')) {
          legitimacy = 'suspicious';
          confidence = 40;
        } else {
          // Default to legit if no clear red flags found
          legitimacy = 'legit';
          confidence = 70;
        }
      }
      
      // Boost confidence if venue is valid (lenient approach)
      if (venueValid && legitimacy !== 'fake') {
        confidence = Math.max(confidence, 75);
        if (legitimacy === 'suspicious') {
          legitimacy = 'legit';
        }
      }
      
      // Create default explanation if none found (lenient approach)
      if (!explMatch) {
        if (legitimacy === 'legit') {
          if (venueValid) {
            explanation = 'The venue is verified as legitimate. Event details appear reasonable with no red flags detected.';
          } else {
            explanation = 'Event verification found no significant issues with this listing.';
          }
        } else if (legitimacy === 'fake') {
          explanation = 'Event verification found clear red flags indicating this listing may be fraudulent.';
        } else {
          explanation = 'Some aspects of this listing could not be fully verified, but no major red flags were found.';
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