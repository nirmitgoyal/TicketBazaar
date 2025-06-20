/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:') ||
      trimmed.startsWith('file:')) {
    return '';
  }
  
  // Only allow http, https, and relative URLs
  if (!trimmed.startsWith('http://') && 
      !trimmed.startsWith('https://') && 
      !trimmed.startsWith('/') &&
      !trimmed.startsWith('./') &&
      !trimmed.startsWith('../')) {
    return '';
  }
  
  return url;
}

/**
 * Validate and sanitize user input for display
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return sanitizeHtml(input.trim().slice(0, maxLength));
}

/**
 * Safe innerHTML replacement
 */
export function safeSetInnerHTML(element: HTMLElement, content: string): void {
  element.textContent = content; // Always use textContent, never innerHTML
}

/**
 * Validate file names to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return 'unknown';
  
  return fileName
    .replace(/[^a-zA-Z0-9.-_]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}