import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";

// Add global error handlers to prevent unhandled rejections from causing overlays
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default behavior (console error)
});

window.addEventListener('error', (event) => {
  console.warn('Global error:', event.error);
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}