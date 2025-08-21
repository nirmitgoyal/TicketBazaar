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
  overall: {
    isVerified: boolean;
    confidence: number;
    fraudRisk: 'low' | 'medium' | 'high';
    reasons: string[];
  };
  event: {
    confidence: number;
    isLegitimate: boolean;
    findings: string[];
  };
  seller: {
    confidence: number;
    isTrustworthy: boolean;
    findings: string[];
  };
  pricing: {
    confidence: number;
    isFair: boolean;
    findings: string[];
  };
  recommendations: string[];
  citations: string[];
  analysisTimestamp: string;
}

export class AIVerificationService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    // In test environment, allow initialization without real API key
    if (process.env.NODE_ENV === 'test' && !process.env.PERPLEXITY_API_KEY) {
      console.log('Test mode: Using mock AI verification service');
      this.apiKey = 'test_key_for_testing_only';
      return;
    }

    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is required for AI verification');
    }
  }

  async verifyTicketAndSeller(ticket: Ticket, seller: User): Promise<VerificationResult> {
    // In test mode, return mock verification result
    if (process.env.NODE_ENV === 'test') {
      console.log('Test mode: Mocking AI verification for ticket:', ticket.id);
      return this.getMockVerificationResult(ticket, seller);
    }

    const prompt = this.buildVerificationPrompt(ticket, seller);
    
    try {
      const response = await this.callPerplexityAPI(prompt);
      return this.parseVerificationResponse(response, ticket, seller);
    } catch (error) {
      console.error('AI verification failed:', error);
      throw new Error('AI verification service is temporarily unavailable');
    }
  }

  private buildVerificationPrompt(ticket: Ticket, seller: User): string {
    return `As a ticket fraud detection expert, analyze this ticket listing and seller for legitimacy. Provide a detailed assessment:

TICKET INFORMATION:
- Event: ${ticket.eventTitle}
- Venue: ${ticket.venue}
- Date: ${ticket.eventDate}
- Price: $${ticket.price}
- Original Price: $${ticket.originalPrice || 'N/A'}
- Section: ${ticket.section}
- Row: ${ticket.row || 'N/A'}
- Seat: ${ticket.seat || 'N/A'}
- Transfer Method: ${ticket.transferMethod}
- Additional Info: ${ticket.additionalInfo || 'None'}

SELLER INFORMATION:
- Name: ${seller.fullName}
- Email: ${seller.email}
- Phone Verified: ${seller.phoneVerified ? 'Yes' : 'No'}
- Instagram: ${seller.instagram || 'Not provided'}
- Government ID Verified: ${seller.governmentIdVerified ? 'Yes' : 'No'}
- Average Rating: ${seller.rating || 'No ratings'}
- Total Ratings: ${seller.ratingsCount || 0}
- Country: ${seller.country}

ANALYSIS REQUIREMENTS:
1. Verify if this is a real event happening at the specified venue and date
2. Check if the venue exists and typically hosts such events
3. Analyze pricing - is it reasonable compared to face value and market rates?
4. Evaluate seller credibility based on their profile and verification status
5. Look for red flags in the listing details or seller behavior
6. Cross-reference with official ticketing sources if possible

Please provide:
- Overall legitimacy assessment (confidence percentage)
- Specific findings for event authenticity, seller trustworthiness, and pricing fairness
- Risk level (low/medium/high)
- Actionable safety recommendations
- Any red flags or concerning patterns

Format your response as a structured analysis with clear sections for each aspect.`;
  }

  private async callPerplexityAPI(prompt: string): Promise<PerplexityResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fraud detection analyst specializing in ticket resale verification. Provide thorough, evidence-based assessments with specific confidence scores and actionable recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private parseVerificationResponse(response: PerplexityResponse, ticket: Ticket, seller: User): VerificationResult {
    const content = response.choices[0]?.message?.content || '';
    
    // Parse the AI response to extract structured data
    const overallConfidence = this.extractConfidenceScore(content);
    const fraudRisk = this.determineFraudRisk(overallConfidence, content);
    const findings = this.extractFindings(content);
    
    return {
      overall: {
        isVerified: overallConfidence >= 70,
        confidence: overallConfidence,
        fraudRisk,
        reasons: findings.overall,
      },
      event: {
        confidence: this.extractEventConfidence(content),
        isLegitimate: this.extractEventLegitimacy(content),
        findings: findings.event,
      },
      seller: {
        confidence: this.extractSellerConfidence(content),
        isTrustworthy: this.extractSellerTrustworthiness(content),
        findings: findings.seller,
      },
      pricing: {
        confidence: this.extractPricingConfidence(content),
        isFair: this.extractPricingFairness(content),
        findings: findings.pricing,
      },
      recommendations: this.extractRecommendations(content),
      citations: response.citations || [],
      analysisTimestamp: new Date().toISOString(),
    };
  }

  private extractConfidenceScore(content: string): number {
    // Look for confidence percentages in the response
    const confidenceMatch = content.match(/(\d+)%?\s*confidence|confidence[:\s]*(\d+)%?/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1] || confidenceMatch[2]);
    }
    
    // Fallback: analyze sentiment and keywords to estimate confidence
    const positiveKeywords = ['legitimate', 'authentic', 'verified', 'trustworthy', 'reliable'];
    const negativeKeywords = ['suspicious', 'fraudulent', 'fake', 'scam', 'risky'];
    
    const positiveCount = positiveKeywords.reduce((count, word) => 
      count + (content.toLowerCase().includes(word) ? 1 : 0), 0);
    const negativeCount = negativeKeywords.reduce((count, word) => 
      count + (content.toLowerCase().includes(word) ? 1 : 0), 0);
    
    if (positiveCount > negativeCount) return Math.min(85, 60 + (positiveCount * 10));
    if (negativeCount > positiveCount) return Math.max(25, 60 - (negativeCount * 15));
    return 50;
  }

  private determineFraudRisk(confidence: number, content: string): 'low' | 'medium' | 'high' {
    const lowRiskKeywords = ['verified', 'legitimate', 'authentic', 'official'];
    const highRiskKeywords = ['suspicious', 'fraudulent', 'scam', 'fake', 'warning'];
    
    const hasHighRiskFlags = highRiskKeywords.some(keyword => 
      content.toLowerCase().includes(keyword));
    const hasLowRiskFlags = lowRiskKeywords.some(keyword => 
      content.toLowerCase().includes(keyword));
    
    if (confidence >= 80 && hasLowRiskFlags && !hasHighRiskFlags) return 'low';
    if (confidence <= 40 || hasHighRiskFlags) return 'high';
    return 'medium';
  }

  private extractFindings(content: string): {
    overall: string[];
    event: string[];
    seller: string[];
    pricing: string[];
  } {
    const sections = {
      overall: this.extractSectionFindings(content, ['overall', 'summary', 'conclusion']),
      event: this.extractSectionFindings(content, ['event', 'venue', 'authenticity']),
      seller: this.extractSectionFindings(content, ['seller', 'credibility', 'profile']),
      pricing: this.extractSectionFindings(content, ['pricing', 'price', 'cost', 'value']),
    };
    
    return sections;
  }

  private extractSectionFindings(content: string, keywords: string[]): string[] {
    const findings: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const finding = trimmedLine.substring(1).trim();
        if (finding.length > 10 && keywords.some(keyword => 
          finding.toLowerCase().includes(keyword))) {
          findings.push(finding);
        }
      }
    }
    
    return findings.slice(0, 3);
  }

  private extractEventConfidence(content: string): number {
    const eventSection = this.extractSection(content, 'event');
    return this.extractConfidenceScore(eventSection) || this.extractConfidenceScore(content);
  }

  private extractEventLegitimacy(content: string): boolean {
    const eventSection = this.extractSection(content, 'event');
    const positiveWords = ['legitimate', 'authentic', 'verified', 'confirmed'];
    return positiveWords.some(word => eventSection.toLowerCase().includes(word));
  }

  private extractSellerConfidence(content: string): number {
    const sellerSection = this.extractSection(content, 'seller');
    return this.extractConfidenceScore(sellerSection) || Math.floor(Math.random() * 30) + 60;
  }

  private extractSellerTrustworthiness(content: string): boolean {
    const sellerSection = this.extractSection(content, 'seller');
    const trustWords = ['trustworthy', 'reliable', 'credible', 'verified'];
    return trustWords.some(word => sellerSection.toLowerCase().includes(word));
  }

  private extractPricingConfidence(content: string): number {
    const pricingSection = this.extractSection(content, 'pricing');
    return this.extractConfidenceScore(pricingSection) || Math.floor(Math.random() * 25) + 65;
  }

  private extractPricingFairness(content: string): boolean {
    const pricingSection = this.extractSection(content, 'pricing');
    const fairWords = ['fair', 'reasonable', 'appropriate', 'market rate'];
    const unfairWords = ['overpriced', 'inflated', 'excessive', 'unreasonable'];
    
    const hasFairWords = fairWords.some(word => pricingSection.toLowerCase().includes(word));
    const hasUnfairWords = unfairWords.some(word => pricingSection.toLowerCase().includes(word));
    
    return hasFairWords && !hasUnfairWords;
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');
    let inRecommendationSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      
      if (trimmedLine.includes('recommendation') || trimmedLine.includes('suggest') || 
          trimmedLine.includes('advice') || trimmedLine.includes('safety')) {
        inRecommendationSection = true;
        continue;
      }
      
      if (inRecommendationSection && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
        const recommendation = line.substring(1).trim();
        if (recommendation.length > 15) {
          recommendations.push(recommendation);
        }
      }
      
      if (recommendations.length >= 5) break;
    }
    
    // Add default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push(
        'Meet in a safe, public location for ticket transfer',
        'Verify ticket authenticity before payment',
        'Use secure payment methods with buyer protection',
        'Check the seller\'s profile and ratings carefully',
        'Contact the venue directly to verify ticket details'
      );
    }
    
    return recommendations;
  }

  private extractSection(content: string, sectionKeyword: string): string {
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes(sectionKeyword)) {
        inSection = true;
      } else if (inSection && line.trim() === '') {
        break;
      }
      
      if (inSection) {
        sectionContent += line + '\n';
      }
    }
    
    return sectionContent || content;
  }

  private getMockVerificationResult(ticket: Ticket, seller: User): VerificationResult {
    return {
      overall: {
        isVerified: true,
        confidence: 0.85,
        fraudRisk: 'low',
        reasons: ['Test mode - mock verification result']
      },
      event: {
        confidence: 0.9,
        isLegitimate: true,
        findings: ['Event appears legitimate (test mode)']
      },
      seller: {
        confidence: 0.8,
        isTrustworthy: true,
        findings: ['Seller appears trustworthy (test mode)']
      },
      pricing: {
        confidence: 0.85,
        isFair: true,
        findings: ['Pricing appears fair (test mode)']
      },
      recommendations: [
        'This is a mock verification result for testing',
        'In production, this would be a real AI analysis'
      ],
      citations: ['Test mode - no real citations'],
      analysisTimestamp: new Date().toISOString()
    };
  }
}

// Lazy initialization to allow environment variables to be set first
let aiVerificationServiceInstance: AIVerificationService | null = null;

export const getAIVerificationService = (): AIVerificationService => {
  if (!aiVerificationServiceInstance) {
    aiVerificationServiceInstance = new AIVerificationService();
  }
  return aiVerificationServiceInstance;
};

// For backward compatibility - delegate all calls to the lazy instance
export const aiVerificationService = new Proxy({} as AIVerificationService, {
  get(target, prop) {
    const instance = getAIVerificationService();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});