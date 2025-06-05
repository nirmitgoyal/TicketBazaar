import { Ticket, User } from "@shared/schema";

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface VerificationResult {
  isVerified: boolean;
  confidence: number; // 0-100
  reasons: string[];
  sources: string[];
  fraudRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class VerificationService {
  private perplexityApiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
  }

  private async callPerplexityAPI(messages: Array<{ role: string; content: string }>): Promise<PerplexityResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
        return_related_questions: false,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async verifyEvent(ticket: Ticket): Promise<VerificationResult> {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert event verification specialist. Analyze events for authenticity and provide detailed verification results in JSON format.',
      },
      {
        role: 'user',
        content: `Verify this event for authenticity:
        
Event: ${ticket.eventTitle}
Venue: ${ticket.venue}
Date: ${ticket.eventDate}
City: ${ticket.city}
Category: ${ticket.category}
Description: ${ticket.eventDescription}

Please check:
1. If this event is officially announced and legitimate
2. If the venue and date match official sources
3. If there are any fraud reports or warnings
4. If the event organizer is reputable
5. If ticket pricing seems reasonable for this type of event

Respond with a JSON object containing:
{
  "isVerified": boolean,
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "sources": ["url1", "url2"],
  "fraudRisk": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2"]
}`
      }
    ];

    try {
      const response = await this.callPerplexityAPI(messages);
      const content = response.choices[0]?.message?.content || '{}';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Unable to parse verification response');
      }

      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Add sources from citations
      if (response.citations && response.citations.length > 0) {
        result.sources = [...(result.sources || []), ...response.citations];
      }

      return result;
    } catch (error) {
      console.error('Event verification error:', error);
      return {
        isVerified: false,
        confidence: 0,
        reasons: ['Unable to verify event due to technical error'],
        sources: [],
        fraudRisk: 'high',
        recommendations: ['Manual verification recommended']
      };
    }
  }

  async verifySeller(user: User, ticketHistory?: Ticket[]): Promise<VerificationResult> {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert seller verification specialist. Analyze sellers for trustworthiness and fraud risk.',
      },
      {
        role: 'user',
        content: `Verify this ticket seller for trustworthiness:

Seller: ${user.fullName}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Instagram: ${user.instagram || 'Not provided'}
Rating: ${user.rating}/5.0 (${user.ratingsCount} reviews)
Contact Method: ${user.preferredContactMethod}

${ticketHistory ? `Recent Tickets Sold:
${ticketHistory.slice(0, 5).map(t => `- ${t.eventTitle} at ${t.venue} (₹${t.price})`).join('\n')}` : ''}

Please check:
1. If the contact information seems legitimate
2. If there are any fraud reports or warnings about this seller
3. If the Instagram profile (if provided) appears authentic
4. If the seller's rating and review pattern is suspicious
5. If the ticket pricing history shows any red flags

Respond with a JSON object containing:
{
  "isVerified": boolean,
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "sources": ["url1", "url2"],
  "fraudRisk": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2"]
}`
      }
    ];

    try {
      const response = await this.callPerplexityAPI(messages);
      const content = response.choices[0]?.message?.content || '{}';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Unable to parse verification response');
      }

      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Add sources from citations
      if (response.citations && response.citations.length > 0) {
        result.sources = [...(result.sources || []), ...response.citations];
      }

      return result;
    } catch (error) {
      console.error('Seller verification error:', error);
      return {
        isVerified: false,
        confidence: 0,
        reasons: ['Unable to verify seller due to technical error'],
        sources: [],
        fraudRisk: 'high',
        recommendations: ['Manual verification recommended']
      };
    }
  }

  async verifyTicketPricing(ticket: Ticket): Promise<VerificationResult> {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert ticket pricing analyst. Analyze ticket prices for fairness and potential fraud.',
      },
      {
        role: 'user',
        content: `Analyze this ticket pricing for fairness:

Event: ${ticket.eventTitle}
Venue: ${ticket.venue}
Section: ${ticket.section}
Price: ₹${ticket.price} (for ${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''})
Category: ${ticket.category}
Date: ${ticket.eventDate}

Please check:
1. If the price is reasonable compared to official ticket prices
2. If this is within typical resale market range
3. If there are any price manipulation red flags
4. If similar events have similar pricing
5. If the section/seating justifies the price

Respond with a JSON object containing:
{
  "isVerified": boolean,
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "sources": ["url1", "url2"],
  "fraudRisk": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2"]
}`
      }
    ];

    try {
      const response = await this.callPerplexityAPI(messages);
      const content = response.choices[0]?.message?.content || '{}';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Unable to parse verification response');
      }

      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Add sources from citations
      if (response.citations && response.citations.length > 0) {
        result.sources = [...(result.sources || []), ...response.citations];
      }

      return result;
    } catch (error) {
      console.error('Pricing verification error:', error);
      return {
        isVerified: false,
        confidence: 0,
        reasons: ['Unable to verify pricing due to technical error'],
        sources: [],
        fraudRisk: 'medium',
        recommendations: ['Check official sources for pricing comparison']
      };
    }
  }

  async performComprehensiveVerification(ticket: Ticket, seller: User, sellerHistory?: Ticket[]): Promise<{
    event: VerificationResult;
    seller: VerificationResult;
    pricing: VerificationResult;
    overall: VerificationResult;
  }> {
    const [eventResult, sellerResult, pricingResult] = await Promise.all([
      this.verifyEvent(ticket),
      this.verifySeller(seller, sellerHistory),
      this.verifyTicketPricing(ticket)
    ]);

    // Calculate overall verification
    const averageConfidence = (eventResult.confidence + sellerResult.confidence + pricingResult.confidence) / 3;
    const hasHighRisk = [eventResult, sellerResult, pricingResult].some(r => r.fraudRisk === 'high');
    const hasMediumRisk = [eventResult, sellerResult, pricingResult].some(r => r.fraudRisk === 'medium');
    
    const overall: VerificationResult = {
      isVerified: averageConfidence >= 70 && !hasHighRisk,
      confidence: Math.round(averageConfidence),
      reasons: [
        ...eventResult.reasons,
        ...sellerResult.reasons,
        ...pricingResult.reasons
      ],
      sources: [
        ...eventResult.sources,
        ...sellerResult.sources,
        ...pricingResult.sources
      ],
      fraudRisk: hasHighRisk ? 'high' : hasMediumRisk ? 'medium' : 'low',
      recommendations: [
        ...eventResult.recommendations,
        ...sellerResult.recommendations,
        ...pricingResult.recommendations
      ]
    };

    return {
      event: eventResult,
      seller: sellerResult,
      pricing: pricingResult,
      overall
    };
  }
}