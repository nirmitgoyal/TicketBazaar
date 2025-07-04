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

Please verify:
1. Is this a real, upcoming event?
2. Is the venue valid and does it align with the artist/event?
3. Are there signs of potential scam (made-up venues, past dates, suspicious titles)?
4. Does this appear to be bulk-resale or duplicate listing?

Be lenient - only flag clear red flags or obvious inconsistencies.

Respond in JSON format:
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
      model: 'sonar-small-online',
      messages: [
        {
          role: 'system',
          content: 'You are a ticket listing fraud-check assistant. Analyze ticket listings for legitimacy and provide JSON responses.'
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
    return data.choices[0].message.content;
  }

  /**
   * Parse verification response from Perplexity
   */
  private parseVerificationResponse(response: string): TicketVerificationResult {
    try {
      // Extract JSON from response (handling potential markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
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