#!/usr/bin/env node

/**
 * Test script to verify Instagram handle validation works correctly
 */

import { z } from 'zod';

// Instagram handle validation schema (same as in the modal)
const instagramHandleSchema = z.object({
  instagram: z
    .string()
    .min(1, "Instagram handle is required")
    .max(20, "Instagram handle must be 20 characters or less")
    .transform((val) => val.replace(/^@/, "")) // Remove @ if present first
    .refine(
      (val) => /^[a-zA-Z0-9_.]+$/.test(val),
      "Invalid Instagram handle format. Must be 1-20 characters, contain only letters, numbers, periods, and underscores."
    ),
});

// Test cases
const testCases = [
  'username',
  '@username', 
  'user.name',
  'user_name',
  'user123',
  '',
  'toolongusernamethatexceeds20chars',
  'user@invalid',
  'user#invalid',
  'user name',
  'valid_user123',
  '@valid.user',
];

console.log('🧪 Testing Instagram handle validation...\n');

testCases.forEach((testCase, index) => {
  try {
    const result = instagramHandleSchema.parse({ instagram: testCase });
    console.log(`✅ Test ${index + 1}: "${testCase}" -> Valid: "${result.instagram}"`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0]?.message || 'Unknown validation error';
      console.log(`❌ Test ${index + 1}: "${testCase}" -> Invalid: ${errorMessage}`);
    } else {
      console.log(`💥 Test ${index + 1}: "${testCase}" -> Unexpected error:`, error);
    }
  }
});

console.log('\n🔍 Testing potential "n is not a function" scenarios...');

// Test if the validation pipeline might cause function reference issues
try {
  const testData = { instagram: 'testuser' };
  const result = instagramHandleSchema.safeParse(testData);
  
  if (result.success) {
    console.log('✅ Validation pipeline works correctly');
  } else {
    console.log('❌ Validation pipeline failed:', result.error);
  }
} catch (error) {
  console.log('💥 Validation pipeline threw error:', error);
}

console.log('\n✨ Test complete!');