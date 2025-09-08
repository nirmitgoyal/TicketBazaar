/**
 * Unified Validation Utility
 * Provides consistent validation patterns and error handling
 * Part of Phase 3: Shared Code Optimization
 */

import { z, ZodError, ZodSchema } from 'zod';
import { 
  ApiError, 
  ValidationError,
  EventCategory,
  TicketStatus,
  UserStatus,
  VerificationStatus,
  CountryCode 
} from './unified-types';

// Common validation schemas
export const commonSchemas = {
  // ID validations
  id: z.coerce.number().int().positive('Invalid ID'),
  userId: z.coerce.number().int().positive('Invalid user ID'),
  ticketId: z.coerce.number().int().positive('Invalid ticket ID'),
  
  // String validations
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
  instagram: z.string().regex(/^@?[\w.]+$/, 'Invalid Instagram username').optional(),
  
  // Common fields
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000, 'Description too long'),
  
  // Dates
  date: z.string().datetime().or(z.date()),
  futureDate: z.string().datetime().or(z.date()).refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  ),
  
  // Enums
  category: z.enum(['concerts', 'sports', 'theater', 'comedy', 'festivals', 'conferences', 'exhibitions', 'movies', 'dance', 'opera', 'classical', 'family', 'nightlife', 'education', 'networking', 'fitness', 'accommodation', 'others'] as const),
  ticketStatus: z.enum(['available', 'sold', 'expired', 'cancelled'] as const),
  userStatus: z.enum(['active', 'suspended', 'banned', 'deleted'] as const),
  verificationStatus: z.enum(['unverified', 'pending', 'verified'] as const),
  contactMethod: z.enum(['email', 'phone', 'whatsapp'] as const),
  
  // Numbers
  price: z.number().positive('Price must be positive').finite(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  trustScore: z.number().min(0).max(100),
  responseRate: z.number().min(0).max(100),
  
  // Location
  country: z.string().length(2, 'Country code must be 2 characters'),
  city: z.string().min(2, 'City name too short'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
};

// Validation utilities
export class ValidationUtil {
  /**
   * Validate data against a schema with proper error handling
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Validation failed', this.formatZodErrors(error));
      }
      throw error;
    }
  }

  /**
   * Safe validation that returns result instead of throwing
   */
  static safeValidate<T>(schema: ZodSchema<T>, data: unknown): { 
    success: true; 
    data: T; 
  } | { 
    success: false; 
    errors: any; 
  } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, errors: this.formatZodErrors(result.error) };
  }

  /**
   * Format Zod errors for better readability
   */
  static formatZodErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(err.message);
    });
    
    return formatted;
  }

  /**
   * Create a validation middleware for Express
   */
  static middleware<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
    return (req: any, res: any, next: any) => {
      try {
        const validated = this.validate(schema, req[source]);
        req[source] = validated;
        next();
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
          });
        } else {
          next(error);
        }
      }
    };
  }
}

// Pre-built validation schemas for common entities
export const entitySchemas = {
  // User schemas
  userRegistration: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    fullName: commonSchemas.fullName,
    phone: commonSchemas.phone.optional(),
    country: commonSchemas.country.default('IN'),
    language: z.string().default('en'),
    timezone: z.string().default('Asia/Kolkata')
  }),

  userLogin: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  }),

  userUpdate: z.object({
    fullName: commonSchemas.fullName.optional(),
    phone: commonSchemas.phone.optional(),
    whatsapp: commonSchemas.phone.optional(),
    instagram: commonSchemas.instagram,
    preferredContactMethod: commonSchemas.contactMethod.optional(),
    country: commonSchemas.country.optional(),
    timezone: z.string().optional(),
    language: z.string().optional()
  }),

  // Ticket schemas
  ticketCreate: z.object({
    title: commonSchemas.title,
    eventTitle: commonSchemas.title,
    eventDescription: commonSchemas.description.optional(),
    venue: z.string().min(2),
    venueAddress: z.string().optional(),
    eventDate: commonSchemas.futureDate,
    category: commonSchemas.category,
    eventImageUrl: z.string().url().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: commonSchemas.city,
    country: commonSchemas.country.default('IN'),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    section: z.string().optional(),
    row: z.string().optional(),
    seat: z.string().optional(),
    quantity: commonSchemas.quantity,
    transferMethod: z.string(),
    additionalInfo: z.string().optional(),
    isTransferrable: z.boolean().default(true),
    showContactInfo: z.boolean().default(false),
    eventTimezone: z.string().default('Asia/Kolkata'),
    ageRestriction: z.string().optional()
  }),

  ticketUpdate: z.object({
    title: commonSchemas.title.optional(),
    quantity: commonSchemas.quantity.optional(),
    status: commonSchemas.ticketStatus.optional(),
    additionalInfo: z.string().optional(),
    showContactInfo: z.boolean().optional()
  }),

  // Filter schemas
  ticketFilter: z.object({
    search: z.string().optional(),
    category: commonSchemas.category.optional(),
    city: z.string().optional(),
    country: commonSchemas.country.optional(),
    minDate: z.string().datetime().optional(),
    maxDate: z.string().datetime().optional(),
    status: commonSchemas.ticketStatus.optional(),
    trending: z.boolean().optional(),
    sellingFast: z.boolean().optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }),

  // Contact request
  contactRequest: z.object({
    ticketId: commonSchemas.ticketId,
    message: z.string().min(10, 'Message too short').max(500, 'Message too long')
  }),

  // Verification
  verificationCode: z.object({
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers')
  })
};

// Validation decorators for TypeScript (experimental)
export function Validate(schema: ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const [req] = args;
      try {
        req.body = ValidationUtil.validate(schema, req.body);
        return await originalMethod.apply(this, args);
      } catch (error) {
        const [, res] = args;
        if (error instanceof ValidationError && res) {
          return res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
          });
        }
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Helper functions for common validations
export const validators = {
  isValidEmail: (email: string): boolean => {
    return commonSchemas.email.safeParse(email).success;
  },

  isValidPhone: (phone: string): boolean => {
    return commonSchemas.phone.safeParse(phone).success;
  },

  isValidId: (id: any): boolean => {
    return commonSchemas.id.safeParse(id).success;
  },

  isValidDate: (date: any): boolean => {
    return commonSchemas.date.safeParse(date).success;
  },

  isFutureDate: (date: any): boolean => {
    return commonSchemas.futureDate.safeParse(date).success;
  },

  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  }
};