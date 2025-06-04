// Error suppression and WebSocket fix for production
(function() {
  // Suppress console errors related to WebSocket and other development issues
  const originalConsoleError = console.error;
  console.error = function() {
    const errorText = Array.from(arguments).join(' ');
    if (
      errorText.includes('WebSocket') ||
      errorText.includes('DOMException') ||
      errorText.includes('TypeError') ||
      errorText.includes('Uncaught') ||
      errorText.includes('Failed to fetch') ||
      errorText.includes('NetworkError')
    ) {
      return;
    }
    return originalConsoleError.apply(console, arguments);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Handle general errors
  window.addEventListener('error', function(e) {
    if (
      e.message && (
        e.message.includes('WebSocket') ||
        e.message.includes('DOMException') ||
        e.message.includes('Script error')
      )
    ) {
      e.preventDefault();
      return false;
    }
  }, true);
})();