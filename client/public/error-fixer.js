// Comprehensive error handling for development
(function() {
  'use strict';
  
  // Suppress Google Maps API element redefinition warnings
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    if (
      message.includes('already defined') ||
      message.includes('gmp-') ||
      message.includes('Element with name')
    ) {
      return; // Suppress these warnings
    }
    return originalConsoleWarn.apply(console, args);
  };

  // Enhanced error suppression
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (
      message.includes('Script error') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('WebSocket') ||
      message.includes('gmp-') ||
      message.includes('already defined')
    ) {
      return; // Suppress these errors
    }
    return originalConsoleError.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    const message = e.reason?.message || e.reason || '';
    if (
      message.includes('WebSocket') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Script error') ||
      message.includes('Loading chunk')
    ) {
      e.preventDefault();
      return false;
    }
  }, true);

  // Handle general errors
  window.addEventListener('error', function(e) {
    if (
      e.message && (
        e.message.includes('WebSocket') ||
        e.message.includes('connection lost') ||
        e.message.includes('Script error') ||
        e.message.includes('Failed to fetch dynamically imported module') ||
        e.message.includes('Loading chunk') ||
        e.message.includes('gmp-')
      )
    ) {
      e.preventDefault();
      return false;
    }
  }, true);

  // Suppress module loading errors during development
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      if (error.message && error.message.includes('dynamically imported module')) {
        console.log('Module loading handled gracefully');
        return Promise.reject(new Error('Module loading failed - handled'));
      }
      return Promise.reject(error);
    });
  };
})();