import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using Indian locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Extract the city from a location string
 */
export function formatLocation(location: string): string {
  return location?.split(",")[0]?.trim() || "";
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Client-side navigation function using History API
 * This provides smooth navigation without page reloads
 * @param path - The path to navigate to
 * @param options - Optional navigation options
 */
export function navigate(path: string, options?: { replace?: boolean }): void {
  // Check if the path is different from the current path to avoid unnecessary navigation
  if (window.location.pathname !== path) {
    // Use history API for client-side routing
    if (options?.replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    // Trigger a custom event that wouter can listen to
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
