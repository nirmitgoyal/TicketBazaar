/**
 * Form field types and interfaces
 */

import { z } from 'zod';

// Form field types
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  value?: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: T }>;
  validation?: z.ZodSchema<T>;
}