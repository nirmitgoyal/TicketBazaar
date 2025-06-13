import React from "react";
import { Helmet } from "react-helmet";

interface AdvancedStructuredDataProps {
  type: 'marketplace' | 'discovery' | 'localbusiness' | 'webpage';
  data?: any;
  events?: any[];
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export const AdvancedStructuredData: React.FC<AdvancedStructuredDataProps> = ({
  type,
  data = {},
  events = [],
  location
}) => {
  // Generate marketplace structured data
  const generateMarketplaceData = () => ({
    "@context": "https://schema.org",
    "@type": "OnlineMarketplace",
    "name": "TicketHub",
    "description": "Global ticket discovery and contact platform connecting verified buyers and sellers worldwide",
    "url": "https://tickethub.global",
    "logo": "https://tickethub.global/logo.svg",
    "foundingDate": "2024",
    "founder": {
      "@type": "Organization",
      "name": "TicketHub Global"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Global Event Tickets",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Concert Ticket Discovery",
            "category": "Entertainment",
            "areaServed": "Worldwide"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sports Ticket Discovery",
            "category": "Sports",
            "areaServed": "Worldwide"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Comedy Show Discovery",
            "category": "Entertainment",
            "areaServed": "Worldwide"
          }
        }
      ]
    },
    "paymentAccepted": "DirectTransaction",
    "currenciesAccepted": ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "BRL"],
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "serviceType": "Ticket Discovery Platform",
    "availableLanguage": ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese"]
  });

  // Generate discovery platform data
  const generateDiscoveryData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TicketHub - Global Ticket Discovery",
    "url": "https://tickethub.global",
    "description": "Discover and connect with verified ticket buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Global Cities",
        "url": "https://tickethub.global/cities",
        "description": "Explore event tickets in major cities worldwide"
      },
      {
        "@type": "WebPage", 
        "name": "Event Categories",
        "url": "https://tickethub.global/events/category",
        "description": "Browse events by category including concerts, sports, comedy, and more"
      }
    ],
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": "https://tickethub.global/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "DiscoverAction",
        "target": "https://tickethub.global/cities",
        "object": {
          "@type": "Place",
          "name": "Global Cities"
        }
      }
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://tickethub.global"
    }
  });

  // Generate local business data for city pages
  const generateLocalBusinessData = () => {
    if (!location) return null;

    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `TicketHub ${location.city}`,
      "description": `Ticket discovery platform serving ${location.city}, ${location.country}`,
      "url": `https://tickethub.global/city/${location.city.toLowerCase().replace(/\s+/g, '-')}`,
      "areaServed": {
        "@type": "City",
        "name": location.city,
        "addressCountry": location.country
      },
      "geo": location.coordinates ? {
        "@type": "GeoCoordinates",
        "latitude": location.coordinates.latitude,
        "longitude": location.coordinates.longitude
      } : undefined,
      "serviceType": "Event Ticket Discovery",
      "knowsAbout": [
        `${location.city} Events`,
        `${location.city} Concerts`,
        `${location.city} Sports`,
        `${location.city} Entertainment`
      ]
    };
  };

  // Generate webpage data
  const generateWebPageData = () => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title || "TicketHub - Global Ticket Discovery Platform",
    "description": data.description || "Discover and connect with verified ticket sellers worldwide",
    "url": data.url || "https://tickethub.global",
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": "TicketHub",
      "url": "https://tickethub.global"
    },
    "mainEntity": {
      "@type": "Service",
      "name": "Global Ticket Discovery",
      "provider": {
        "@type": "Organization",
        "name": "TicketHub"
      }
    },
    "breadcrumb": data.breadcrumbs ? {
      "@type": "BreadcrumbList",
      "itemListElement": data.breadcrumbs.map((crumb: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    } : undefined
  });

  // Generate event list data
  const generateEventListData = () => {
    if (!events.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": location ? `Events in ${location.city}` : "Global Events",
      "description": location ? 
        `Discover event tickets in ${location.city}, ${location.country}` : 
        "Discover event tickets worldwide",
      "numberOfItems": events.length,
      "itemListElement": events.slice(0, 20).map((event, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": event.eventTitle || event.title,
          "description": event.eventDescription || event.description,
          "startDate": event.eventDate || event.date,
          "location": {
            "@type": "Place",
            "name": event.venue,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": event.city || location?.city,
              "addressCountry": event.country || location?.country
            }
          },
          "offers": {
            "@type": "Offer",
            "price": event.price || "0",
            "priceCurrency": event.currency || "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    };
  };

  // Select appropriate structured data based on type
  const getStructuredData = () => {
    const schemas = [];

    switch (type) {
      case 'marketplace':
        schemas.push(generateMarketplaceData());
        break;
      case 'discovery':
        schemas.push(generateDiscoveryData());
        break;
      case 'localbusiness':
        const localBusiness = generateLocalBusinessData();
        if (localBusiness) schemas.push(localBusiness);
        break;
      case 'webpage':
        schemas.push(generateWebPageData());
        break;
    }

    // Add event list data if events are provided
    const eventList = generateEventListData();
    if (eventList) schemas.push(eventList);

    return schemas;
  };

  const schemas = getStructuredData();

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema, null, 0)}
        </script>
      ))}
    </Helmet>
  );
};

export default AdvancedStructuredData;