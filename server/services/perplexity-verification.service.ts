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

      return this.parseVerificationResponse(response, data);
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
4. Event title is odd/nonsensical (e.g., random characters, gibberish, test data)

Notes:
- Price may not be provided; IGNORE price completely.

EVERYTHING ELSE IS LEGITIMATE:
- Misspellings are FINE
- Unknown performers are FINE
- Hotels hosting concerts are FINE
- Any future date is FINE
- Any reasonable venue name is FINE

If none of the 4 red flags above are present, ALWAYS return:
legitimacy: "legit"
confidence: 95

IMPORTANT OUTPUT CONTRACT:
- You MUST output ONLY a valid JSON object WRAPPED between <JSON> and </JSON> tags.
- Do NOT include analysis, <think>, or any other text outside the JSON.
- Return exactly this structure (all keys required):
{
  "legitimacy": "legit" | "suspicious" | "fake",
  "explanation": "2-3 sentence explanation",
  "confidence": 0-100,
  "eventExists": true/false,
  "venueValid": true/false,
  "dateValid": true/false,
  "possibleDuplicate": true/false
}</JSON>`;
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
          content: 'You are a ticket verification assistant. DO NOT USE WEB SEARCH. Analyze only the provided information using logic. You must ALWAYS output ONLY JSON wrapped in <JSON>...</JSON> with the exact keys requested. Be EXTREMELY LENIENT - mark tickets as "legit" unless there are OBVIOUS red flags like past dates or clearly fake venue names.'
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
    const content = data.choices?.[0]?.message?.content ?? '';
    
    // Log the response for debugging
    logger.info('PERPLEXITY', `API Response (first 500 chars): ${content.substring(0, 500)}`);
    logger.info('PERPLEXITY', `API Response (last 500 chars): ${content.substring(Math.max(0, content.length - 500))}`);
    logger.info('PERPLEXITY', `Response length: ${content.length} characters`);
    
    return content;
  }

  /**
   * Parse verification response from Perplexity
   */
  private parseVerificationResponse(response: string, data: TicketVerificationRequest): TicketVerificationResult {
    try {
      // 1) Try to extract strict JSON between <JSON> ... </JSON>
      let jsonBlock = '';
      const startTag = '<JSON>';
      const endTag = '</JSON>';
      const startIdx = response.indexOf(startTag);
      const endIdx = response.lastIndexOf(endTag);
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonBlock = response.slice(startIdx + startTag.length, endIdx).trim();
      } else {
        // 2) Look for fenced ```json ... ```
        const fenceMatch = response.match(/```json\s*([\s\S]*?)\s*```/i);
        if (fenceMatch) {
          jsonBlock = fenceMatch[1].trim();
        } else {
          // 3) Fallback: attempt to extract the last JSON object heuristically
          const firstBrace = response.indexOf('{');
          const lastBrace = response.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonBlock = response.slice(firstBrace, lastBrace + 1);
          }
        }
      }

      let parsed: any | null = null;
      if (jsonBlock) {
        try {
          logger.info('PERPLEXITY', `Extracted JSON block length: ${jsonBlock.length}`);
          logger.info('PERPLEXITY', `Extracted JSON preview: ${jsonBlock.slice(0, 200)}`);
        } catch {}
        try {
          parsed = JSON.parse(jsonBlock);
        } catch {
          // Try to clean trailing commas and parse again
          const cleaned = jsonBlock
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/\u201c|\u201d/g, '"');
          try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
        }
      }

      // Define safe defaults
      const defaults = {
        legitimacy: 'suspicious' as const,
        explanation: 'Verification completed with limited information',
        confidence: 50,
        eventExists: false,
        venueValid: false,
        dateValid: false,
        possibleDuplicate: false,
      };

      // If parsed JSON present, normalize fields
      if (parsed && typeof parsed === 'object') {
        const legitimacy = ['legit', 'suspicious', 'fake'].includes((parsed.legitimacy || '').toLowerCase())
          ? (parsed.legitimacy as 'legit' | 'suspicious' | 'fake')
          : defaults.legitimacy;
        const confidenceNum = Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(100, Number(parsed.confidence))) : defaults.confidence;
        const explanation = typeof parsed.explanation === 'string' && parsed.explanation.trim().length > 0
          ? parsed.explanation.trim()
          : defaults.explanation;
        const eventExists = !!parsed.eventExists;
        const venueValid = !!parsed.venueValid;
        const dateValid = !!parsed.dateValid;
        const possibleDuplicate = !!parsed.possibleDuplicate;

        // Sanity override: if AI says "fake" with low confidence but our inputs show no red flags, downgrade to legit
        const now = new Date();
        const eventDate = new Date(data.eventDate);
        const localDateValid = isFinite(eventDate.getTime()) && eventDate >= new Date(now.toISOString().split('T')[0]);
        const forbiddenVenuePattern = /(scam|fake|test|\b123\b|xxx)/i;
        const localVenueValid = !!data.venueLocation && !forbiddenVenuePattern.test(data.venueLocation);
        const localQuantityOK = Number.isFinite(data.ticketQuantity) && data.ticketQuantity > 0 && data.ticketQuantity <= 10000;
        const gibberishTitle = /[^\w\s\-.,'&()/]/.test(data.listingTitle) || /^[a-z]{1,2}\s?[a-z]{1,2}\s?[a-z]{1,2}$/i.test(data.listingTitle);
        const noLocalRedFlags = localDateValid && localVenueValid && localQuantityOK && !gibberishTitle;

        let finalLegitimacy = legitimacy;
        let finalConfidence = confidenceNum;
        let finalExplanation = explanation;
        let finalEventExists = eventExists;
        const finalVenueValid = venueValid || localVenueValid;
        const finalDateValid = dateValid || localDateValid;

        if (noLocalRedFlags && (legitimacy === 'fake' || legitimacy === 'suspicious') && confidenceNum <= 60) {
          finalLegitimacy = 'legit';
          finalConfidence = Math.max(90, confidenceNum);
          finalExplanation = 'No red flags in date, venue, or quantity. Applying lenient policy per contract.';
          finalEventExists = true;
        }

        const legitimacyMap = { 'legit': '✅' as const, 'suspicious': '⚠️' as const, 'fake': '❌' as const };
        logger.info('PERPLEXITY', `Parsed result: legitimacy=${finalLegitimacy}, confidence=${finalConfidence}`);

        return {
          legitimacy: finalLegitimacy,
          legitimacyEmoji: legitimacyMap[finalLegitimacy],
          explanation: finalExplanation,
          confidence: finalConfidence,
          checkDetails: { eventExists: finalEventExists, venueValid: finalVenueValid, dateValid: finalDateValid, possibleDuplicate }
        };
      }

      // 4) No parseable JSON: apply lenient, data-aware fallback (never key off narrative words like "fake")
      const now = new Date();
      const eventDate = new Date(data.eventDate);
      const dateValid = isFinite(eventDate.getTime()) && eventDate >= new Date(now.toISOString().split('T')[0]);
      const forbiddenVenuePattern = /(scam|fake|test|\b123\b|xxx)/i;
      const venueValid = !!data.venueLocation && !forbiddenVenuePattern.test(data.venueLocation);
      const quantityOK = Number.isFinite(data.ticketQuantity) && data.ticketQuantity > 0 && data.ticketQuantity <= 10000;
      const gibberishTitle = /[^\w\s\-.,'&()/]/.test(data.listingTitle) || /^[a-z]{1,2}\s?[a-z]{1,2}\s?[a-z]{1,2}$/i.test(data.listingTitle);

      let legitimacy: 'legit' | 'suspicious' | 'fake' = 'legit';
      if (!dateValid || !venueValid || !quantityOK || gibberishTitle) {
        legitimacy = (!dateValid && (venueValid && quantityOK) ? 'suspicious' : 'suspicious');
      }
      const confidence = legitimacy === 'legit' ? 90 : 60;
      const explanation = legitimacy === 'legit'
        ? 'No red flags detected based on date, venue, and quantity. Defaulting to legit due to missing structured AI output.'
        : 'Some fields could not be confirmed; applying lenient fallback without clear fraud signals.';

      const legitimacyMap = { 'legit': '✅' as const, 'suspicious': '⚠️' as const, 'fake': '❌' as const };
      logger.info('PERPLEXITY', `Parsed result (fallback): legitimacy=${legitimacy}, confidence=${confidence}`);

      return {
        legitimacy,
        legitimacyEmoji: legitimacyMap[legitimacy],
        explanation,
        confidence,
        checkDetails: {
          eventExists: true, // cannot verify without web; assume true per lenient policy
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