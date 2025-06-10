import { useEffect } from "react";
import { useLocation } from "wouter";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items?: BreadcrumbItem[];
}

/**
 * Breadcrumb structured data component for SEO
 * Automatically generates breadcrumbs based on current route or uses provided items
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const [location] = useLocation();

  useEffect(() => {
    let breadcrumbItems: BreadcrumbItem[] = items || [];

    // Auto-generate breadcrumbs if not provided
    if (!items) {
      const pathSegments = location.split('/').filter(Boolean);
      breadcrumbItems = [{ name: "Home", url: "https://ticketbazaar.co.in/" }];

      if (pathSegments.length > 0) {
        let currentPath = "";
        pathSegments.forEach((segment, index) => {
          currentPath += `/${segment}`;
          const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          breadcrumbItems.push({
            name,
            url: `https://ticketbazaar.co.in${currentPath}`
          });
        });
      }
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "@id": item.url,
          "name": item.name
        }
      }))
    };

    // Remove existing breadcrumb schema if it exists
    const existingScript = document.querySelector('script[data-schema="breadcrumb"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'breadcrumb');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const schemaScript = document.querySelector('script[data-schema="breadcrumb"]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [location, items]);

  return null;
}