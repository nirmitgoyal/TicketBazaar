/**
 * Global SEO and GEO utilities for TicketHub
 * Comprehensive SEO optimization for global ticket discovery platform
 */

export interface GlobalSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  hreflang: Record<string, string>;
  structuredData: any[];
}

export interface EventSEOData {
  eventTitle: string;
  eventDescription: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  date: Date;
  price: number;
  currency: string;
}

export interface LocationSEOData {
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  currency: string;
}

// Global event categories with SEO-optimized keywords
export const GLOBAL_EVENT_CATEGORIES = {
  concerts: {
    name: "Concerts",
    keywords: ["concert tickets", "music events", "live music", "music festivals", "artist concerts"],
    description: "Discover concert tickets for live music events, festivals, and artist performances worldwide"
  },
  comedy: {
    name: "Comedy Shows",
    keywords: ["comedy show tickets", "stand-up comedy", "comedy events", "comedian tickets", "comedy festivals"],
    description: "Find comedy show tickets for stand-up performances, comedy festivals, and entertainment events globally"
  },
  sports: {
    name: "Sports Events",
    keywords: ["sports tickets", "football tickets", "basketball tickets", "soccer tickets", "sports events"],
    description: "Connect with sports ticket sellers for football, basketball, soccer, and other sporting events worldwide"
  },
  travel: {
    name: "Travel Experiences",
    keywords: ["travel experience tickets", "tourist attractions", "sightseeing tickets", "tour tickets", "travel events"],
    description: "Discover tickets for travel experiences, tourist attractions, tours, and unique travel events globally"
  },
  movies: {
    name: "Movies & Premieres",
    keywords: ["movie tickets", "film premieres", "cinema tickets", "movie events", "film festivals"],
    description: "Find movie tickets, film premiere passes, and cinema event tickets in cities worldwide"
  },
  festivals: {
    name: "Festivals",
    keywords: ["festival tickets", "music festivals", "cultural festivals", "food festivals", "art festivals"],
    description: "Explore festival tickets for music, cultural, food, art, and entertainment festivals globally"
  }
};

// Major global cities with SEO data
export const GLOBAL_CITIES = {
  "new-york": {
    name: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    currency: "USD",
    keywords: ["New York events", "NYC tickets", "Manhattan events", "Broadway shows"]
  },
  "london": {
    name: "London",
    country: "United Kingdom", 
    countryCode: "GB",
    timezone: "Europe/London",
    currency: "GBP",
    keywords: ["London events", "UK tickets", "West End shows", "London concerts"]
  },
  "sydney": {
    name: "Sydney",
    country: "Australia",
    countryCode: "AU", 
    timezone: "Australia/Sydney",
    currency: "AUD",
    keywords: ["Sydney events", "Australia tickets", "Sydney Opera House", "Australian events"]
  },
  "tokyo": {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo", 
    currency: "JPY",
    keywords: ["Tokyo events", "Japan tickets", "Japanese concerts", "Tokyo entertainment"]
  },
  "berlin": {
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR", 
    keywords: ["Berlin events", "Germany tickets", "German concerts", "European events"]
  },
  "toronto": {
    name: "Toronto",
    country: "Canada",
    countryCode: "CA",
    timezone: "America/Toronto",
    currency: "CAD",
    keywords: ["Toronto events", "Canada tickets", "Canadian concerts", "Ontario events"]
  },
  "paris": {
    name: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris", 
    currency: "EUR",
    keywords: ["Paris events", "France tickets", "French concerts", "Parisian entertainment"]
  },
  "madrid": {
    name: "Madrid", 
    country: "Spain",
    countryCode: "ES",
    timezone: "Europe/Madrid",
    currency: "EUR",
    keywords: ["Madrid events", "Spain tickets", "Spanish concerts", "Madrid entertainment"]
  },
  "rome": {
    name: "Rome",
    country: "Italy",
    countryCode: "IT", 
    timezone: "Europe/Rome",
    currency: "EUR",
    keywords: ["Rome events", "Italy tickets", "Italian concerts", "Roman entertainment"]
  },
  "sao-paulo": {
    name: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL", 
    keywords: ["São Paulo events", "Brazil tickets", "Brazilian concerts", "South American events"]
  }
};

/**
 * Generate global homepage SEO data
 */
export function generateHomepageSEO(): GlobalSEOData {
  return {
    title: "TicketHub: Global Ticket Discovery & Contact Platform | Connect Buyers & Sellers Worldwide",
    description: "Discover and connect with ticket buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals. Global marketplace with multi-currency support across 50+ countries.",
    keywords: [
      "global ticket discovery",
      "worldwide ticket marketplace", 
      "international event tickets",
      "concert tickets worldwide",
      "comedy show tickets global",
      "sports tickets international",
      "travel experience tickets",
      "movie tickets global",
      "festival tickets worldwide",
      "multi-currency ticket platform",
      "verified ticket sellers",
      "global entertainment marketplace",
      "cross-border ticket discovery",
      "international ticket connection"
    ],
    canonicalUrl: "https://tickethub.global",
    hreflang: {
      "en": "https://tickethub.global",
      "en-US": "https://tickethub.global", 
      "en-GB": "https://uk.tickethub.global",
      "en-AU": "https://au.tickethub.global",
      "en-CA": "https://ca.tickethub.global",
      "es": "https://es.tickethub.global",
      "fr": "https://fr.tickethub.global",
      "de": "https://de.tickethub.global",
      "it": "https://it.tickethub.global",
      "pt": "https://pt.tickethub.global",
      "ja": "https://ja.tickethub.global",
      "x-default": "https://tickethub.global"
    },
    structuredData: []
  };
}

/**
 * Generate category-specific SEO data
 */
export function generateCategorySEO(category: string): GlobalSEOData {
  const categoryData = GLOBAL_EVENT_CATEGORIES[category as keyof typeof GLOBAL_EVENT_CATEGORIES];
  
  if (!categoryData) {
    return generateHomepageSEO();
  }

  return {
    title: `${categoryData.name} Tickets Worldwide | Global Discovery Platform - TicketHub`,
    description: `${categoryData.description}. Connect with verified sellers across 50+ countries with multi-currency support.`,
    keywords: [
      ...categoryData.keywords,
      `global ${category} tickets`,
      `worldwide ${category} events`,
      `international ${category} marketplace`,
      `${category} tickets discovery`,
      `verified ${category} sellers`
    ],
    canonicalUrl: `https://tickethub.global/category/${category}`,
    hreflang: {
      "en": `https://tickethub.global/category/${category}`,
      "en-US": `https://tickethub.global/category/${category}`,
      "en-GB": `https://uk.tickethub.global/category/${category}`,
      "x-default": `https://tickethub.global/category/${category}`
    },
    structuredData: []
  };
}

/**
 * Generate city-specific SEO data
 */
export function generateCitySEO(citySlug: string): GlobalSEOData {
  const cityData = GLOBAL_CITIES[citySlug as keyof typeof GLOBAL_CITIES];
  
  if (!cityData) {
    return generateHomepageSEO();
  }

  return {
    title: `${cityData.name} Event Tickets | Discover Local Events - TicketHub`,
    description: `Find and connect with ticket sellers in ${cityData.name}, ${cityData.country}. Discover concerts, comedy shows, sports events, and entertainment with verified local sellers.`,
    keywords: [
      ...cityData.keywords,
      `${cityData.name} ticket marketplace`,
      `${cityData.name} event discovery`,
      `${cityData.name} entertainment tickets`,
      `${cityData.country} events`,
      `local ${cityData.name} tickets`
    ],
    canonicalUrl: `https://tickethub.global/city/${citySlug}`,
    hreflang: {
      "en": `https://tickethub.global/city/${citySlug}`,
      "x-default": `https://tickethub.global/city/${citySlug}`
    },
    structuredData: []
  };
}

/**
 * Generate event-specific structured data
 */
export function generateEventStructuredData(event: EventSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.eventTitle,
    "description": event.eventDescription,
    "startDate": event.date.toISOString(),
    "location": {
      "@type": "Place",
      "name": event.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city,
        "addressCountry": event.country
      }
    },
    "offers": {
      "@type": "Offer",
      "price": event.price.toString(),
      "priceCurrency": event.currency,
      "availability": "https://schema.org/InStock",
      "url": `https://tickethub.global/event/${event.eventTitle.toLowerCase().replace(/\s+/g, '-')}`
    },
    "organizer": {
      "@type": "Organization", 
      "name": "TicketHub",
      "url": "https://tickethub.global"
    },
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled"
  };
}

/**
 * Generate search results structured data for GEO
 */
export function generateSearchResultsStructuredData(query: string, resultCount: number, events: EventSEOData[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": `https://tickethub.global/search?q=${encodeURIComponent(query)}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": resultCount,
      "itemListElement": events.slice(0, 10).map((event, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": event.eventTitle,
          "description": event.eventDescription,
          "location": {
            "@type": "Place",
            "name": event.venue,
            "address": {
              "@type": "PostalAddress", 
              "addressLocality": event.city,
              "addressCountry": event.country
            }
          },
          "offers": {
            "@type": "Offer",
            "price": event.price.toString(),
            "priceCurrency": event.currency
          }
        }
      }))
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tickethub.global/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://tickethub.global${item.url}`
    }))
  };
}

/**
 * Generate FAQPage structured data optimized for GEO
 */
export function generateFAQStructuredData(faqs: Array<{question: string, answer: string}>) {
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
 * Generate hreflang links for international SEO
 */
export function generateHreflangLinks(basePath: string = '') {
  const hreflangs = [
    { lang: 'en', url: `https://tickethub.global${basePath}` },
    { lang: 'en-US', url: `https://tickethub.global${basePath}` },
    { lang: 'en-GB', url: `https://uk.tickethub.global${basePath}` },
    { lang: 'en-AU', url: `https://au.tickethub.global${basePath}` },
    { lang: 'en-CA', url: `https://ca.tickethub.global${basePath}` },
    { lang: 'es', url: `https://es.tickethub.global${basePath}` },
    { lang: 'fr', url: `https://fr.tickethub.global${basePath}` },
    { lang: 'de', url: `https://de.tickethub.global${basePath}` },
    { lang: 'it', url: `https://it.tickethub.global${basePath}` },
    { lang: 'pt', url: `https://pt.tickethub.global${basePath}` },
    { lang: 'ja', url: `https://ja.tickethub.global${basePath}` },
    { lang: 'x-default', url: `https://tickethub.global${basePath}` }
  ];

  return hreflangs;
}

/**
 * Get optimized meta description for GEO
 */
export function getGEOOptimizedDescription(type: 'homepage' | 'category' | 'city' | 'event', data?: any): string {
  switch (type) {
    case 'homepage':
      return "Discover and connect with verified ticket buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals. Global marketplace supporting 50+ countries and multiple currencies.";
    
    case 'category':
      const category = GLOBAL_EVENT_CATEGORIES[data?.category as keyof typeof GLOBAL_EVENT_CATEGORIES];
      return category ? `${category.description}. Global discovery platform connecting verified buyers and sellers worldwide with multi-currency support.` : "Global event ticket discovery platform";
    
    case 'city':
      const city = GLOBAL_CITIES[data?.citySlug as keyof typeof GLOBAL_CITIES];
      return city ? `Discover ${city.name} event tickets for concerts, comedy shows, sports, and entertainment. Connect with verified local sellers in ${city.name}, ${city.country}.` : "Local event ticket discovery";
    
    case 'event':
      return `${data?.eventTitle} tickets available through verified sellers. ${data?.eventDescription} Find authentic tickets for ${data?.venue} in ${data?.city}.`;
    
    default:
      return "Global ticket discovery and connection platform for worldwide entertainment events.";
  }
}

/**
 * Generate keywords optimized for GEO and discovery
 */
export function getGEOOptimizedKeywords(type: 'homepage' | 'category' | 'city' | 'event', data?: any): string[] {
  const baseKeywords = [
    "ticket discovery platform",
    "global marketplace", 
    "verified ticket sellers",
    "international events",
    "multi-currency support",
    "worldwide entertainment"
  ];

  switch (type) {
    case 'homepage':
      return [
        ...baseKeywords,
        "global ticket discovery",
        "worldwide ticket marketplace",
        "international ticket connection",
        "cross-border ticket platform",
        "global entertainment discovery",
        "verified sellers worldwide"
      ];
    
    case 'category':
      const category = GLOBAL_EVENT_CATEGORIES[data?.category as keyof typeof GLOBAL_EVENT_CATEGORIES];
      return category ? [
        ...baseKeywords,
        ...category.keywords,
        `global ${data.category} discovery`,
        `worldwide ${data.category} platform`,
        `international ${data.category} marketplace`
      ] : baseKeywords;
    
    case 'city':
      const city = GLOBAL_CITIES[data?.citySlug as keyof typeof GLOBAL_CITIES];
      return city ? [
        ...baseKeywords,
        ...city.keywords,
        `${city.name} ticket discovery`,
        `${city.name} entertainment marketplace`,
        `${city.country} events platform`
      ] : baseKeywords;
    
    case 'event':
      return [
        ...baseKeywords,
        `${data?.eventTitle} tickets`,
        `${data?.venue} events`,
        `${data?.city} entertainment`,
        `${data?.category} tickets`,
        `verified ${data?.eventTitle} sellers`
      ];
    
    default:
      return baseKeywords;
  }
}