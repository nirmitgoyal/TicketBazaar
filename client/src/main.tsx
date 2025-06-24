import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";
import { initializeErrorSuppression } from "./utils/error-suppression";

// Initialize error suppression for production environments
initializeErrorSuppression();

// Add global error handlers to prevent unhandled rejections from causing overlays
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default behavior (console error)
});

window.addEventListener('error', (event) => {
  console.warn('Global error:', event.error);
  event.preventDefault(); // Prevent error overlay from showing
});

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