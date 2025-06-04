import { useEffect } from "react";
import { useCanonicalUrl } from "@/hooks/use-canonical-url";

/**
 * Component that ensures every page has a canonical URL
 * This runs on every route change and updates the canonical link
 */
export function CanonicalUrlManager() {
  const canonicalUrl = useCanonicalUrl();

  useEffect(() => {
    // Remove any existing canonical links
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add the new canonical link
    const canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    canonicalLink.href = canonicalUrl;
    document.head.appendChild(canonicalLink);

    // Cleanup function to remove the canonical link when component unmounts
    return () => {
      const linkToRemove = document.querySelector(
        `link[rel="canonical"][href="${canonicalUrl}"]`,
      );
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [canonicalUrl]);

  return null; // This component doesn't render anything
}
