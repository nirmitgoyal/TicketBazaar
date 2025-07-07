/**
 * Authentication debugging utility
 * Tracks authentication flow and redirects
 */

export function debugAuthFlow(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data,
    location: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    sessionStorage: {
      keys: Object.keys(sessionStorage),
      authRelated: Object.keys(sessionStorage).filter(key => 
        key.includes('auth') || key.includes('return') || key.includes('redirect')
      ).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>)
    },
    localStorage: {
      keys: Object.keys(localStorage),
      authRelated: Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('return') || key.includes('redirect')
      ).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>)
    }
  };
  
  console.log(`[AUTH-DEBUG] ${message}`, logEntry);
  
  // Store in session storage for debugging with error handling
  try {
    const debugLog = JSON.parse(sessionStorage.getItem('auth-debug-log') || '[]');
    debugLog.push(logEntry);
    // Keep only last 10 entries to prevent quota issues
    while (debugLog.length > 10) {
      debugLog.shift();
    }
    
    try {
      sessionStorage.setItem('auth-debug-log', JSON.stringify(debugLog));
    } catch (quotaError) {
      // If quota exceeded, clear and store only the latest entry
      console.warn('Debug log quota exceeded, clearing old entries');
      sessionStorage.removeItem('auth-debug-log');
      sessionStorage.setItem('auth-debug-log', JSON.stringify([logEntry]));
    }
  } catch (e) {
    // If any error, just log to console and continue
    console.warn('Failed to store debug log:', e);
    try {
      sessionStorage.removeItem('auth-debug-log');
    } catch (clearError) {
      // Ignore clear errors
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