import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";
import { initializeGlobalErrorHandlers } from "./utils/error-handler";
import { registerPWAServiceWorker } from "./pwa";

// Initialize comprehensive global error handlers
initializeGlobalErrorHandlers();
registerPWAServiceWorker();

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
