import { useEffect } from "react";
import { useCanonicalUrl } from "@/hooks/use-canonical-url";

/**
 * Component that manages canonical URL meta tags for SEO
 * Automatically updates the canonical URL based on current route
 */
export function CanonicalUrlManager() {
  const canonicalUrl = useCanonicalUrl();

  useEffect(() => {
    // Remove existing canonical link if it exists
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create and add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    // Cleanup function to remove the canonical link when component unmounts
    return () => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.remove();
      }
    };
  }, [canonicalUrl]);

  // This component doesn't render anything visible
  return null;
}