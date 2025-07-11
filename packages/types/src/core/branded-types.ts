/**
 * Branded types for better type safety
 * These types prevent accidental mixing of IDs from different entities
 */

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