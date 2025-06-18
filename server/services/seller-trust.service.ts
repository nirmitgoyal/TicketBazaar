/**
 * Seller Trust Intelligence Service
 * Uses Perplexity AI to research and assess seller trustworthiness
 */

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TrustAssessment {
  trustScore: number; // 0-10 scale
  riskLevel: 'low' | 'moderate' | 'high';
  summary: string;
  verifiedProfiles: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  riskWarnings: string[];
  lastVerified: Date;
  confidence: number; // 0-100 percentage
}

interface SellerProfile {
  fullName: string;
  email: string;
  instagram?: string;
  phoneVerified: boolean;
  governmentIdVerified: boolean;
  country?: string;
}

export class SellerTrustService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
  }

  async assessSellerTrust(seller: SellerProfile): Promise<TrustAssessment> {
    try {
      const prompt = this.buildTrustAssessmentPrompt(seller);
      const response = await this.callPerplexityAPI(prompt);
      return this.parseTrustAssessment(response, seller);
    } catch (error) {
      console.error('Error assessing seller trust:', error);
      return this.getFallbackAssessment(seller);
    }
  }

  private buildTrustAssessmentPrompt(seller: SellerProfile): string {
    return `Research and assess the trustworthiness of this ticket seller:

SELLER INFORMATION:
- Full Name: ${seller.fullName}
- Email Domain: ${seller.email.split('@')[1]}
- Instagram: ${seller.instagram ? `@${seller.instagram}` : 'Not provided'}
- Phone Verified: ${seller.phoneVerified ? 'Yes' : 'No'}
- Government ID Verified: ${seller.governmentIdVerified ? 'Yes' : 'No'}
- Location: ${seller.country || 'Unknown'}

RESEARCH TASKS:
1. Search for this person's professional online presence (LinkedIn, company profiles)
2. Verify Instagram account authenticity if provided (check follower count, post history, engagement)
3. Look for any reports of ticket scams or fraud associated with this name/profile
4. Check if email domain belongs to a legitimate organization
5. Assess overall digital footprint legitimacy

ANALYSIS REQUIREMENTS:
- Provide a trust score from 0-10 (10 being most trustworthy)
- Identify verified social media profiles with URLs
- Flag any red flags or concerning patterns
- Assess risk level: low, moderate, or high
- Give confidence percentage in your assessment

FORMAT YOUR RESPONSE AS:
Trust Score: [0-10]
Risk Level: [low/moderate/high]
Summary: [2-3 sentence assessment]
Verified Profiles: [LinkedIn: URL, Instagram: URL, etc.]
Risk Warnings: [List any concerns or red flags]
Confidence: [0-100]%

Focus on factual findings from reputable sources. If insufficient information is available, indicate uncertainty rather than speculation.`;
  }

  private async callPerplexityAPI(prompt: string): Promise<string> {
    const requestBody = {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a trustworthiness analyst specializing in online marketplace safety. Provide factual, evidence-based assessments of seller credibility using publicly available information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseTrustAssessment(aiResponse: string, seller: SellerProfile): TrustAssessment {
    const lines = aiResponse.split('\n').map(line => line.trim());
    
    // Extract trust score
    const trustScoreLine = lines.find(line => line.toLowerCase().includes('trust score:'));
    const trustScore = this.extractNumber(trustScoreLine || '', 0, 10) || this.calculateBasicTrustScore(seller);

    // Extract risk level
    const riskLevelLine = lines.find(line => line.toLowerCase().includes('risk level:'));
    const riskLevel = this.extractRiskLevel(riskLevelLine || '') || this.calculateBasicRiskLevel(trustScore);

    // Extract summary
    const summaryLine = lines.find(line => line.toLowerCase().includes('summary:'));
    const summary = this.extractAfterColon(summaryLine || '') || this.generateBasicSummary(seller, trustScore);

    // Extract verified profiles
    const profilesLine = lines.find(line => line.toLowerCase().includes('verified profiles:'));
    const verifiedProfiles = this.extractVerifiedProfiles(profilesLine || '', seller);

    // Extract risk warnings
    const warningsLine = lines.find(line => line.toLowerCase().includes('risk warnings:'));
    const riskWarnings = this.extractRiskWarnings(warningsLine || '');

    // Extract confidence
    const confidenceLine = lines.find(line => line.toLowerCase().includes('confidence:'));
    const confidence = this.extractNumber(confidenceLine || '', 0, 100) || this.calculateBasicConfidence(seller);

    return {
      trustScore,
      riskLevel,
      summary,
      verifiedProfiles,
      riskWarnings,
      lastVerified: new Date(),
      confidence
    };
  }

  private extractNumber(text: string, min: number, max: number): number | null {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      return Math.max(min, Math.min(max, num));
    }
    return null;
  }

  private extractRiskLevel(text: string): 'low' | 'moderate' | 'high' | null {
    const lower = text.toLowerCase();
    if (lower.includes('low')) return 'low';
    if (lower.includes('moderate') || lower.includes('medium')) return 'moderate';
    if (lower.includes('high')) return 'high';
    return null;
  }

  private extractAfterColon(text: string): string {
    const colonIndex = text.indexOf(':');
    return colonIndex >= 0 ? text.substring(colonIndex + 1).trim() : '';
  }

  private extractVerifiedProfiles(text: string, seller: SellerProfile) {
    const profiles: TrustAssessment['verifiedProfiles'] = {};
    
    // Extract LinkedIn URLs
    const linkedinMatch = text.match(/linkedin[:\s]+([^\s,]+)/i);
    if (linkedinMatch) profiles.linkedin = linkedinMatch[1];

    // Extract Instagram URLs or handle
    const instagramMatch = text.match(/instagram[:\s]+([^\s,]+)/i);
    if (instagramMatch) {
      profiles.instagram = instagramMatch[1];
    } else if (seller.instagram) {
      profiles.instagram = `https://instagram.com/${seller.instagram.replace('@', '')}`;
    }

    // Extract Facebook URLs
    const facebookMatch = text.match(/facebook[:\s]+([^\s,]+)/i);
    if (facebookMatch) profiles.facebook = facebookMatch[1];

    // Extract Twitter URLs
    const twitterMatch = text.match(/twitter[:\s]+([^\s,]+)/i);
    if (twitterMatch) profiles.twitter = twitterMatch[1];

    return profiles;
  }

  private extractRiskWarnings(text: string): string[] {
    const warnings: string[] = [];
    const warningText = this.extractAfterColon(text);
    
    if (warningText && warningText.toLowerCase() !== 'none') {
      // Split by common delimiters and clean up
      const items = warningText.split(/[,;•\-\n]/).map(item => item.trim()).filter(item => item.length > 0);
      warnings.push(...items);
    }

    return warnings;
  }

  private calculateBasicTrustScore(seller: SellerProfile): number {
    let score = 5; // Base score

    if (seller.phoneVerified) score += 1.5;
    if (seller.governmentIdVerified) score += 2;
    if (seller.instagram) score += 0.5;
    if (seller.email.includes('@gmail.com') || seller.email.includes('@yahoo.com')) score -= 0.5;
    if (seller.email.includes('@')) {
      const domain = seller.email.split('@')[1];
      if (!domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
        score += 1; // Professional email domain
      }
    }

    return Math.max(0, Math.min(10, score));
  }

  private calculateBasicRiskLevel(trustScore: number): 'low' | 'moderate' | 'high' {
    if (trustScore >= 7.5) return 'low';
    if (trustScore >= 5) return 'moderate';
    return 'high';
  }

  private generateBasicSummary(seller: SellerProfile, trustScore: number): string {
    const verificationLevel = seller.governmentIdVerified ? 'fully verified' : 
                            seller.phoneVerified ? 'partially verified' : 'basic';
    
    if (trustScore >= 7.5) {
      return `This seller appears to be ${verificationLevel} with good verification credentials. No immediate red flags detected.`;
    } else if (trustScore >= 5) {
      return `This seller has ${verificationLevel} status with moderate trust indicators. Exercise normal caution.`;
    } else {
      return `This seller has limited verification and trust indicators. Exercise extra caution when proceeding.`;
    }
  }

  private calculateBasicConfidence(seller: SellerProfile): number {
    let confidence = 40; // Base confidence for limited information

    if (seller.phoneVerified) confidence += 15;
    if (seller.governmentIdVerified) confidence += 20;
    if (seller.instagram) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private getFallbackAssessment(seller: SellerProfile): TrustAssessment {
    const trustScore = this.calculateBasicTrustScore(seller);
    return {
      trustScore,
      riskLevel: this.calculateBasicRiskLevel(trustScore),
      summary: this.generateBasicSummary(seller, trustScore),
      verifiedProfiles: seller.instagram ? {
        instagram: `https://instagram.com/${seller.instagram.replace('@', '')}`
      } : {},
      riskWarnings: ['AI verification temporarily unavailable - assessment based on platform verification only'],
      lastVerified: new Date(),
      confidence: this.calculateBasicConfidence(seller)
    };
  }
}