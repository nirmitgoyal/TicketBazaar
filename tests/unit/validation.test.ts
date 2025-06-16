import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

// Mock schema for testing
const mockTicketSchema = z.object({
  title: z.string().min(1).max(200),
  eventTitle: z.string().min(1).max(300),
  venue: z.string().min(1).max(200),
  eventDate: z.date().min(new Date()),
  category: z.string().min(1),
  quantity: z.number().min(1).max(100),
  section: z.string().optional(),
  row: z.string().optional(),
  seat: z.string().optional(),
  transferMethod: z.string().min(1),
  additionalInfo: z.string().optional(),
  isTransferrable: z.boolean().default(true),
  showContactInfo: z.boolean().default(false)
});

const mockUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  country: z.string().length(2),
  timezone: z.string().default("UTC"),
  language: z.string().length(2).default("en")
});

describe('Data Validation', () => {
  describe('Ticket Validation', () => {
    it('should validate complete ticket data', () => {
      const validTicket = {
        title: 'Concert Tickets - Front Row',
        eventTitle: 'Taylor Swift Eras Tour',
        venue: 'Madison Square Garden',
        eventDate: new Date('2024-12-25'),
        category: 'Concert',
        quantity: 2,
        section: 'A',
        row: '1',
        seat: '1-2',
        transferMethod: 'Mobile Transfer',
        additionalInfo: 'Great seats with clear view',
        isTransferrable: true,
        showContactInfo: false
      };

      const result = mockTicketSchema.safeParse(validTicket);
      expect(result.success).toBe(true);
    });

    it('should reject ticket with missing required fields', () => {
      const invalidTicket = {
        title: '',
        eventTitle: 'Taylor Swift Eras Tour',
        venue: 'Madison Square Garden',
        eventDate: new Date('2024-12-25'),
        category: '',
        quantity: 2,
        transferMethod: 'Mobile Transfer'
      };

      const result = mockTicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('category'))).toBe(true);
      }
    });

    it('should reject ticket with invalid quantity', () => {
      const invalidTicket = {
        title: 'Concert Tickets',
        eventTitle: 'Taylor Swift Eras Tour',
        venue: 'Madison Square Garden',
        eventDate: new Date('2024-12-25'),
        category: 'Concert',
        quantity: 0,
        transferMethod: 'Mobile Transfer'
      };

      const result = mockTicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
    });

    it('should reject ticket with past event date', () => {
      const invalidTicket = {
        title: 'Concert Tickets',
        eventTitle: 'Past Concert',
        venue: 'Madison Square Garden',
        eventDate: new Date('2020-01-01'),
        category: 'Concert',
        quantity: 2,
        transferMethod: 'Mobile Transfer'
      };

      const result = mockTicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should validate complete user registration data', () => {
      const validUser = {
        email: 'john.doe@example.com',
        password: 'SecurePass123',
        fullName: 'John Doe',
        phone: '+1234567890',
        country: 'US',
        timezone: 'America/New_York',
        language: 'en'
      };

      const result = mockUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject user with invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'SecurePass123',
        fullName: 'John Doe',
        country: 'US'
      };

      const result = mockUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject user with weak password', () => {
      const invalidUser = {
        email: 'john.doe@example.com',
        password: '123',
        fullName: 'John Doe',
        country: 'US'
      };

      const result = mockUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject user with invalid country code', () => {
      const invalidUser = {
        email: 'john.doe@example.com',
        password: 'SecurePass123',
        fullName: 'John Doe',
        country: 'USA' // Should be 2-letter code
      };

      const result = mockUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('Search Parameters Validation', () => {
    const searchSchema = z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      city: z.string().optional(),
      country: z.string().length(2).optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      eventDate: z.date().optional(),
      trending: z.boolean().optional(),
      sellingFast: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    });

    it('should validate search parameters', () => {
      const validSearch = {
        query: 'Taylor Swift',
        category: 'Concert',
        city: 'New York',
        country: 'US',
        minPrice: 50,
        maxPrice: 500,
        trending: true,
        limit: 25,
        offset: 0
      };

      const result = searchSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should reject invalid price range', () => {
      const invalidSearch = {
        minPrice: -10,
        maxPrice: 500
      };

      const result = searchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });

    it('should reject invalid limit/offset', () => {
      const invalidSearch = {
        limit: 0,
        offset: -5
      };

      const result = searchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Request Validation', () => {
    const contactSchema = z.object({
      ticketId: z.number().positive(),
      requesterId: z.number().positive(),
      contactMethod: z.enum(['whatsapp', 'phone', 'email', 'instagram']),
      message: z.string().min(10).max(1000),
      meetingLocation: z.string().optional(),
      preferredTime: z.string().optional()
    });

    it('should validate contact request', () => {
      const validRequest = {
        ticketId: 123,
        requesterId: 456,
        contactMethod: 'whatsapp' as const,
        message: 'Hi, I am interested in buying your tickets. Are they still available?',
        meetingLocation: 'Central Park, NYC',
        preferredTime: 'Evening'
      };

      const result = contactSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject contact request with invalid method', () => {
      const invalidRequest = {
        ticketId: 123,
        requesterId: 456,
        contactMethod: 'telegram',
        message: 'Hi, I am interested in buying your tickets.'
      };

      const result = contactSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject contact request with short message', () => {
      const invalidRequest = {
        ticketId: 123,
        requesterId: 456,
        contactMethod: 'email' as const,
        message: 'Hi'
      };

      const result = contactSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});