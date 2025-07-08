/**
 * Authentication debugging utility
 * Tracks authentication flow and redirects
 */

export function debugAuthFlow(message: string, data?: any) {
  // In production, only log critical errors, not debug info
  if (import.meta.env.PROD) {
    // Only log in console for production, no storage
    console.log(`[AUTH-DEBUG] ${message}`, data || '');
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data,
    location: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    // Remove excessive storage data to prevent quota issues
    sessionStorageKeys: Object.keys(sessionStorage).length,
    localStorageKeys: Object.keys(localStorage).length
  };
  
  console.log(`[AUTH-DEBUG] ${message}`, logEntry);
  
  // Only store in development with stricter limits
  if (import.meta.env.DEV) {
    try {
      const debugLog = JSON.parse(sessionStorage.getItem('auth-debug-log') || '[]');
      debugLog.push(logEntry);
      
      // Keep only last 5 entries to prevent quota issues
      while (debugLog.length > 5) {
        debugLog.shift();
      }
      
      // Check if stringified data is too large
      const stringifiedLog = JSON.stringify(debugLog);
      if (stringifiedLog.length > 50000) { // 50KB limit
        // Keep only the most recent entry
        debugLog.splice(0, debugLog.length - 1);
      }
      
      sessionStorage.setItem('auth-debug-log', JSON.stringify(debugLog));
    } catch (quotaError) {
      // If quota exceeded, clear and store only the latest entry
      console.warn('Debug log quota exceeded, clearing old entries');
      try {
        sessionStorage.removeItem('auth-debug-log');
        sessionStorage.setItem('auth-debug-log', JSON.stringify([logEntry]));
      } catch (clearError) {
        // If still failing, just log to console
        console.warn('Failed to store debug log, continuing with console logging only');
      }
    }
  }
}

export function getAuthDebugLog() {
  return JSON.parse(sessionStorage.getItem('auth-debug-log') || '[]');
}

export function clearAuthDebugLog() {
  sessionStorage.removeItem('auth-debug-log');
}

// Initialize auth flow debugging
if (window.location.pathname.includes('auth') || 
    window.location.pathname.includes('login') ||
    window.location.pathname.includes('list-ticket')) {
  debugAuthFlow('Page loaded');
}