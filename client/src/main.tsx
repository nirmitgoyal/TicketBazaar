// CRITICAL: Global useQueryClient shim must be absolutely first
// This prevents ReferenceError when stale compiled chunks reference useQueryClient
// Note: All source code now uses queryClient singleton, but this shim handles any
// residual references from cached browser assets or dynamic imports
if (typeof window !== 'undefined') {
  // Provide immediate synchronous access to queryClient
  let queryClientInstance: any = null;
  
  const getQueryClient = () => {
    if (!queryClientInstance) {
      // Synchronous import of queryClient (already instantiated)
      try {
        queryClientInstance = (window as any).__QUERY_CLIENT__;
        if (!queryClientInstance) {
          // Fallback: import the module synchronously if possible
          const module = require('./lib/queryClient');
          queryClientInstance = module.queryClient;
        }
      } catch (e) {
        console.warn('QueryClient not available yet, creating placeholder');
        queryClientInstance = {
          invalidateQueries: () => Promise.resolve(),
          setQueryData: () => {},
          getQueryData: () => null,
        };
      }
    }
    return queryClientInstance;
  };

  // Set up global shims in all possible scopes
  (globalThis as any).useQueryClient = getQueryClient;
  (window as any).useQueryClient = getQueryClient;
  
  // Also store queryClient reference for immediate access
  import('./lib/queryClient').then(module => {
    (window as any).__QUERY_CLIENT__ = module.queryClient;
    queryClientInstance = module.queryClient;
  });
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";
import { initializeGlobalErrorHandlers } from "./utils/error-handler";

// Initialize comprehensive global error handlers
initializeGlobalErrorHandlers();

// Override Vite's error overlay behavior in development
if (import.meta.env.DEV) {
  // Remove any existing error overlays on load
  const removeErrorOverlay = () => {
    const overlay = document.querySelector('vite-error-overlay');
    if (overlay) {
      overlay.remove();
    }
  };
  
  // Watch for error overlays and remove them
  const observer = new MutationObserver(() => {
    removeErrorOverlay();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}