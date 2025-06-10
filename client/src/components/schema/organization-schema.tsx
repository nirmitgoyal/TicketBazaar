import { useEffect } from "react";

/**
 * Organization structured data component for SEO
 * Adds organization schema markup to the page
 */
export function OrganizationSchema() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ticket Bazaar",
      "url": "https://ticketbazaar.co.in",
      "logo": "https://ticketbazaar.co.in/logo.png",
      "description": "India's trusted peer-to-peer ticket reselling platform for events, concerts, and shows",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Hindi"]
      },
      "sameAs": [
        "https://twitter.com/ticketbazaar",
        "https://facebook.com/ticketbazaar",
        "https://instagram.com/ticketbazaar"
      ]
    };

    // Remove existing organization schema if it exists
    const existingScript = document.querySelector('script[data-schema="organization"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'organization');
    script.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const schemaScript = document.querySelector('script[data-schema="organization"]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, []);

  return null;
}