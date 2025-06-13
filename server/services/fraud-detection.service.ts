import { db } from "../db";
import { users, tickets, contactRequests, userReviews } from "../../shared/schema";
import { eq, and, gt, lt, desc, sql, count } from "drizzle-orm";
import { logger } from "../utils/logger";

export interface FraudRiskAssessment {
  riskScore: number; // 0-100 (100 = highest risk)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  recommendations: string[];
  requiresManualReview: boolean;
  blockedActions: string[];
}

export interface UserRiskProfile {
  userId: number;
  totalRiskScore: number;
  recentActivity: any[];
  verificationStatus: string;
  trustMetrics: {
    accountAge: number;
    verificationLevel: number;
    reviewScore: number;
    transactionHistory: number;
  };
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  /**
   * Assess fraud risk for a new ticket listing
   */
  async assessTicketListingRisk(
    sellerId: number,
    ticketData: any
  ): Promise<FraudRiskAssessment> {
    try {
      const userProfile = await this.getUserRiskProfile(sellerId);
      const riskFactors: string[] = [];
      let riskScore = 0;

      // User-based risk factors
      const userRisk = await this.assessUserRisk(userProfile);
      riskScore += userRisk.score;
      riskFactors.push(...userRisk.factors);

      // Ticket-specific risk factors
      const ticketRisk = await this.assessTicketRisk(ticketData, sellerId);
      riskScore += ticketRisk.score;
      riskFactors.push(...ticketRisk.factors);

      // Behavioral risk factors
      const behaviorRisk = await this.assessBehavioralRisk(sellerId);
      riskScore += behaviorRisk.score;
      riskFactors.push(...behaviorRisk.factors);

      // Price manipulation detection
      const priceRisk = await this.assessPriceManipulationRisk(ticketData);
      riskScore += priceRisk.score;
      riskFactors.push(...priceRisk.factors);

      const assessment = this.generateRiskAssessment(riskScore, riskFactors);
      
      // Log high-risk activities
      if (assessment.riskLevel === 'HIGH' || assessment.riskLevel === 'CRITICAL') {
        logger.warn('FRAUD_DETECTION', `High risk ticket listing detected`, {
          sellerId,
          riskScore,
          riskLevel: assessment.riskLevel,
          factors: riskFactors
        });
      }

      return assessment;
    } catch (error) {
      logger.error('FRAUD_DETECTION', 'Error assessing ticket listing risk', { error, sellerId });
      throw error;
    }
  }

  /**
   * Assess fraud risk for a contact request
   */
  async assessContactRequestRisk(
    requesterId: number,
    ticketId: number,
    message: string
  ): Promise<FraudRiskAssessment> {
    try {
      const userProfile = await this.getUserRiskProfile(requesterId);
      const riskFactors: string[] = [];
      let riskScore = 0;

      // User-based risk
      const userRisk = await this.assessUserRisk(userProfile);
      riskScore += userRisk.score;
      riskFactors.push(...userRisk.factors);

      // Message analysis
      const messageRisk = this.assessMessageRisk(message);
      riskScore += messageRisk.score;
      riskFactors.push(...messageRisk.factors);

      // Rapid-fire request detection
      const rapidFireRisk = await this.assessRapidFireRequests(requesterId);
      riskScore += rapidFireRisk.score;
      riskFactors.push(...rapidFireRisk.factors);

      return this.generateRiskAssessment(riskScore, riskFactors);
    } catch (error) {
      logger.error('FRAUD_DETECTION', 'Error assessing contact request risk', { error, requesterId, ticketId });
      throw error;
    }
  }

  /**
   * Get comprehensive user risk profile
   */
  async getUserRiskProfile(userId: number): Promise<UserRiskProfile> {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        throw new Error('User not found');
      }

      const userInfo = user[0];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get recent activity
      const recentTickets = await db
        .select()
        .from(tickets)
        .where(and(
          eq(tickets.sellerId, userId),
          gt(tickets.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(tickets.createdAt));

      const recentRequests = await db
        .select()
        .from(contactRequests)
        .where(and(
          eq(contactRequests.requesterId, userId),
          gt(contactRequests.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(contactRequests.createdAt));

      // Calculate trust metrics
      const accountAgeInDays = Math.floor(
        (now.getTime() - new Date(userInfo.id * 1000).getTime()) / (1000 * 60 * 60 * 24)
      );

      const verificationLevel = this.calculateVerificationLevel(userInfo);
      const reviewScore = userInfo.rating || 0;
      const transactionHistory = recentTickets.length + recentRequests.length;

      // Calculate total risk score
      const totalRiskScore = await this.calculateUserRiskScore(userInfo, {
        accountAge: accountAgeInDays,
        verificationLevel,
        reviewScore,
        transactionHistory
      });

      return {
        userId,
        totalRiskScore,
        recentActivity: [...recentTickets, ...recentRequests],
        verificationStatus: userInfo.verificationStatus,
        trustMetrics: {
          accountAge: accountAgeInDays,
          verificationLevel,
          reviewScore,
          transactionHistory
        }
      };
    } catch (error) {
      logger.error('FRAUD_DETECTION', 'Error getting user risk profile', { error, userId });
      throw error;
    }
  }

  /**
   * Assess user-based risk factors
   */
  private async assessUserRisk(userProfile: UserRiskProfile): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // New account risk
    if (userProfile.trustMetrics.accountAge < 7) {
      score += 25;
      factors.push('Account created within last 7 days');
    } else if (userProfile.trustMetrics.accountAge < 30) {
      score += 15;
      factors.push('Account created within last 30 days');
    }

    // Low verification risk
    if (userProfile.trustMetrics.verificationLevel < 2) {
      score += 20;
      factors.push('Low verification level');
    }

    // Poor review score
    if (userProfile.trustMetrics.reviewScore < 3 && userProfile.trustMetrics.reviewScore > 0) {
      score += 30;
      factors.push('Poor user rating');
    }

    // No verification at all
    if (userProfile.verificationStatus === 'unverified') {
      score += 15;
      factors.push('Unverified user account');
    }

    return { score, factors };
  }

  /**
   * Assess ticket-specific risk factors
   */
  private async assessTicketRisk(ticketData: any, sellerId: number): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // High-value ticket without verification
    if (ticketData.price > 500 && ticketData.showContactInfo === false) {
      score += 20;
      factors.push('High-value ticket without contact verification');
    }

    // Suspicious pricing (much higher than market rate)
    const avgPrice = await this.getAverageEventPrice(ticketData.eventTitle);
    if (avgPrice && ticketData.price > avgPrice * 2) {
      score += 25;
      factors.push('Price significantly above market rate');
    }

    // Last-minute listing for immediate events
    const eventDate = new Date(ticketData.eventDate);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      score += 15;
      factors.push('Last-minute listing for imminent event');
    }

    // Suspicious transfer method for high-value tickets
    if (ticketData.price > 300 && ticketData.transferMethod === 'in-person') {
      score += 10;
      factors.push('High-value ticket requires in-person transfer');
    }

    // Multiple tickets with same details (potential duplicates)
    const similarTickets = await this.findSimilarTickets(ticketData, sellerId);
    if (similarTickets.length > 0) {
      score += 20;
      factors.push('Similar tickets found from same seller');
    }

    return { score, factors };
  }

  /**
   * Assess behavioral risk patterns
   */
  private async assessBehavioralRisk(userId: number): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Rapid listing activity
    const recentListings = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(
        eq(tickets.sellerId, userId),
        gt(tickets.createdAt, oneDayAgo)
      ));

    if (recentListings[0]?.count > 5) {
      score += 25;
      factors.push('Excessive listing activity in 24 hours');
    }

    // Failed contact request pattern
    const failedRequests = await db
      .select({ count: count() })
      .from(contactRequests)
      .where(and(
        eq(contactRequests.sellerId, userId),
        eq(contactRequests.status, 'denied'),
        gt(contactRequests.createdAt, oneWeekAgo)
      ));

    if (failedRequests[0]?.count > 10) {
      score += 20;
      factors.push('High rate of denied contact requests');
    }

    return { score, factors };
  }

  /**
   * Assess price manipulation risk
   */
  private async assessPriceManipulationRisk(ticketData: any): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Check for round number pricing (often suspicious)
    if (ticketData.price % 100 === 0 && ticketData.price > 100) {
      score += 5;
      factors.push('Round number pricing pattern');
    }

    // Extremely low prices (potential fake listings)
    if (ticketData.price < 10) {
      score += 30;
      factors.push('Suspiciously low pricing');
    }

    // Check for price changes in similar events
    const priceVolatility = await this.calculatePriceVolatility(ticketData.eventTitle);
    if (priceVolatility > 0.5) {
      score += 15;
      factors.push('High price volatility in similar events');
    }

    return { score, factors };
  }

  /**
   * Assess message content for suspicious patterns
   */
  private assessMessageRisk(message: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Suspicious keywords
    const suspiciousKeywords = [
      'western union', 'money gram', 'bitcoin', 'cryptocurrency',
      'wire transfer', 'cashiers check', 'paypal friends',
      'urgent', 'asap', 'limited time', 'act fast'
    ];

    const lowerMessage = message.toLowerCase();
    const foundKeywords = suspiciousKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      score += foundKeywords.length * 10;
      factors.push(`Suspicious keywords detected: ${foundKeywords.join(', ')}`);
    }

    // Too short messages
    if (message.length < 10) {
      score += 5;
      factors.push('Very brief message');
    }

    // External links or contact info in message
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const phonePattern = /(\+?[\d\s\-\(\)]{10,})/g;
    const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

    if (urlPattern.test(message)) {
      score += 15;
      factors.push('External links in message');
    }

    if (phonePattern.test(message) || emailPattern.test(message)) {
      score += 10;
      factors.push('Contact information in message');
    }

    return { score, factors };
  }

  /**
   * Detect rapid-fire contact requests
   */
  private async assessRapidFireRequests(requesterId: number): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentRequests = await db
      .select({ count: count() })
      .from(contactRequests)
      .where(and(
        eq(contactRequests.requesterId, requesterId),
        gt(contactRequests.createdAt, oneHourAgo)
      ));

    const requestCount = recentRequests[0]?.count || 0;

    if (requestCount > 10) {
      score += 40;
      factors.push('Excessive contact requests in past hour');
    } else if (requestCount > 5) {
      score += 20;
      factors.push('High volume of contact requests');
    }

    return { score, factors };
  }

  /**
   * Generate final risk assessment
   */
  private generateRiskAssessment(riskScore: number, riskFactors: string[]): FraudRiskAssessment {
    // Cap risk score at 100
    const finalScore = Math.min(riskScore, 100);
    
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let requiresManualReview = false;
    const blockedActions: string[] = [];
    const recommendations: string[] = [];

    if (finalScore >= 80) {
      riskLevel = 'CRITICAL';
      requiresManualReview = true;
      blockedActions.push('listing_creation', 'contact_requests', 'high_value_transactions');
      recommendations.push('Account requires immediate manual review');
      recommendations.push('Temporarily suspend all activities');
    } else if (finalScore >= 60) {
      riskLevel = 'HIGH';
      requiresManualReview = true;
      blockedActions.push('high_value_transactions');
      recommendations.push('Enhanced verification required');
      recommendations.push('Manual review recommended');
    } else if (finalScore >= 30) {
      riskLevel = 'MEDIUM';
      recommendations.push('Additional verification recommended');
      recommendations.push('Monitor user activity closely');
    } else {
      riskLevel = 'LOW';
      recommendations.push('Standard verification sufficient');
    }

    return {
      riskScore: finalScore,
      riskLevel,
      riskFactors,
      recommendations,
      requiresManualReview,
      blockedActions
    };
  }

  /**
   * Helper methods
   */
  private calculateVerificationLevel(user: any): number {
    let level = 0;
    if (user.emailVerified) level++;
    if (user.phoneVerified) level++;
    if (user.governmentIdVerified) level++;
    if (user.verificationStatus === 'verified') level++;
    return level;
  }

  private async calculateUserRiskScore(user: any, metrics: any): Promise<number> {
    let score = 0;
    
    // Account age factor (newer = higher risk)
    if (metrics.accountAge < 7) score += 20;
    else if (metrics.accountAge < 30) score += 10;
    
    // Verification factor
    if (metrics.verificationLevel === 0) score += 25;
    else if (metrics.verificationLevel === 1) score += 15;
    else if (metrics.verificationLevel === 2) score += 5;
    
    // Review score factor
    if (metrics.reviewScore < 2) score += 20;
    else if (metrics.reviewScore < 3) score += 10;
    
    return score;
  }

  private async getAverageEventPrice(eventTitle: string): Promise<number | null> {
    try {
      const prices = await db
        .select({ price: tickets.price })
        .from(tickets)
        .where(eq(tickets.eventTitle, eventTitle));

      if (prices.length === 0) return null;
      
      const total = prices.reduce((sum, p) => sum + (p.price || 0), 0);
      return total / prices.length;
    } catch {
      return null;
    }
  }

  private async findSimilarTickets(ticketData: any, sellerId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(tickets)
        .where(and(
          eq(tickets.sellerId, sellerId),
          eq(tickets.eventTitle, ticketData.eventTitle),
          eq(tickets.section, ticketData.section || ''),
          eq(tickets.row, ticketData.row || '')
        ));
    } catch {
      return [];
    }
  }

  private async calculatePriceVolatility(eventTitle: string): Promise<number> {
    try {
      const prices = await db
        .select({ price: tickets.price })
        .from(tickets)
        .where(eq(tickets.eventTitle, eventTitle));

      if (prices.length < 2) return 0;

      const priceValues = prices.map(p => p.price || 0);
      const mean = priceValues.reduce((a, b) => a + b) / priceValues.length;
      const variance = priceValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / priceValues.length;
      const stdDev = Math.sqrt(variance);
      
      return mean > 0 ? stdDev / mean : 0;
    } catch {
      return 0;
    }
  }
}

export const fraudDetectionService = FraudDetectionService.getInstance();