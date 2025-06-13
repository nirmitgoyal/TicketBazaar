/**
 * Centralized type definitions for better code organization
 * This file consolidates all server-side types for improved maintainability
 */

import type { Request, Response, NextFunction } from 'express';
import type { 
  User, 
  Ticket, 
  ContactRequest, 
  UserReview, 
  TicketView,
  InsertUser,
  InsertTicket,
  InsertContactRequest,
  InsertUserReview,
  InsertTicketView
} from '../../shared/schema';

// Request handler types
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export type ErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

// Database operation result types
export type DatabaseResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Search and filter types
export type SearchFilters = {
  category?: string;
  location?: string;
  date?: Date;
  trending?: boolean;
  sellingFast?: boolean;
  dateRange?: string;
  city?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

export type SortOptions = {
  field: string;
  direction: 'asc' | 'desc';
};

// Venue and seating types
export type SeatSection = {
  id: string;
  name: string;
  popularity: number;
  availableTickets: number;
  totalTickets: number;
};

export type VenueMap = {
  eventId: number;
  sections: SeatSection[];
};

// Verification types
export type VerificationResult = {
  isVerified: boolean;
  trustScore: number;
  warnings: string[];
  recommendations: string[];
};

// Export all schema types
export type {
  User,
  Ticket,
  ContactRequest,
  UserReview,
  TicketView,
  InsertUser,
  InsertTicket,
  InsertContactRequest,
  InsertUserReview,
  InsertTicketView
};