// Basic error handling for development
(function() {
  // Suppress only critical development-only WebSocket errors
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason?.message?.includes('WebSocket connection') && process.env.NODE_ENV === 'development') {
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