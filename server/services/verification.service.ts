import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";
import crypto from "crypto";

export interface VerificationRequest {
  userId: number;
  verificationType: 'government_id' | 'phone' | 'email' | 'biometric' | 'address';
  documentType?: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill';
  documentData?: {
    documentNumber?: string;
    expiryDate?: Date;
    issueDate?: Date;
    issuingAuthority?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    selfieImageUrl?: string;
  };
  phoneData?: {
    phoneNumber: string;
    verificationCode?: string;
  };
  emailData?: {
    email: string;
    verificationCode?: string;
  };
  biometricData?: {
    faceImageUrl: string;
    livenessScore?: number;
  };
  addressData?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    documentImageUrl?: string;
  };
}

export interface VerificationResult {
  success: boolean;
  verificationId: string;
  confidence: number; // 0-100
  status: 'pending' | 'approved' | 'rejected' | 'requires_manual_review';
  riskFlags: string[];
  extractedData?: any;
  verificationLevel: number; // 1-4 (Bronze, Silver, Gold, Platinum)
  recommendations: string[];
}

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number;
  extractedText: any;
  securityFeatures: {
    hologram: boolean;
    watermark: boolean;
    microtext: boolean;
    uvFeatures: boolean;
  };
  tampering: {
    detected: boolean;
    confidence: number;
    anomalies: string[];
  };
}

export class VerificationService {
  private static instance: VerificationService;

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Process verification request
   */
  async processVerificationRequest(request: VerificationRequest): Promise<VerificationResult> {
    try {
      const verificationId = this.generateVerificationId();
      logger.info('VERIFICATION', `Processing ${request.verificationType} verification`, {
        userId: request.userId,
        verificationId
      });

      let result: VerificationResult;

      switch (request.verificationType) {
        case 'government_id':
          result = await this.verifyGovernmentId(request, verificationId);
          break;
        case 'phone':
          result = await this.verifyPhone(request, verificationId);
          break;
        case 'email':
          result = await this.verifyEmail(request, verificationId);
          break;
        case 'biometric':
          result = await this.verifyBiometric(request, verificationId);
          break;
        case 'address':
          result = await this.verifyAddress(request, verificationId);
          break;
        default:
          throw new Error(`Unsupported verification type: ${request.verificationType}`);
      }

      // Update user verification status if successful
      if (result.success && result.status === 'approved') {
        await this.updateUserVerificationStatus(request.userId, request.verificationType, result);
      }

      // Log verification result
      logger.info('VERIFICATION', `Verification ${result.success ? 'successful' : 'failed'}`, {
        userId: request.userId,
        verificationId,
        type: request.verificationType,
        confidence: result.confidence,
        status: result.status
      });

      return result;
    } catch (error) {
      logger.error('VERIFICATION', 'Error processing verification request', {
        error,
        userId: request.userId,
        type: request.verificationType
      });
      throw error;
    }
  }

  /**
   * Verify government-issued ID document
   */
  private async verifyGovernmentId(
    request: VerificationRequest,
    verificationId: string
  ): Promise<VerificationResult> {
    const { documentData, userId } = request;
    if (!documentData) {
      throw new Error('Document data is required for government ID verification');
    }

    const riskFlags: string[] = [];
    let confidence = 0;

    // Document analysis
    const docAnalysis = await this.analyzeDocument(documentData);
    confidence += docAnalysis.confidence * 0.4;

    if (!docAnalysis.isValid) {
      riskFlags.push('Invalid document detected');
    }

    // Biometric verification (face match between selfie and ID photo)
    if (documentData.selfieImageUrl) {
      const biometricMatch = await this.compareFaces(
        documentData.frontImageUrl!,
        documentData.selfieImageUrl
      );
      confidence += biometricMatch.confidence * 0.4;

      if (biometricMatch.confidence < 70) {
        riskFlags.push('Low face match confidence');
      }
    }

    // Document security features check
    const securityCheck = await this.checkDocumentSecurity(documentData);
    confidence += securityCheck.confidence * 0.2;

    if (securityCheck.tampering.detected) {
      riskFlags.push('Document tampering detected');
    }

    // Determine status
    let status: 'pending' | 'approved' | 'rejected' | 'requires_manual_review';
    if (confidence >= 85 && riskFlags.length === 0) {
      status = 'approved';
    } else if (confidence < 50 || riskFlags.includes('Invalid document detected')) {
      status = 'rejected';
    } else {
      status = 'requires_manual_review';
    }

    const verificationLevel = this.calculateVerificationLevel(confidence, riskFlags);

    return {
      success: status === 'approved',
      verificationId,
      confidence,
      status,
      riskFlags,
      extractedData: docAnalysis.extractedText,
      verificationLevel,
      recommendations: this.generateRecommendations(status, riskFlags, confidence)
    };
  }

  /**
   * Verify phone number with SMS verification
   */
  private async verifyPhone(
    request: VerificationRequest,
    verificationId: string
  ): Promise<VerificationResult> {
    const { phoneData } = request;
    if (!phoneData) {
      throw new Error('Phone data is required for phone verification');
    }

    // Generate and send verification code (in production, integrate with SMS service)
    const verificationCode = this.generateVerificationCode();
    
    // For demo purposes, we'll simulate SMS sending
    const smsSent = await this.sendSMSVerificationCode(phoneData.phoneNumber, verificationCode);
    
    if (!smsSent) {
      return {
        success: false,
        verificationId,
        confidence: 0,
        status: 'rejected',
        riskFlags: ['SMS delivery failed'],
        verificationLevel: 0,
        recommendations: ['Please check phone number and try again']
      };
    }

    // Check if provided code matches (if code was provided)
    let confidence = 60; // Base confidence for phone number format validation
    const riskFlags: string[] = [];

    if (phoneData.verificationCode) {
      const codeMatch = phoneData.verificationCode === verificationCode;
      if (codeMatch) {
        confidence = 95;
      } else {
        confidence = 0;
        riskFlags.push('Invalid verification code');
      }
    }

    const status = confidence >= 95 ? 'approved' : 'pending';

    return {
      success: status === 'approved',
      verificationId,
      confidence,
      status,
      riskFlags,
      verificationLevel: status === 'approved' ? 2 : 1,
      recommendations: status === 'pending' 
        ? ['Please enter the verification code sent to your phone']
        : ['Phone verification completed successfully']
    };
  }

  /**
   * Verify email address
   */
  private async verifyEmail(
    request: VerificationRequest,
    verificationId: string
  ): Promise<VerificationResult> {
    const { emailData } = request;
    if (!emailData) {
      throw new Error('Email data is required for email verification');
    }

    // Generate and send verification code
    const verificationCode = this.generateVerificationCode();
    const emailSent = await this.sendEmailVerificationCode(emailData.email, verificationCode);

    if (!emailSent) {
      return {
        success: false,
        verificationId,
        confidence: 0,
        status: 'rejected',
        riskFlags: ['Email delivery failed'],
        verificationLevel: 0,
        recommendations: ['Please check email address and try again']
      };
    }

    let confidence = 60; // Base confidence for email format validation
    const riskFlags: string[] = [];

    if (emailData.verificationCode) {
      const codeMatch = emailData.verificationCode === verificationCode;
      if (codeMatch) {
        confidence = 95;
      } else {
        confidence = 0;
        riskFlags.push('Invalid verification code');
      }
    }

    const status = confidence >= 95 ? 'approved' : 'pending';

    return {
      success: status === 'approved',
      verificationId,
      confidence,
      status,
      riskFlags,
      verificationLevel: status === 'approved' ? 1 : 0,
      recommendations: status === 'pending'
        ? ['Please enter the verification code sent to your email']
        : ['Email verification completed successfully']
    };
  }

  /**
   * Verify biometric (face recognition and liveness detection)
   */
  private async verifyBiometric(
    request: VerificationRequest,
    verificationId: string
  ): Promise<VerificationResult> {
    const { biometricData } = request;
    if (!biometricData) {
      throw new Error('Biometric data is required for biometric verification');
    }

    const riskFlags: string[] = [];
    let confidence = 0;

    // Liveness detection
    const livenessResult = await this.detectLiveness(biometricData.faceImageUrl);
    confidence += livenessResult.confidence * 0.6;

    if (livenessResult.confidence < 70) {
      riskFlags.push('Low liveness confidence - possible photo/video replay');
    }

    // Face quality assessment
    const qualityAssessment = await this.assessFaceQuality(biometricData.faceImageUrl);
    confidence += qualityAssessment.confidence * 0.4;

    if (qualityAssessment.confidence < 60) {
      riskFlags.push('Poor image quality detected');
    }

    const status = confidence >= 80 && riskFlags.length === 0 ? 'approved' : 'requires_manual_review';

    return {
      success: status === 'approved',
      verificationId,
      confidence,
      status,
      riskFlags,
      verificationLevel: this.calculateVerificationLevel(confidence, riskFlags),
      recommendations: this.generateRecommendations(status, riskFlags, confidence)
    };
  }

  /**
   * Verify address with proof of residence
   */
  private async verifyAddress(
    request: VerificationRequest,
    verificationId: string
  ): Promise<VerificationResult> {
    const { addressData } = request;
    if (!addressData) {
      throw new Error('Address data is required for address verification');
    }

    const riskFlags: string[] = [];
    let confidence = 50; // Base confidence for address format

    // Address validation
    const addressValid = await this.validateAddress(addressData);
    if (addressValid) {
      confidence += 30;
    } else {
      riskFlags.push('Address could not be validated');
    }

    // Document verification (utility bill, bank statement, etc.)
    if (addressData.documentImageUrl) {
      const docVerification = await this.verifyProofOfAddress(addressData);
      confidence += docVerification.confidence * 0.2;

      if (!docVerification.isValid) {
        riskFlags.push('Invalid proof of address document');
      }
    }

    const status = confidence >= 75 && riskFlags.length === 0 ? 'approved' : 'requires_manual_review';

    return {
      success: status === 'approved',
      verificationId,
      confidence,
      status,
      riskFlags,
      verificationLevel: this.calculateVerificationLevel(confidence, riskFlags),
      recommendations: this.generateRecommendations(status, riskFlags, confidence)
    };
  }

  /**
   * Update user verification status in database
   */
  private async updateUserVerificationStatus(
    userId: number,
    verificationType: string,
    result: VerificationResult
  ): Promise<void> {
    try {
      const updateData: any = {};

      switch (verificationType) {
        case 'government_id':
          updateData.governmentIdVerified = true;
          updateData.verificationStatus = 'verified';
          break;
        case 'phone':
          updateData.phoneVerified = true;
          break;
        case 'email':
          updateData.emailVerified = true;
          break;
      }

      await db.update(users).set(updateData).where(eq(users.id, userId));

      logger.info('VERIFICATION', 'User verification status updated', {
        userId,
        verificationType,
        updateData
      });
    } catch (error) {
      logger.error('VERIFICATION', 'Error updating user verification status', {
        error,
        userId,
        verificationType
      });
      throw error;
    }
  }

  /**
   * Helper methods for document analysis (would integrate with external services in production)
   */
  private async analyzeDocument(documentData: any): Promise<DocumentVerificationResult> {
    // Simulate document analysis (in production, use services like AWS Textract, Google Document AI)
    const mockConfidence = Math.random() * 30 + 70; // 70-100% confidence
    
    return {
      isValid: mockConfidence > 75,
      confidence: mockConfidence,
      extractedText: {
        documentNumber: documentData.documentNumber || 'EXTRACTED_123456',
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        expiryDate: documentData.expiryDate
      },
      securityFeatures: {
        hologram: true,
        watermark: true,
        microtext: true,
        uvFeatures: Math.random() > 0.3
      },
      tampering: {
        detected: Math.random() < 0.1,
        confidence: Math.random() * 100,
        anomalies: Math.random() < 0.1 ? ['Edge inconsistency detected'] : []
      }
    };
  }

  private async compareFaces(idImageUrl: string, selfieImageUrl: string): Promise<{ confidence: number }> {
    // Simulate face comparison (in production, use AWS Rekognition, Azure Face API, etc.)
    const confidence = Math.random() * 20 + 80; // 80-100% confidence
    return { confidence };
  }

  private async checkDocumentSecurity(documentData: any): Promise<any> {
    // Simulate security feature detection
    return {
      confidence: Math.random() * 20 + 80,
      tampering: {
        detected: Math.random() < 0.05,
        confidence: Math.random() * 100,
        anomalies: []
      }
    };
  }

  private async detectLiveness(faceImageUrl: string): Promise<{ confidence: number }> {
    // Simulate liveness detection
    const confidence = Math.random() * 25 + 75; // 75-100% confidence
    return { confidence };
  }

  private async assessFaceQuality(faceImageUrl: string): Promise<{ confidence: number }> {
    // Simulate face quality assessment
    const confidence = Math.random() * 30 + 70; // 70-100% confidence
    return { confidence };
  }

  private async validateAddress(addressData: any): Promise<boolean> {
    // Simulate address validation (in production, use Google Places API, SmartyStreets, etc.)
    return Math.random() > 0.2; // 80% success rate
  }

  private async verifyProofOfAddress(addressData: any): Promise<{ isValid: boolean; confidence: number }> {
    // Simulate proof of address verification
    const confidence = Math.random() * 30 + 70;
    return {
      isValid: confidence > 75,
      confidence
    };
  }

  private async sendSMSVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    // Simulate SMS sending (in production, integrate with Twilio, AWS SNS, etc.)
    logger.info('VERIFICATION', `SMS verification code would be sent to ${phoneNumber}: ${code}`);
    return Math.random() > 0.05; // 95% success rate
  }

  private async sendEmailVerificationCode(email: string, code: string): Promise<boolean> {
    // Simulate email sending (in production, integrate with SendGrid, AWS SES, etc.)
    logger.info('VERIFICATION', `Email verification code would be sent to ${email}: ${code}`);
    return Math.random() > 0.02; // 98% success rate
  }

  private generateVerificationId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private calculateVerificationLevel(confidence: number, riskFlags: string[]): number {
    if (confidence >= 90 && riskFlags.length === 0) return 4; // Platinum
    if (confidence >= 80 && riskFlags.length <= 1) return 3; // Gold
    if (confidence >= 70 && riskFlags.length <= 2) return 2; // Silver
    if (confidence >= 60) return 1; // Bronze
    return 0; // Unverified
  }

  private generateRecommendations(
    status: string,
    riskFlags: string[],
    confidence: number
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'rejected') {
      recommendations.push('Verification failed. Please submit new documents');
      if (riskFlags.includes('Invalid document detected')) {
        recommendations.push('Ensure document is clear, unobstructed, and valid');
      }
    } else if (status === 'requires_manual_review') {
      recommendations.push('Additional review required');
      if (confidence < 70) {
        recommendations.push('Consider resubmitting with higher quality images');
      }
    } else if (status === 'approved') {
      recommendations.push('Verification completed successfully');
      recommendations.push('Your account security level has been upgraded');
    }

    return recommendations;
  }
}

export const verificationService = VerificationService.getInstance();