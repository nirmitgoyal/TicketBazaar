/**
 * Utility functions for generating URL-friendly slugs from event titles
 */

/**
 * Generate a URL-friendly slug from an event title
 * @param eventTitle - The event title to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(eventTitle: string): string {
  return eventTitle
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Limit length to 100 characters for database efficiency
    .substring(0, 100)
    // Ensure it doesn't end with a hyphen after truncation
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if the base slug already exists
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

/**
 * Validate if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a parameter is likely a slug (contains letters) vs an ID (only numbers)
 * @param param - The URL parameter to check
 * @returns True if it looks like a slug, false if it looks like an ID
 */
export function isSlugParam(param: string): boolean {
  // If it's all digits, it's an ID
  if (/^\d+$/.test(param)) {
    return false;
  }
  
  // If it contains letters and hyphens, it's likely a slug
  return /^[a-z0-9-]+$/.test(param);
}
