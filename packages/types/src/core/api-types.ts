/**
 * Common API response types and interfaces
 */

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

// Common filter types
export interface BaseFilter {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Country codes (ISO 3166-1 alpha-2)
export type CountryCode = 'US' | 'IN' | 'GB' | 'CA' | 'AU' | string;

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

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';