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
      message.includes('already defined') ||
      message.includes('listener indicated an asynchronous response') ||
      message.includes('message channel closed before a response was received') ||
      message.includes('Extension context invalidated') ||
      message.includes('chrome-extension://')
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
      message.includes('Loading chunk') ||
      message.includes('listener indicated an asynchronous response') ||
      message.includes('message channel closed before a response was received') ||
      message.includes('Extension context invalidated') ||
      message.includes('chrome-extension://')
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
        e.message.includes('gmp-') ||
        e.message.includes('listener indicated an asynchronous response') ||
        e.message.includes('message channel closed before a response was received') ||
        e.message.includes('Extension context invalidated') ||
        e.message.includes('chrome-extension://')
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

  // Comprehensive Chrome extension error prevention
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Override chrome.runtime.sendMessage to prevent listener errors
    const originalSendMessage = chrome.runtime.sendMessage;
    chrome.runtime.sendMessage = function(...args) {
      try {
        const result = originalSendMessage.apply(this, args);
        // Handle the case where the result is a promise that might reject
        if (result && typeof result.catch === 'function') {
          return result.catch(error => {
            if (error.message && (
              error.message.includes('listener indicated an asynchronous response') ||
              error.message.includes('message channel closed')
            )) {
              // Return a resolved promise to prevent uncaught errors
              return Promise.resolve();
            }
            throw error;
          });
        }
        return result;
      } catch (error) {
        if (error.message && (
          error.message.includes('listener indicated an asynchronous response') ||
          error.message.includes('message channel closed')
        )) {
          // Return undefined to prevent errors
          return undefined;
        }
        throw error;
      }
    };

    // Override chrome.runtime.onMessage.addListener to handle async responses properly
    if (chrome.runtime.onMessage && chrome.runtime.onMessage.addListener) {
      const originalAddListener = chrome.runtime.onMessage.addListener;
      chrome.runtime.onMessage.addListener = function(listener) {
        const wrappedListener = function(message, sender, sendResponse) {
          try {
            const result = listener(message, sender, sendResponse);
            // If listener returns true but never calls sendResponse, handle it gracefully
            if (result === true) {
              // Set a timeout to prevent channel closure errors
              setTimeout(() => {
                try {
                  sendResponse({handled: true});
                } catch (e) {
                  // Channel already closed, ignore
                }
              }, 0);
            }
            return result;
          } catch (error) {
            // Prevent listener errors from propagating
            return false;
          }
        };
        return originalAddListener.call(this, wrappedListener);
      };
    }
  }

  // Intercept and suppress specific extension errors
  const originalError = window.Error;
  window.Error = function(message) {
    if (typeof message === 'string' && 
        (message.includes('listener indicated an asynchronous response') ||
         message.includes('message channel closed before a response was received'))) {
      // Create a silent error that won't be logged
      const error = new originalError('Extension error suppressed');
      error.suppressLogging = true;
      return error;
    }
    return new originalError(message);
  };
  
  // Preserve prototype
  window.Error.prototype = originalError.prototype;
})();