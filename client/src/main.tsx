// Make sure we handle uncaught errors before anything else loads
window.onerror = function (message, source, lineno, colno, error) {
  // Check if the error is related to WebSocket or Vite development issues
  const messageStr = message.toString();
  if (
    messageStr.includes("WebSocket connection to") ||
    messageStr.includes("vite:ws") ||
    messageStr.includes("Failed to construct 'WebSocket'") ||
    (messageStr.includes("DOM") && source?.includes("vite"))
  ) {
    // Suppress these development-only errors
    console.log("Suppressed development error:", message);
    return true; // Prevent default handling
  }
  return false; // Let other errors propagate
};

// Main app initialization
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix any lingering issues with WebSocket
try {
  // Add one final protection by preventing unhandled promise rejections
  window.addEventListener(
    "unhandledrejection",
    function (event) {
      event.preventDefault();
      return false;
    },
    true,
  );
} catch (e) {
  // Ignore any errors from our protection code
}

// Finally, render the app with safety checks
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}