/**
 * Unified Type System
 * Consolidates common types and provides better type inference utilities
 * Part of Phase 3: Shared Code Optimization
 */

import { z } from 'zod';
import type { SQL } from 'drizzle-orm';

// Branded types for better type safety
export type UserId = number & { __brand: 'UserId' };
export type TicketId = number & { __brand: 'TicketId' };
export type EventId = number & { __brand: 'EventId' };
export type TransactionId = number & { __brand: 'TransactionId' };

// Type branding utilities
export const createUserId = (id: number): UserId => id as UserId;
export const createTicketId = (id: number): TicketId => id as TicketId;
export const createEventId = (id: number): EventId => id as EventId;
export const createTransactionId = (id: number): TransactionId => id as TransactionId;

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp?: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common status types
export type TicketStatus = 'available' | 'sold' | 'expired' | 'cancelled';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Contact methods
export type ContactMethod = 'email' | 'phone' | 'whatsapp';

// Event categories
export type EventCategory = 
  | 'Concerts'
  | 'Sports'
  | 'Theater'
  | 'Comedy'
  | 'Festival'
  | 'Conference'
  | 'Other';

// Country codes (ISO 3166-1 alpha-2)
export type CountryCode = 'US' | 'IN' | 'GB' | 'CA' | 'AU' | string;

// Common filter types
export interface BaseFilter {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketFilter extends BaseFilter {
  category?: EventCategory;
  city?: string;
  country?: CountryCode;
  minDate?: Date | string;
  maxDate?: Date | string;
  status?: TicketStatus;
  trending?: boolean;
  sellingFast?: boolean;
}

export interface UserFilter extends BaseFilter {
  status?: UserStatus;
  verificationStatus?: VerificationStatus;
  country?: CountryCode;
  hasInstagram?: boolean;
  minTrustScore?: number;
}

// Common Zod schemas for validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const dateRangeSchema = z.object({
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional()
}).refine(
  (data) => {
    if (data.minDate && data.maxDate) {
      return new Date(data.minDate) <= new Date(data.maxDate);
    }
    return true;
  },
  { message: 'minDate must be before maxDate' }
);

// Type inference utilities
export type InferInsert<T> = T extends { $inferInsert: infer I } ? I : never;
export type InferSelect<T> = T extends { $inferSelect: infer S } ? S : never;

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybePromise<T> = T | Promise<T>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors: any) {
    super(400, message, errors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

// Type guards
export const isUserId = (value: any): value is UserId => {
  return typeof value === 'number' && value > 0;
};

export const isTicketId = (value: any): value is TicketId => {
  return typeof value === 'number' && value > 0;
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

// Common interfaces for services
export interface IService {
  readonly name: string;
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface ICacheService extends IService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
}

export interface IEmailService extends IService {
  send(to: string, subject: string, content: string): Promise<boolean>;
  sendTemplate(to: string, templateId: string, data: any): Promise<boolean>;
}

// Database query helpers
export type WhereCondition<T> = Partial<T> | SQL;
export type OrderByCondition = SQL | { column: string; direction: 'asc' | 'desc' };

// Event emitter types
export type EventMap = {
  'ticket:created': { ticketId: TicketId; userId: UserId };
  'ticket:updated': { ticketId: TicketId; changes: any };
  'ticket:deleted': { ticketId: TicketId };
  'user:registered': { userId: UserId; email: string };
  'user:verified': { userId: UserId; type: 'email' | 'phone' };
  'transaction:created': { transactionId: TransactionId; buyerId: UserId; sellerId: UserId };
};

export type EventKey = keyof EventMap;
export type EventData<K extends EventKey> = EventMap[K];

// React component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface AsyncComponentProps extends BaseComponentProps {
  loading?: boolean;
  error?: Error | null;
  retry?: () => void;
}

// Form field types
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  value?: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: T }>;
  validation?: z.ZodSchema<T>;
}