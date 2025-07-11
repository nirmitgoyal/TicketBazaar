/**
 * Event entity types and interfaces
 */

import { EventId } from '../core/branded-types';
import { EventCategory, CountryCode } from '../core/api-types';

export interface Event {
  id: EventId;
  title: string;
  description: string;
  category: EventCategory;
  date: Date;
  time: string;
  venue: string;
  city: string;
  country: CountryCode;
  images: string[];
  tags: string[];
  isPopular: boolean;
  totalTickets: number;
  availableTickets: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: EventCategory;
  date: Date;
  time: string;
  venue: string;
  city: string;
  country: CountryCode;
  images?: string[];
  tags?: string[];
}