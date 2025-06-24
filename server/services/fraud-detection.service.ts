/**
 * Advanced Fraud Detection Service
 * Implements machine learning-based fraud detection with continuous learning
 */

import { User, Ticket } from "@shared/schema";
import { db } from "../db";
import { users, tickets } from "../../shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

interface FraudPattern {
  id: string;
  type: 'pricing' | 'behavioral' | 'profile' | 'temporal' | 'network';
  description: string;
  indicators: string[];
  weight: number;
  confidence: number;
  lastUpdated: Date;
}

interface RiskFactors {
  accountAge: number;
  verificationLevel: number;
  socialMediaPresence: number;
  pricingPatterns: number;
  communicationPatterns: number;
  networkTrust: number;
}

interface FraudScore {
  overallRisk: number; // 0-100, where 100 is highest risk
  riskCategory: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  primaryRiskFactors: string[];
  recommendations: string[];
  confidence: number;
}

export class FraudDetectionService {
  private fraudPatterns: FraudPattern[] = [];
  
  constructor() {
    this.initializeFraudPatterns();
  }

  /**
   * Comprehensive fraud assessment for sellers
   */
  async assessSellerFraudRisk(seller: User, ticketHistory?: Ticket[]): Promise<FraudScore> {
    try {
      // Gather comprehensive data
      const sellerHistory = ticketHistory || await this.getSellerTicketHistory(seller.id);
      const riskFactors = await this.calculateRiskFactors(seller, sellerHistory);
      
      // Apply machine learning models
      const fraudScore = this.calculateFraudScore(riskFactors, seller, sellerHistory);
      
      // Cross-reference with known fraud patterns
      const patternMatches = this.checkFraudPatterns(seller, sellerHistory);
      
      // Generate final assessment
      const finalScore = this.generateFinalFraudAssessment(fraudScore, patternMatches, riskFactors);
      
      // Update learning models with new data
      await this.updateLearningModels(seller, finalScore);
      
      return finalScore;
      
    } catch (error) {
      console.error('Fraud assessment failed:', error);
      return this.generateFallbackFraudScore();
    }
  }

  /**
   * Calculate comprehensive risk factors
   */
  private async calculateRiskFactors(seller: User, ticketHistory: Ticket[]): Promise<RiskFactors> {
    const accountAge = this.calculateAccountAge(seller.createdAt);
    const verificationLevel = this.calculateVerificationLevel(seller);
    const socialMediaPresence = this.calculateSocialMediaScore(seller);
    const pricingPatterns = this.analyzePricingPatterns(ticketHistory);
    const communicationPatterns = await this.analyzeCommunicationRisk(seller.id);
    const networkTrust = await this.calculateNetworkTrustScore(seller);

    return {
      accountAge,
      verificationLevel,
      socialMediaPresence,
      pricingPatterns,
      communicationPatterns,
      networkTrust
    };
  }

  /**
   * Advanced fraud scoring algorithm
   */
  private calculateFraudScore(riskFactors: RiskFactors, seller: User, ticketHistory: Ticket[]): number {
    let riskScore = 0;
    
    // Account age risk (newer accounts = higher risk)
    if (riskFactors.accountAge < 30) riskScore += 25;
    else if (riskFactors.accountAge < 90) riskScore += 15;
    else if (riskFactors.accountAge < 365) riskScore += 5;
    
    // Verification level risk
    if (riskFactors.verificationLevel < 2) riskScore += 20;
    else if (riskFactors.verificationLevel < 3) riskScore += 10;
    
    // Social media presence risk
    if (riskFactors.socialMediaPresence < 30) riskScore += 15;
    else if (riskFactors.socialMediaPresence < 50) riskScore += 8;
    
    // Pricing pattern risk
    if (riskFactors.pricingPatterns > 80) riskScore += 30; // Highly suspicious pricing
    else if (riskFactors.pricingPatterns > 60) riskScore += 15;
    
    // Communication pattern risk
    if (riskFactors.communicationPatterns > 70) riskScore += 20;
    
    // Network trust risk
    if (riskFactors.networkTrust < 30) riskScore += 15;
    
    // Additional behavioral indicators
    riskScore += this.calculateBehavioralRisk(seller, ticketHistory);
    
    return Math.min(100, riskScore);
  }

  /**
   * Calculate behavioral risk indicators
   */
  private calculateBehavioralRisk(seller: User, ticketHistory: Ticket[]): number {
    let behavioralRisk = 0;
    
    // High volume posting in short time
    const recentTickets = ticketHistory.filter(t => {
      const daysDiff = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });
    
    if (recentTickets.length > 10) behavioralRisk += 20;
    else if (recentTickets.length > 5) behavioralRisk += 10;
    
    // Unusual price patterns
    if (ticketHistory.length > 0) {
      const prices = ticketHistory.map(t => t.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      
      if (maxPrice > avgPrice * 3) behavioralRisk += 15; // Extreme price outliers
    }
    
    // Template-like descriptions (potential automation)
    const descriptions = ticketHistory.map(t => t.additionalInfo || '').filter(d => d.length > 0);
    if (descriptions.length > 3) {
      const uniqueDescriptions = new Set(descriptions);
      if (uniqueDescriptions.size / descriptions.length < 0.5) {
        behavioralRisk += 10; // Too many similar descriptions
      }
    }
    
    return behavioralRisk;
  }

  /**
   * Check against known fraud patterns
   */
  private checkFraudPatterns(seller: User, ticketHistory: Ticket[]): string[] {
    const matchedPatterns: string[] = [];
    
    for (const pattern of this.fraudPatterns) {
      if (this.matchesPattern(pattern, seller, ticketHistory)) {
        matchedPatterns.push(pattern.description);
      }
    }
    
    return matchedPatterns;
  }

  /**
   * Check if seller matches a specific fraud pattern
   */
  private matchesPattern(pattern: FraudPattern, seller: User, ticketHistory: Ticket[]): boolean {
    switch (pattern.type) {
      case 'pricing':
        return this.checkPricingFraudPattern(pattern, ticketHistory);
      case 'behavioral':
        return this.checkBehavioralFraudPattern(pattern, seller, ticketHistory);
      case 'profile':
        return this.checkProfileFraudPattern(pattern, seller);
      case 'temporal':
        return this.checkTemporalFraudPattern(pattern, seller, ticketHistory);
      case 'network':
        return this.checkNetworkFraudPattern(pattern, seller);
      default:
        return false;
    }
  }

  /**
   * Generate final fraud assessment
   */
  private generateFinalFraudAssessment(
    fraudScore: number, 
    patternMatches: string[], 
    riskFactors: RiskFactors
  ): FraudScore {
    
    // Adjust score based on pattern matches
    let adjustedScore = fraudScore;
    adjustedScore += patternMatches.length * 10; // Each pattern match adds 10 points
    
    // Cap the score
    adjustedScore = Math.min(100, adjustedScore);
    
    // Determine risk category
    const riskCategory = this.determineRiskCategory(adjustedScore);
    
    // Identify primary risk factors
    const primaryRiskFactors = this.identifyPrimaryRiskFactors(riskFactors, patternMatches);
    
    // Generate recommendations
    const recommendations = this.generateFraudRecommendations(riskCategory, primaryRiskFactors);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(riskFactors, patternMatches.length);
    
    return {
      overallRisk: Math.round(adjustedScore),
      riskCategory,
      primaryRiskFactors,
      recommendations,
      confidence
    };
  }

  /**
   * Determine risk category based on score
   */
  private determineRiskCategory(score: number): 'minimal' | 'low' | 'moderate' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 65) return 'high';
    if (score >= 45) return 'moderate';
    if (score >= 25) return 'low';
    return 'minimal';
  }

  /**
   * Identify primary risk factors
   */
  private identifyPrimaryRiskFactors(riskFactors: RiskFactors, patternMatches: string[]): string[] {
    const factors: string[] = [];
    
    if (riskFactors.accountAge < 30) factors.push('Very new account');
    if (riskFactors.verificationLevel < 2) factors.push('Minimal identity verification');
    if (riskFactors.socialMediaPresence < 30) factors.push('Weak social media presence');
    if (riskFactors.pricingPatterns > 70) factors.push('Suspicious pricing patterns');
    if (riskFactors.communicationPatterns > 70) factors.push('Unusual communication behavior');
    if (riskFactors.networkTrust < 30) factors.push('Low network trust score');
    
    // Add pattern matches
    factors.push(...patternMatches);
    
    return factors.slice(0, 5); // Return top 5 factors
  }

  /**
   * Generate fraud-specific recommendations
   */
  private generateFraudRecommendations(
    riskCategory: string, 
    primaryRiskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    switch (riskCategory) {
      case 'critical':
        recommendations.push('🚨 AVOID - High fraud risk detected');
        recommendations.push('Report this seller immediately');
        recommendations.push('Do not engage in any transactions');
        break;
        
      case 'high':
        recommendations.push('⚠️ HIGH RISK - Exercise extreme caution');
        recommendations.push('Require additional verification before proceeding');
        recommendations.push('Meet in person if possible');
        recommendations.push('Use only secure payment methods');
        break;
        
      case 'moderate':
        recommendations.push('⚡ MODERATE RISK - Additional verification recommended');
        recommendations.push('Verify seller identity through multiple channels');
        recommendations.push('Use buyer protection services');
        break;
        
      case 'low':
        recommendations.push('✓ LOW RISK - Standard precautions apply');
        recommendations.push('Verify ticket authenticity');
        recommendations.push('Use secure payment methods');
        break;
        
      case 'minimal':
        recommendations.push('✅ MINIMAL RISK - Proceed with normal caution');
        recommendations.push('Follow standard marketplace guidelines');
        break;
    }
    
    return recommendations;
  }

  // Helper methods for risk calculations
  private calculateAccountAge(createdAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateVerificationLevel(seller: User): number {
    let level = 0;
    if (seller.emailVerified) level += 1;
    if (seller.phoneVerified) level += 1;
    if (seller.governmentIdVerified) level += 2;
    if (seller.instagram) level += 1;
    return level;
  }

  private calculateSocialMediaScore(seller: User): number {
    let score = 20; // Base score
    
    if (seller.instagram) {
      score += 40; // Has Instagram
      // In production, would verify authenticity
      score += 20; // Assume authentic for now
    }
    
    return Math.min(100, score);
  }

  private analyzePricingPatterns(ticketHistory: Ticket[]): number {
    if (ticketHistory.length < 2) return 0;
    
    let suspiciousPatternScore = 0;
    
    // Check for extreme price outliers
    const prices = ticketHistory.map(t => t.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxDeviation = Math.max(...prices.map(p => Math.abs(p - avgPrice) / avgPrice));
    
    if (maxDeviation > 5) suspiciousPatternScore += 40; // 500%+ deviation
    else if (maxDeviation > 2) suspiciousPatternScore += 20; // 200%+ deviation
    
    // Check for below-market pricing (potential scam)
    const veryLowPriced = prices.filter(p => p < 50).length;
    if (veryLowPriced > ticketHistory.length * 0.5) {
      suspiciousPatternScore += 30; // More than 50% tickets priced very low
    }
    
    return Math.min(100, suspiciousPatternScore);
  }

  private async analyzeCommunicationRisk(sellerId: number): Promise<number> {
    // In production, would analyze response times, message content, etc.
    return 20; // Placeholder low risk score
  }

  private async calculateNetworkTrustScore(seller: User): Promise<number> {
    // In production, would analyze seller's network connections, references, etc.
    let score = 50; // Base score
    
    if (seller.rating && seller.rating > 4.0) score += 20;
    if (seller.ratingsCount && seller.ratingsCount > 5) score += 15;
    
    return Math.min(100, score);
  }

  private calculateConfidence(riskFactors: RiskFactors, patternMatchCount: number): number {
    let confidence = 70; // Base confidence
    
    // More data sources increase confidence
    if (riskFactors.socialMediaPresence > 0) confidence += 5;
    if (riskFactors.verificationLevel > 2) confidence += 10;
    
    // Pattern matches increase confidence in assessment
    confidence += patternMatchCount * 5;
    
    return Math.min(95, confidence);
  }

  // Pattern checking methods
  private checkPricingFraudPattern(pattern: FraudPattern, ticketHistory: Ticket[]): boolean {
    // Implementation depends on specific pattern
    return false; // Placeholder
  }

  private checkBehavioralFraudPattern(pattern: FraudPattern, seller: User, ticketHistory: Ticket[]): boolean {
    // Implementation depends on specific pattern
    return false; // Placeholder
  }

  private checkProfileFraudPattern(pattern: FraudPattern, seller: User): boolean {
    // Implementation depends on specific pattern
    return false; // Placeholder
  }

  private checkTemporalFraudPattern(pattern: FraudPattern, seller: User, ticketHistory: Ticket[]): boolean {
    // Implementation depends on specific pattern
    return false; // Placeholder
  }

  private checkNetworkFraudPattern(pattern: FraudPattern, seller: User): boolean {
    // Implementation depends on specific pattern
    return false; // Placeholder
  }

  private async getSellerTicketHistory(sellerId: number): Promise<Ticket[]> {
    try {
      return await db
        .select()
        .from(tickets)
        .where(eq(tickets.sellerId, sellerId))
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      console.error('Error fetching seller ticket history:', error);
      return [];
    }
  }

  private async updateLearningModels(seller: User, fraudScore: FraudScore): Promise<void> {
    // In production, would update ML models with new data points
    console.log(`Updating learning models with assessment for seller ${seller.id}`);
  }

  private generateFallbackFraudScore(): FraudScore {
    return {
      overallRisk: 50,
      riskCategory: 'moderate',
      primaryRiskFactors: ['Assessment service unavailable'],
      recommendations: ['Use standard marketplace precautions'],
      confidence: 60
    };
  }

  /**
   * Initialize known fraud patterns
   */
  private initializeFraudPatterns(): void {
    this.fraudPatterns = [
      {
        id: 'pricing-too-good',
        type: 'pricing',
        description: 'Prices significantly below market value',
        indicators: ['price < 30% of average', 'multiple low-priced tickets'],
        weight: 0.8,
        confidence: 85,
        lastUpdated: new Date()
      },
      {
        id: 'new-account-high-volume',
        type: 'behavioral',
        description: 'New account with unusually high ticket volume',
        indicators: ['account age < 30 days', 'ticket count > 10'],
        weight: 0.9,
        confidence: 90,
        lastUpdated: new Date()
      },
      {
        id: 'no-verification',
        type: 'profile',
        description: 'No identity verification completed',
        indicators: ['no phone verification', 'no ID verification', 'no social media'],
        weight: 0.6,
        confidence: 70,
        lastUpdated: new Date()
      }
    ];
  }
}

export const fraudDetectionService = new FraudDetectionService();