/**
 * SEO utility functions for generating structured data and meta information
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface EventSEOData {
  title: string;
  description: string;
  venue: string;
  date: string;
  category: string;
  city: string;
  price?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Generate structured data for events
 */
export function generateEventStructuredData(event: EventSEOData, ticketCount: number = 0) {
  const location: any = {
    "@type": "Place",
    "name": event.venue,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": event.city,
      "addressCountry": "IN"
    }
  };

  // Add geolocation if available
  if (event.latitude && event.longitude) {
    location.geo = {
      "@type": "GeoCoordinates",
      "latitude": event.latitude,
      "longitude": event.longitude
    };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date,
    "location": location,
    "organizer": {
      "@type": "Organization",
      "name": "Ticket Bazaar",
      "url": "https://ticketbazaar.co.in"
    },
    "offers": ticketCount > 0 ? {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "offerCount": ticketCount.toString(),
      "url": `https://ticketbazaar.co.in/event/${encodeURIComponent(event.title)}`
    } : undefined,
    "image": event.imageUrl,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  return structuredData;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ticket Bazaar",
    "alternateName": "TicketBazaar",
    "url": "https://ticketbazaar.co.in",
    "logo": "https://ticketbazaar.co.in/logo.svg",
    "description": "India's most secure peer-to-peer ticket resale marketplace for concerts, sports events, and festivals",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/ticketbazaar",
      "https://facebook.com/ticketbazaar",
      "https://instagram.com/ticketbazaar"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "India"
    }
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate search results structured data
 */
export function generateSearchResultsStructuredData(
  query: string,
  totalResults: number,
  events: EventSEOData[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "mainContentOfPage": {
      "@type": "WebPageElement",
      "about": {
        "@type": "Thing",
        "name": `Ticket search results for "${query}"`
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalResults,
      "itemListElement": events.slice(0, 10).map((event, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": event.title,
          "description": event.description,
          "url": `https://ticketbazaar.global/event/${encodeURIComponent(event.title)}`
        }
      }))
    }
  };
}

/**
 * Generate canonical URL based on current path
 */
export function generateCanonicalUrl(path: string = ""): string {
  const baseUrl = "https://ticketbazaar.global";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate meta description based on content type
 */
export function generateMetaDescription(
  type: "event" | "search" | "category" | "general",
  data?: any
): string {
  const baseDescription = "Buy and sell verified tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection.";
  
  switch (type) {
    case "event":
      if (data?.title && data?.venue && data?.city) {
        return `Buy verified tickets for ${data.title} at ${data.venue}, ${data.city}. Secure P2P marketplace with escrow protection. Fair prices guaranteed.`;
      }
      break;
    case "search":
      if (data?.query) {
        return `Find "${data.query}" tickets on India's most trusted resale platform. Verified sellers, secure transactions, fair prices.`;
      }
      break;
    case "category":
      if (data?.category) {
        return `Discover ${data.category} events across India. Buy verified tickets from trusted sellers with secure escrow protection.`;
      }
      break;
  }
  
  return baseDescription;
}

/**
 * Generate page title based on content type
 */
export function generatePageTitle(
  type: "event" | "search" | "category" | "general",
  data?: any
): string {
  const siteName = "Ticket Bazaar";
  
  switch (type) {
    case "event":
      if (data?.title && data?.city) {
        return `${data.title} Tickets - ${data.city} | ${siteName}`;
      }
      break;
    case "search":
      if (data?.query) {
        return `"${data.query}" Tickets - Search Results | ${siteName}`;
      }
      break;
    case "category":
      if (data?.category) {
        return `${data.category} Events & Tickets | ${siteName}`;
      }
      break;
  }
  
  return `${siteName}: India's Secure Ticket Resale Platform`;
}

/**
 * Generate keywords based on content
 */
export function generateKeywords(
  type: "event" | "search" | "category" | "general",
  data?: any
): string {
  const baseKeywords = "ticket resale, second hand tickets, event tickets, India, secure marketplace";
  
  switch (type) {
    case "event":
      if (data?.title && data?.category && data?.city) {
        return `${data.title} tickets, ${data.category} tickets, ${data.city} events, ${baseKeywords}`;
      }
      break;
    case "category":
      if (data?.category) {
        return `${data.category} tickets, ${data.category} events, ${baseKeywords}`;
      }
      break;
  }
  
  return baseKeywords;
}