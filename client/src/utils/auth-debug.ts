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
  
  // Store in session storage for debugging
  const debugLog = JSON.parse(sessionStorage.getItem('auth-debug-log') || '[]');
  debugLog.push(logEntry);
  // Keep only last 20 entries
  if (debugLog.length > 20) {
    debugLog.shift();
  }
  sessionStorage.setItem('auth-debug-log', JSON.stringify(debugLog));
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