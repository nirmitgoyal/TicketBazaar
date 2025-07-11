/**
 * Ticket entity types and interfaces
 */

import { BaseFilter, EventCategory, CountryCode } from '../core/api-types';
import { TicketId, UserId, EventId } from '../core/branded-types';
import { TicketStatus } from '../core/status-types';

export interface Ticket {
  id: TicketId;
  userId: UserId;
  eventId?: EventId;
  title: string;
  description: string;
  category: EventCategory;
  eventDate: Date;
  eventTime: string;
  venue: string;
  city: string;
  country: CountryCode;
  originalPrice: number;
  sellingPrice: number;
  currency: string;
  quantity: number;
  availableQuantity: number;
  status: TicketStatus;
  images: string[];
  tags: string[];
  isHighlighted: boolean;
  priority: number;
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
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
  minPrice?: number;
  maxPrice?: number;
  userId?: UserId;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: EventCategory;
  eventDate: Date;
  eventTime: string;
  venue: string;
  city: string;
  country: CountryCode;
  originalPrice: number;
  sellingPrice: number;
  currency: string;
  quantity: number;
  images?: string[];
  tags?: string[];
}

export interface UpdateTicketRequest extends Partial<CreateTicketRequest> {
  id: TicketId;
}