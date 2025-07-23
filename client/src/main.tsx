import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";
import { initializeGlobalErrorHandlers } from "./utils/error-handler";
import { initializePerformanceMonitoring } from "./utils/performance-monitor";
import { initializeImageOptimization } from "./utils/image-optimization";
import { initializeServiceWorker } from "./utils/service-worker";

// Initialize comprehensive global error handlers
initializeGlobalErrorHandlers();

// Initialize performance monitoring for Core Web Vitals
initializePerformanceMonitoring();

// Initialize image optimization for better loading
initializeImageOptimization();

// Initialize service worker for caching and offline support
if (process.env.NODE_ENV === 'production') {
  initializeServiceWorker();
}

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