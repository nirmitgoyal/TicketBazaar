/**
 * Common Zod validation schemas
 */

import { z } from 'zod';

// Common Zod schemas for validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const dateRangeSchema = z.object({
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional()
}).refine(
  (data: { minDate?: string; maxDate?: string }) => {
    if (data.minDate && data.maxDate) {
      return new Date(data.minDate) <= new Date(data.maxDate);
    }
    return true;
  },
  { message: 'minDate must be before maxDate' }
);