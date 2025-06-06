// Enhanced error handling for development environment
(function() {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Enhanced error filtering
  console.error = function() {
    const errorText = Array.from(arguments).join(' ');
    
    // Filter out specific known development-only errors
    if (
      errorText.includes('WebSocket connection lost') ||
      errorText.includes('server connection lost') ||
      errorText.includes('Polling for restart') ||
      errorText.includes('WebSocket reconnecting') ||
      errorText.includes('Verification error:') ||
      errorText.includes('HMR') ||
      errorText.includes('[vite]')
    ) {
      return;
    }
    
    return originalConsoleError.apply(console, arguments);
  };

  // Filter warnings for Google Maps and other dev tools
  console.warn = function() {
    const warnText = Array.from(arguments).join(' ');
    
    if (
      warnText.includes('Google Maps JavaScript API') ||
      warnText.includes('google.maps.Marker is deprecated') ||
      warnText.includes('mapId is present') ||
      warnText.includes('styles property cannot be set')
    ) {
      return;
    }
    
    return originalConsoleWarn.apply(console, arguments);
  };

  // Handle unhandled promise rejections more selectively
  window.addEventListener('unhandledrejection', function(e) {
    if (
      e.reason && 
      (e.reason.message?.includes('WebSocket') || 
       e.reason.message?.includes('fetch'))
    ) {
      e.preventDefault();
      return false;
    }
  }, true);

  // Handle general errors more selectively
  window.addEventListener('error', function(e) {
    if (
      e.message && (
        e.message.includes('WebSocket') ||
        e.message.includes('connection lost') ||
        e.message.includes('Script error')
      )
    ) {
      e.preventDefault();
      return false;
    }
  }, true);
})();