// Chrome Extension Error Prevention System
// This script prevents Chrome extension listener errors through promise interception
(function() {
  'use strict';

  // Global flag to track if we've already initialized
  if (window.__chromeExtensionBlockerInitialized) {
    return;
  }
  window.__chromeExtensionBlockerInitialized = true;

  // Override Promise to catch extension-related rejections
  const originalPromise = window.Promise;
  const originalPromiseReject = Promise.reject;
  
  Promise.reject = function(reason) {
    // Check if this is a Chrome extension listener error
    if (reason && typeof reason === 'object' && reason.message) {
      const message = reason.message;
      if (message.includes('listener indicated an asynchronous response') ||
          message.includes('message channel closed before a response was received') ||
          message.includes('Extension context invalidated')) {
        // Return a resolved promise instead of rejected
        return Promise.resolve();
      }
    }
    return originalPromiseReject.call(this, reason);
  };

  // Override unhandled promise rejection handling
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    if (reason && typeof reason === 'object' && reason.message) {
      const message = reason.message;
      if (message.includes('listener indicated an asynchronous response') ||
          message.includes('message channel closed before a response was received') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://')) {
        event.preventDefault();
        return false;
      }
    }
    // Call original handler if it exists
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(this, event);
    }
  }, true);

  // Intercept Error constructor to prevent extension errors from being created
  const originalError = window.Error;
  window.Error = function(message, ...args) {
    if (typeof message === 'string') {
      if (message.includes('listener indicated an asynchronous response') ||
          message.includes('message channel closed before a response was received') ||
          message.includes('Extension context invalidated')) {
        // Create a suppressed error
        const error = new originalError('Extension error suppressed', ...args);
        error.suppressLogging = true;
        error.name = 'SuppressedExtensionError';
        return error;
      }
    }
    return new originalError(message, ...args);
  };
  
  // Preserve Error prototype and static methods
  window.Error.prototype = originalError.prototype;
  Object.setPrototypeOf(window.Error, originalError);
  
  // Override setTimeout to catch extension errors in async callbacks
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    const safeCallback = function() {
      try {
        return callback.apply(this, arguments);
      } catch (error) {
        if (error && error.message && (
          error.message.includes('listener indicated an asynchronous response') ||
          error.message.includes('message channel closed')
        )) {
          // Silently ignore extension errors in timeouts
          return;
        }
        throw error;
      }
    };
    return originalSetTimeout.call(this, safeCallback, delay, ...args);
  };

  // Override queueMicrotask for extension errors in microtasks
  if (window.queueMicrotask) {
    const originalQueueMicrotask = window.queueMicrotask;
    window.queueMicrotask = function(callback) {
      const safeCallback = function() {
        try {
          return callback.apply(this, arguments);
        } catch (error) {
          if (error && error.message && (
            error.message.includes('listener indicated an asynchronous response') ||
            error.message.includes('message channel closed')
          )) {
            // Silently ignore extension errors in microtasks
            return;
          }
          throw error;
        }
      };
      return originalQueueMicrotask.call(this, safeCallback);
    };
  }

  // Handle navigation-specific extension errors
  // Override history API to prevent extension errors during route changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    try {
      return originalPushState.call(this, state, title, url);
    } catch (error) {
      if (error && error.message && (
        error.message.includes('listener indicated an asynchronous response') ||
        error.message.includes('message channel closed')
      )) {
        // Silently handle navigation errors
        return;
      }
      throw error;
    }
  };
  
  history.replaceState = function(state, title, url) {
    try {
      return originalReplaceState.call(this, state, title, url);
    } catch (error) {
      if (error && error.message && (
        error.message.includes('listener indicated an asynchronous response') ||
        error.message.includes('message channel closed')
      )) {
        // Silently handle navigation errors
        return;
      }
      throw error;
    }
  };

  // Handle popstate events that might trigger extension errors
  window.addEventListener('popstate', function(event) {
    // Delay any extension messages that might fire during navigation
    setTimeout(() => {
      // Clear any pending extension messages
      if (window.chrome && window.chrome.runtime) {
        try {
          // Attempt to clear any pending messages
          window.chrome.runtime.sendMessage = function() { return undefined; };
        } catch (e) {
          // Ignore any errors
        }
      }
    }, 0);
  }, true);

  // Handle beforeunload to prevent extension errors during page transitions
  window.addEventListener('beforeunload', function() {
    // Disable extension messaging during unload
    if (window.chrome && window.chrome.runtime) {
      try {
        window.chrome.runtime.sendMessage = function() { return undefined; };
      } catch (e) {
        // Ignore any errors
      }
    }
  }, true);

  console.log('Chrome Extension Error Blocker initialized with navigation protection');
})();