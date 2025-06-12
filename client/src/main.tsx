import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/socket-fix";
import "./index.css";
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}