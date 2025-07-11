/**
 * User entity types and interfaces
 */

import { BaseFilter } from '../core/api-types';
import { UserId } from '../core/branded-types';
import { UserStatus, VerificationStatus } from '../core/status-types';
import { CountryCode } from '../core/api-types';

export interface User {
  id: UserId;
  password?: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  googleId?: string;
  profilePicture?: string;
  preferredContactMethod: 'email' | 'whatsapp' | 'phone';
  country: CountryCode;
  timezone: string;
  language: string;
  verificationStatus: VerificationStatus;
  governmentIdVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
  trustScore: number;
  verificationLevel: number;
  responseRate: number;
  avgResponseTime: number;
  lastLogin?: Date;
  accountFlags: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserFilter extends BaseFilter {
  status?: UserStatus;
  verificationStatus?: VerificationStatus;
  country?: CountryCode;
  hasInstagram?: boolean;
  minTrustScore?: number;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  country?: CountryCode;
  timezone?: string;
  language?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: UserId;
}