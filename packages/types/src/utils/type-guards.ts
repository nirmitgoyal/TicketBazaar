/**
 * Type guard utilities
 */

import { UserId, TicketId } from '../core/branded-types';
import { ApiError } from '../core/error-types';

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