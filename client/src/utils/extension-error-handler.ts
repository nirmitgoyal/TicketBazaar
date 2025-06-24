/**
 * Chrome Extension Error Handler for Navigation
 * Prevents extension listener errors during client-side routing
 */

class ExtensionErrorHandler {
  private static instance: ExtensionErrorHandler;
  private isInitialized = false;
  private originalHistoryMethods: {
    pushState: typeof history.pushState;
    replaceState: typeof history.replaceState;
  } | null = null;

  private constructor() {}

  static getInstance(): ExtensionErrorHandler {
    if (!ExtensionErrorHandler.instance) {
      ExtensionErrorHandler.instance = new ExtensionErrorHandler();
    }
    return ExtensionErrorHandler.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Store original methods
    this.originalHistoryMethods = {
      pushState: history.pushState.bind(history),
      replaceState: history.replaceState.bind(history),
    };

    this.setupGlobalErrorHandling();
    this.setupNavigationInterception();
    this.setupPromiseErrorHandling();
    this.setupEventListenerOverrides();
  }

  private setupGlobalErrorHandling(): void {
    // Enhanced console error suppression
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (this.isExtensionError(message)) {
        return; // Suppress extension errors
      }
      return originalConsoleError.apply(console, args);
    };

    // Global error handler
    window.addEventListener('error', (event) => {
      if (event.message && this.isExtensionError(event.message)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || event.reason || '';
      if (this.isExtensionError(message)) {
        event.preventDefault();
        return false;
      }
    }, true);
  }

  private setupNavigationInterception(): void {
    if (!this.originalHistoryMethods) return;

    // Override history.pushState
    history.pushState = (state: any, title: string, url?: string | URL | null) => {
      this.suppressExtensionMessaging();
      try {
        this.originalHistoryMethods!.pushState(state, title, url);
        // Brief delay to allow extensions to process
        setTimeout(() => this.restoreExtensionMessaging(), 10);
      } catch (error) {
        if (error instanceof Error && this.isExtensionError(error.message)) {
          // Silently handle extension errors during navigation
          return;
        }
        throw error;
      }
    };

    // Override history.replaceState
    history.replaceState = (state: any, title: string, url?: string | URL | null) => {
      this.suppressExtensionMessaging();
      try {
        this.originalHistoryMethods!.replaceState(state, title, url);
        // Brief delay to allow extensions to process
        setTimeout(() => this.restoreExtensionMessaging(), 10);
      } catch (error) {
        if (error instanceof Error && this.isExtensionError(error.message)) {
          // Silently handle extension errors during navigation
          return;
        }
        throw error;
      }
    };

    // Handle popstate events
    window.addEventListener('popstate', () => {
      this.suppressExtensionMessaging();
      setTimeout(() => this.restoreExtensionMessaging(), 10);
    }, true);

    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
      this.suppressExtensionMessaging();
    }, true);
  }

  private setupPromiseErrorHandling(): void {
    // Override Promise.reject to catch extension errors
    const originalPromiseReject = Promise.reject;
    Promise.reject = function(reason: any) {
      if (reason && typeof reason === 'object' && reason.message) {
        const handler = ExtensionErrorHandler.getInstance();
        if (handler.isExtensionError(reason.message)) {
          return Promise.resolve(); // Convert to resolved promise
        }
      }
      return originalPromiseReject.call(this, reason);
    };
  }

  private setupEventListenerOverrides(): void {
    // Override addEventListener to catch extension-related listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (typeof listener === 'function') {
        const wrappedListener = function(this: any, event: Event) {
          try {
            return listener.call(this, event);
          } catch (error) {
            if (error instanceof Error) {
              const handler = ExtensionErrorHandler.getInstance();
              if (handler.isExtensionError(error.message)) {
                return; // Silently handle extension errors
              }
            }
            throw error;
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private suppressExtensionMessaging(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        // Create a safe no-op function for sendMessage
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function() {
          return undefined;
        };
        
        // Store the original for restoration
        (window as any).__originalChromeRuntimeSendMessage = originalSendMessage;
      } catch (error) {
        // Ignore errors when trying to override chrome APIs
      }
    }
  }

  private restoreExtensionMessaging(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        const originalSendMessage = (window as any).__originalChromeRuntimeSendMessage;
        if (originalSendMessage) {
          chrome.runtime.sendMessage = originalSendMessage;
          delete (window as any).__originalChromeRuntimeSendMessage;
        }
      } catch (error) {
        // Ignore errors when trying to restore chrome APIs
      }
    }
  }

  private isExtensionError(message: string): boolean {
    return message.includes('listener indicated an asynchronous response') ||
           message.includes('message channel closed before a response was received') ||
           message.includes('Extension context invalidated') ||
           message.includes('chrome-extension://') ||
           message.includes('Could not establish connection') ||
           message.includes('receiving end does not exist');
  }
}

// Initialize the extension error handler
export const initializeExtensionErrorHandler = () => {
  ExtensionErrorHandler.getInstance().initialize();
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  initializeExtensionErrorHandler();
}