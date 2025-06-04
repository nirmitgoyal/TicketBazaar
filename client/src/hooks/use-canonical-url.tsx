import { useLocation } from "wouter";
import { useMemo } from "react";

const BASE_URL = "https://ticketbazaar.co.in";

/**
 * Hook to automatically generate canonical URLs for all routes
 */
export function useCanonicalUrl(customPath?: string): string {
  const [location] = useLocation();

  return useMemo(() => {
    if (customPath) {
      return `${BASE_URL}${customPath}`;
    }

    // Clean up the current location to create proper canonical URL
    let cleanPath = location;

    // Remove query parameters and fragments for canonical URL
    cleanPath = cleanPath.split("?")[0].split("#")[0];

    // Ensure path starts with /
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    // Handle specific route mappings for SEO
    switch (true) {
      case cleanPath === "/":
        return BASE_URL;

      case cleanPath.startsWith("/event/"):
        return `${BASE_URL}${cleanPath}`;

      case cleanPath.startsWith("/events/category/"):
        // For category pages, use clean category URL
        const category = cleanPath.split("/")[3];
        return `${BASE_URL}/events/category/${category}`;

      case cleanPath === "/events/map" || cleanPath === "/map":
        return `${BASE_URL}/events/map`;

      case cleanPath === "/auth" || cleanPath === "/login":
        return `${BASE_URL}/login`;

      case cleanPath === "/register":
        return `${BASE_URL}/register`;

      case cleanPath === "/list-ticket":
        return `${BASE_URL}/list-ticket`;

      case cleanPath === "/my-tickets":
        return `${BASE_URL}/my-tickets`;

      case cleanPath === "/ticket-verification":
        return `${BASE_URL}/ticket-verification`;

      case cleanPath.startsWith("/ticket/verify/"):
        return `${BASE_URL}${cleanPath}`;

      case cleanPath === "/profile":
        return `${BASE_URL}/profile`;

      case cleanPath === "/terms-of-service":
        return `${BASE_URL}/terms-of-service`;

      case cleanPath === "/privacy-policy":
        return `${BASE_URL}/privacy-policy`;

      case cleanPath === "/complete-profile":
        return `${BASE_URL}/complete-profile`;

      default:
        return `${BASE_URL}${cleanPath}`;
    }
  }, [location, customPath]);
}

/**
 * Get all canonical URLs for sitemap generation
 */
export function getAllCanonicalUrls(): string[] {
  return [
    `${BASE_URL}/`,
    `${BASE_URL}/events/map`,
    `${BASE_URL}/login`,
    `${BASE_URL}/register`,
    `${BASE_URL}/list-ticket`,
    `${BASE_URL}/my-tickets`,
    `${BASE_URL}/ticket-verification`,
    `${BASE_URL}/profile`,
    `${BASE_URL}/terms-of-service`,
    `${BASE_URL}/privacy-policy`,
    // Category URLs
    `${BASE_URL}/events/category/concerts`,
    `${BASE_URL}/events/category/sports`,
    `${BASE_URL}/events/category/theatre`,
    `${BASE_URL}/events/category/comedy`,
    `${BASE_URL}/events/category/festivals`,
    `${BASE_URL}/events/category/workshops`,
  ];
}
