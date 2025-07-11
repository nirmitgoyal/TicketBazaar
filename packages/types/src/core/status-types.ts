/**
 * Common status types used across the application
 */

// Common status types
export type TicketStatus = 'available' | 'sold' | 'expired' | 'cancelled';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';