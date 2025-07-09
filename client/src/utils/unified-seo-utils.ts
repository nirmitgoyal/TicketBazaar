/**
 * Unified SEO utility functions for generating structured data and meta information
 * Consolidates functionality from seo-utils.ts and global-seo-utils.ts
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface EventSEOData {
  title: string;
  description: string;
  date: string;
  venue: string;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  category?: string;
  eventTitle?: string;
  eventDescription?: string;
}

export interface GlobalSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  hreflang: Record<string, string>;
  structuredData: any[];
}

export interface CityData {
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  currency: string;
  keywords: string[];
}

export interface SEOPageData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: any[];
  breadcrumbs?: BreadcrumbItem[];
  type?: "website" | "article" | "product" | "event";
  noIndex?: boolean;
}

/**
 * Core SEO keywords optimized for the target search terms
 */
export const CORE_SEO_KEYWORDS = [
  // Brand variations (exact matches from target list)
  "ticketbazaar",
  "ticket bazaar", 
  "bazaar ticket",
  "ticketbazar",
  "ticket bazar",
  "the bazaar ticket",
  
  // Core selling actions (exact matches from target list)
  "sell tickets",
  "sell tickets online",
  "sell concert tickets",
  "sell concert tickets online",
  "how to sell concert tickets",
  "how do you sell concert tickets",
  "how to sell tickets online",
  "where to sell concert tickets",
  "where to sell tickets",
  "resell tickets",
  "resell tickets online", 
  "resell concert tickets online",
  
  // Product/service terms (exact matches from target list)
  "second hand tickets",
  "resale tickets",
  "ticket resale",
  "concert tickets online",
  "sell my tickets",
  "sell ticket",
  "selling tickets",
  "selling tickets online",
  "ticket sell",
  "ticket selling",
  "resale bazaar",
  "sell gig tickets",
  "sell online tickets",
  "sell tickets online india",
  "how to sell football tickets",
  "ticket marketplace India",
  
  // Common variations and related terms
  "second hand ticket",
  "resale ticket",
  "second-hand tickets",
  "buy second hand tickets",
  "sell second hand tickets",
  "buy tickets online",
  "concert ticket resale",
  "sports tickets",
  "event tickets",
  "festival tickets",
  "verified tickets",
  "secure ticket transfer",
  "ticket exchange",
  "ticket marketplace",
  "escrow protection",
  "ticket verification"
];

/**
 * Global city data for international SEO
 */
export const GLOBAL_CITY_DATA: Record<string, CityData> = {
  "london": {
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    currency: "GBP",
    keywords: ["London events", "UK tickets", "British concerts", "London entertainment"]
  },
  "new-york": {
    name: "New York",
    country: "United States",
    countryCode: "US", 
    timezone: "America/New_York",
    currency: "USD",
    keywords: ["New York events", "NYC tickets", "US concerts", "American entertainment"]
  },
  "tokyo": {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo", 
    currency: "JPY",
    keywords: ["Tokyo events", "Japan tickets", "Japanese concerts", "Tokyo entertainment"]
  },
  "sydney": {
    name: "Sydney", 
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
    currency: "AUD",
    keywords: ["Sydney events", "Australia tickets", "Australian concerts", "Sydney entertainment"]
  },
  "toronto": {
    name: "Toronto",
    country: "Canada", 
    countryCode: "CA",
    timezone: "America/Toronto",
    currency: "CAD",
    keywords: ["Toronto events", "Canada tickets", "Canadian concerts", "Toronto entertainment"]
  },
  "paris": {
    name: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris", 
    currency: "EUR",
    keywords: ["Paris events", "France tickets", "French concerts", "Parisian entertainment"]
  },
  "berlin": {
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    keywords: ["Berlin events", "Germany tickets", "German concerts", "Berlin entertainment"]
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
 * Generate structured data for events (supports both India and global)
 */
export function generateEventStructuredData(event: EventSEOData, ticketCount: number = 0) {
  const location: any = {
    "@type": "Place",
    "name": event.venue,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": event.city,
      "addressCountry": event.country || "IN"
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

  const baseUrl = event.country && event.country !== "IN" ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const eventTitle = event.eventTitle || event.title;
  const eventDescription = event.eventDescription || event.description;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": eventTitle,
    "description": eventDescription,
    "startDate": event.date,
    "location": location,
    "organizer": {
      "@type": "Organization",
      "name": "Ticket Bazaar",
      "url": baseUrl
    },
    "offers": ticketCount > 0 ? {
      "@type": "AggregateOffer",
      "priceCurrency": event.country === "IN" ? "INR" : "USD",
      "availability": "https://schema.org/InStock",
      "offerCount": ticketCount.toString(),
      "url": `${baseUrl}/event/${encodeURIComponent(eventTitle)}`
    } : {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/event/${encodeURIComponent(eventTitle)}`
    },
    "image": event.imageUrl,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  return structuredData;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[], baseUrl: string = "https://ticketbazaar.co.in") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate organization structured data (supports both India and global)
 */
export function generateOrganizationStructuredData(isGlobal: boolean = false) {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const description = isGlobal 
    ? "Global peer-to-peer ticket marketplace for concerts, sports events, and festivals worldwide"
    : "India's most secure peer-to-peer ticket resale marketplace for concerts, sports events, and festivals";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ticket Bazaar",
    "alternateName": "TicketBazaar",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.svg`,
    "description": description,
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/ticketbazaar",
      "https://facebook.com/ticketbazaar",
      "https://instagram.com/ticketbazaar"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "areaServed": isGlobal ? "Worldwide" : "IN",
      "availableLanguage": isGlobal ? ["en", "es", "fr", "de", "it", "pt", "ja"] : ["en", "hi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": isGlobal ? "Global" : "IN"
    },
    "serviceArea": isGlobal ? {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 0,
        "longitude": 0
      },
      "geoRadius": "20000000"
    } : {
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
  events: EventSEOData[],
  isGlobal: boolean = false
) {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": `${baseUrl}/search?q=${encodeURIComponent(query)}`,
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
          "location": {
            "@type": "Place",
            "name": event.venue,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": event.city,
              "addressCountry": event.country || "IN"
            }
          },
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate canonical URL based on current path
 */
export function generateCanonicalUrl(path: string = "", isGlobal: boolean = false): string {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Generate meta description based on content type with keyword optimization
 */
export function generateMetaDescription(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to" | "global-homepage" | "global-category" | "global-city" | "global",
  data?: any,
  isGlobal: boolean = false
): string {
  const baseDescription = isGlobal 
    ? "Buy and sell verified tickets for concerts, sports events, and festivals worldwide at fair prices. Secure transactions with escrow protection."
    : "Buy and sell verified tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection.";
  
  switch (type) {
    case "event":
      if (data?.title && data?.venue && data?.city) {
        const region = isGlobal ? data?.country || "worldwide" : "India";
        return `Buy verified tickets for ${data.title} at ${data.venue}, ${data.city}. Sell tickets online through ${region}'s trusted ticket bazaar marketplace with escrow protection. Fair prices guaranteed.`;
      }
      break;
    case "search":
      if (data?.query) {
        const platform = isGlobal ? "global" : "India's";
        return `Find "${data.query}" tickets on TicketBazaar - ${platform} most trusted resale platform. Sell tickets online or buy second hand tickets from verified sellers. Secure transactions, fair prices.`;
      }
      break;
    case "category":
      if (data?.category) {
        const region = isGlobal ? "worldwide" : "across India";
        return `Discover ${data.category} events ${region}. Sell ${data.category} tickets online or buy from verified sellers on Ticket Bazaar. Secure escrow protection for all transactions.`;
      }
      break;
    case "selling":
      const marketplace = isGlobal ? "global" : "India's";
      return `Sell tickets online safely on TicketBazaar - ${marketplace} trusted ticket resale marketplace. Sell concert tickets, sports tickets, and event tickets. Easy listing, secure payments, verified buyers. Learn how to sell tickets online with our secure platform.`;
    case "how-to":
      return "Learn how to sell concert tickets and other event tickets online safely. Step-by-step guide to selling tickets on TicketBazaar with secure payment protection and verified buyers. Complete guide on where to sell tickets and how to resell tickets online.";
    case "global-homepage":
      return "Sell tickets online safely on TicketBazaar - the world's most trusted ticket resale marketplace. Buy second hand tickets for concerts, sports, comedy shows, and festivals. Secure transactions with verified sellers worldwide.";
    case "global-category":
      if (data?.category) {
        return `${data.category} events worldwide - connect with verified sellers across 50+ countries. Multi-currency support and secure transactions for global ${data.category} ticket marketplace.`;
      }
      break;
    case "global-city":
      if (data?.cityName && data?.country) {
        return `${data.cityName}, ${data.country} events and tickets. Connect with local sellers and buyers for concerts, sports, and entertainment in ${data.cityName}. Global ticket marketplace with local focus.`;
      }
      break;
  }
  
  return baseDescription;
}

/**
 * Generate page title based on content type with keyword optimization
 */
export function generatePageTitle(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to" | "global-homepage" | "global-category" | "global-city" | "global",
  data?: any,
  isGlobal: boolean = false
): string {
  const brandSuffix = isGlobal ? "Global Ticket Marketplace" : "Ticket Bazaar";
  
  switch (type) {
    case "event":
      if (data?.title && data?.city) {
        return `${data.title} Tickets - ${data.city} | Buy & Sell on ${brandSuffix}`;
      }
      return `Event Tickets | ${brandSuffix}`;
    case "search":
      if (data?.query) {
        return `"${data.query}" Tickets | Search Results | ${brandSuffix}`;
      }
      return `Search Tickets | ${brandSuffix}`;
    case "category":
      if (data?.category) {
        return `${data.category} Tickets | Buy & Sell ${data.category} Events | ${brandSuffix}`;
      }
      return `Event Categories | ${brandSuffix}`;
    case "selling":
      const platform = isGlobal ? "Global Platform" : "India's Trusted Platform";
      return `Sell Tickets Online | ${platform} | ${brandSuffix}`;
    case "how-to":
      return `How to Sell Concert Tickets Online | Complete Guide | ${brandSuffix}`;
    case "global-homepage":
      return "TicketBazaar: Sell Tickets Online | Buy Second Hand Tickets | Global Ticket Marketplace";
    case "global-category":
      if (data?.category) {
        return `${data.category} Tickets Worldwide | Global Discovery Platform | ${brandSuffix}`;
      }
      return `Event Categories Worldwide | ${brandSuffix}`;
    case "global-city":
      if (data?.cityName && data?.country) {
        return `${data.cityName}, ${data.country} Events & Tickets | ${brandSuffix}`;
      }
      return `City Events | ${brandSuffix}`;
    default:
      return isGlobal 
        ? "TicketBazaar - Global Event Ticket Discovery Platform"
        : "TicketBazaar - India's Secure Ticket Resale Platform | Buy & Sell Second Hand Event Tickets";
  }
}

/**
 * Generate keywords based on content type
 */
export function generateKeywords(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to" | "global-homepage" | "global-category" | "global-city" | "global",
  data?: any,
  isGlobal: boolean = false
): string {
  const coreKeywords = isGlobal 
    ? ["global tickets", "worldwide events", "international marketplace", "verified sellers", "secure transactions"]
    : CORE_SEO_KEYWORDS.slice(0, 15); // Use core keywords for India

  let specificKeywords: string[] = [];

  switch (type) {
    case "event":
      if (data?.title && data?.category && data?.city) {
        specificKeywords = [
          `${data.title} tickets`,
          `${data.category} events`,
          `${data.city} tickets`,
          `${data.category} ${data.city}`,
          `buy ${data.category} tickets`,
          `sell ${data.category} tickets`
        ];
      }
      break;
    case "search":
      if (data?.query) {
        specificKeywords = [
          `${data.query} tickets`,
          `buy ${data.query}`,
          `sell ${data.query}`,
          `${data.query} events`
        ];
      }
      break;
    case "category":
      if (data?.category) {
        specificKeywords = [
          `${data.category} tickets`,
          `${data.category} events`,
          `buy ${data.category} tickets`,
          `sell ${data.category} tickets`,
          `${data.category} marketplace`
        ];
      }
      break;
    case "selling":
      specificKeywords = [
        "sell tickets online",
        "sell concert tickets",
        "where to sell tickets",
        "how to sell tickets",
        "ticket selling platform",
        "sell my tickets"
      ];
      break;
    case "how-to":
      specificKeywords = [
        "how to sell concert tickets",
        "how to sell tickets online",
        "where to sell concert tickets",
        "ticket selling guide",
        "sell tickets safely"
      ];
      break;
  }

  return [...coreKeywords, ...specificKeywords].join(", ");
}

/**
 * Generate landing page SEO data for high-value target keywords
 */
export function generateLandingPageSEO(keyword: string, isGlobal: boolean = false): {
  title: string;
  description: string;
  keywords: string;
  structuredData: any;
} {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const brandName = isGlobal ? "TicketBazaar Global" : "TicketBazaar";
  
  const keywordMap: Record<string, {
    title: string;
    description: string;
    keywords: string[];
    structuredData: any;
  }> = {
    "ticketbazaar": {
      title: `${brandName} - ${isGlobal ? 'Global' : "India's"} Most Trusted Ticket Resale Platform | Sell & Buy Tickets Online`,
      description: `${brandName} is ${isGlobal ? 'the global' : "India's"} premier ticket resale marketplace. Sell concert tickets, sports tickets, and event tickets safely. Buy second hand tickets from verified sellers with secure transactions.`,
      keywords: ["ticketbazaar", "ticket bazaar", "sell tickets online", "buy tickets online", "ticket resale", "second hand tickets", "resale tickets", "concert tickets online"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": brandName,
        "description": `${isGlobal ? 'Global' : "India's"} secure ticket resale platform`,
        "url": baseUrl
      }
    },
    "sell-concert-tickets": {
      title: `Sell Concert Tickets Online | How to Sell Concert Tickets Safely | ${brandName}`,
      description: `Sell concert tickets online safely on ${brandName}. Learn how to sell concert tickets, where to sell concert tickets, and how do you sell concert tickets with our secure platform.`,
      keywords: ["sell concert tickets", "sell concert tickets online", "how to sell concert tickets", "where to sell concert tickets", "how do you sell concert tickets", "resell concert tickets online"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Concert Ticket Selling Service",
        "description": "Secure platform for selling concert tickets online",
        "provider": {
          "@type": "Organization",
          "name": brandName
        }
      }
    },
    "how-to-sell-tickets": {
      title: `How to Sell Tickets Online | Complete Guide to Selling Concert & Event Tickets | ${brandName}`,
      description: `Complete guide on how to sell tickets online safely. Learn how to sell concert tickets, how to sell football tickets, and where to sell tickets with ${brandName}'s secure platform.`,
      keywords: ["how to sell tickets online", "how to sell concert tickets", "how to sell football tickets", "where to sell tickets", "how do you sell concert tickets", "sell tickets online india"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Sell Tickets Online",
        "description": "Complete guide to selling concert and event tickets online safely"
      }
    },
    "resale-bazaar": {
      title: `Resale Bazaar - Buy & Sell Second Hand Tickets | Ticket Resale Marketplace | ${brandName}`,
      description: `${isGlobal ? 'Global' : "India's"} premier resale bazaar for second hand tickets. Buy and sell resale tickets safely. Trusted ticket resale marketplace for concerts, sports, and events.`,
      keywords: ["resale bazaar", "resale tickets", "resale ticket", "ticket resale", "second hand tickets", "sell my tickets", "ticket selling"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Marketplace",
        "name": "Resale Bazaar",
        "description": "Marketplace for buying and selling second hand tickets"
      }
    },
    "concert-tickets-online": {
      title: `Concert Tickets Online | Buy & Sell Concert Tickets | Resell Concert Tickets Online | ${brandName}`,
      description: `Find concert tickets online at ${brandName}. Buy from verified sellers or sell concert tickets online safely. Best platform to resell concert tickets online ${isGlobal ? 'worldwide' : 'in India'}.`,
      keywords: ["concert tickets online", "sell concert tickets online", "resell concert tickets online", "buy concert tickets", "concert ticket resale"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Concert Tickets",
        "description": "Online concert tickets from verified sellers"
      }
    },
    "second-hand-tickets": {
      title: `Second Hand Tickets - Buy & Sell Used Tickets Online | Best Deals | ${brandName}`,
      description: "Find the best deals on second hand tickets for concerts, sports, and events. Buy verified used tickets at discounted prices or sell your extra tickets safely.",
      keywords: ["second hand tickets", "second-hand tickets", "used tickets", "second hand ticket", "buy second hand tickets", "sell second hand tickets"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Second Hand Tickets",
        "description": "Marketplace for second hand and used tickets"
      }
    },
    "ticket-resale": {
      title: `Ticket Resale - Buy & Sell Tickets Online Safely | ${isGlobal ? 'Global' : "India's"} Trusted Platform | ${brandName}`,
      description: `${isGlobal ? 'Global' : "India's"} most trusted ticket resale platform. Buy and sell tickets for concerts, sports, and events safely. Secure transactions, verified sellers, instant transfers.`,
      keywords: ["ticket resale", "resale tickets", "resell tickets", "ticket resale platform", "sell tickets online", "buy resale tickets"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Ticket Resale Service",
        "description": "Secure platform for ticket resale transactions"
      }
    },
    "where-to-sell-tickets": {
      title: `Where to Sell Tickets | Where to Sell Concert Tickets | Best Places to Sell Tickets Online`,
      description: "Find the best places to sell tickets online. Learn where to sell concert tickets, where to sell tickets safely, and how to sell tickets with TicketBazaar's trusted platform.",
      keywords: ["where to sell tickets", "where to sell concert tickets", "sell tickets online", "sell concert tickets", "ticket selling platform"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Where to Sell Tickets",
        "description": "Guide to finding the best places to sell tickets online"
      }
    }
  };

  const data = keywordMap[keyword];
  if (!data) {
    // Default fallback
    return {
      title: isGlobal 
        ? "TicketBazaar - Global Event Ticket Discovery Platform"
        : "TicketBazaar - Sell Tickets Online | Buy Second Hand Tickets | India's Secure Resale Platform",
      description: isGlobal
        ? "Discover and connect with ticket buyers and sellers worldwide for concerts, sports, and entertainment. Global marketplace with verified sellers across 50+ countries."
        : "Buy and sell verified tickets for concerts, sports events, and festivals across India. Secure transactions with escrow protection on India's most trusted resale bazaar.",
      keywords: isGlobal 
        ? ["global tickets", "worldwide events", "international marketplace", "verified sellers", "secure transactions"].join(", ")
        : CORE_SEO_KEYWORDS.join(", "),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": brandName,
        "description": isGlobal ? "Global event ticket discovery platform" : "India's secure ticket resale platform"
      }
    };
  }

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords.join(", "),
    structuredData: data.structuredData
  };
}

/**
 * Generate hreflang links for international SEO
 */
export function generateHreflangLinks(basePath: string = ''): Record<string, string> {
  const path = basePath.startsWith('/') ? basePath : `/${basePath}`;
  
  return {
    "en": `https://ticketbazaar.global${path}`,
    "en-US": `https://ticketbazaar.global${path}`, 
    "en-GB": `https://uk.ticketbazaar.global${path}`,
    "en-AU": `https://au.ticketbazaar.global${path}`,
    "en-CA": `https://ca.ticketbazaar.global${path}`,
    "es": `https://es.ticketbazaar.global${path}`,
    "fr": `https://fr.ticketbazaar.global${path}`,
    "de": `https://de.ticketbazaar.global${path}`,
    "it": `https://it.ticketbazaar.global${path}`,
    "pt": `https://pt.ticketbazaar.global${path}`,
    "ja": `https://ja.ticketbazaar.global${path}`,
    "x-default": `https://ticketbazaar.global${path}`
  };
}

/**
 * Generate sitemap entries for SEO-optimized pages
 */
export function generateSitemapEntries(isGlobal: boolean = false): Array<{
  url: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  lastmod: string;
}> {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const currentDate = new Date().toISOString();

  const entries = [
    {
      url: baseUrl,
      changefreq: "daily" as const,
      priority: 1.0,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell`,
      changefreq: "weekly" as const,
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/events`,
      changefreq: "daily" as const,
      priority: 0.9,
      lastmod: currentDate
    }
  ];

  // Add India-specific pages
  if (!isGlobal) {
    entries.push(
      {
        url: `${baseUrl}/where-to-sell-concert-tickets`,
        changefreq: "weekly" as const,
        priority: 0.8,
        lastmod: currentDate
      },
      {
        url: `${baseUrl}/how-to-sell-tickets`,
        changefreq: "weekly" as const,
        priority: 0.8,
        lastmod: currentDate
      },
      {
        url: `${baseUrl}/resale-bazaar`,
        changefreq: "daily" as const,
        priority: 0.8,
        lastmod: currentDate
      },
      {
        url: `${baseUrl}/ticket-resale`,
        changefreq: "daily" as const,
        priority: 0.8,
        lastmod: currentDate
      },
      {
        url: `${baseUrl}/second-hand-tickets`,
        changefreq: "daily" as const,
        priority: 0.8,
        lastmod: currentDate
      },
      {
        url: `${baseUrl}/concert-tickets-online`,
        changefreq: "daily" as const,
        priority: 0.8,
        lastmod: currentDate
      }
    );
  }

  return entries;
}

/**
 * Generate robots.txt content optimized for SEO
 */
export function generateRobotsTxt(isGlobal: boolean = false): string {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  
  let content = `User-agent: *
Allow: /

# High-priority pages for search engines
Allow: /sell
Allow: /events
Allow: /search`;

  if (!isGlobal) {
    content += `
Allow: /sell-tickets
Allow: /sell-tickets-online  
Allow: /sell-concert-tickets
Allow: /sell-concert-tickets-online
Allow: /where-to-sell-tickets
Allow: /where-to-sell-concert-tickets
Allow: /how-to-sell-tickets
Allow: /resale-bazaar
Allow: /ticket-resale
Allow: /resale-tickets
Allow: /second-hand-tickets
Allow: /concert-tickets-online`;
  }

  content += `

# Disallow admin and internal pages
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/
Disallow: /node_modules/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for polite crawling
Crawl-delay: 1`;

  return content;
}

/**
 * Generate comprehensive structured data for homepage
 */
export function generateHomepageStructuredData(isGlobal: boolean = false) {
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const organization = generateOrganizationStructuredData(isGlobal);
  
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ticket Bazaar",
    "url": baseUrl,
    "description": isGlobal 
      ? "Global event ticket discovery and resale platform"
      : "India's secure ticket resale marketplace",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return [organization, website];
}

/**
 * Generate comprehensive meta tags for any page
 */
export function generateComprehensiveMetaTags(pageData: {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image?: string;
  type?: string;
}, isGlobal: boolean = false): string {
  const { title, description, keywords, url, image = "/images/ticket-bazaar-social.png", type = "website" } = pageData;
  const baseUrl = isGlobal ? "https://ticketbazaar.global" : "https://ticketbazaar.co.in";
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:image" content="${fullImageUrl}" />
    <meta property="og:site_name" content="Ticket Bazaar" />
    <meta property="og:locale" content="${isGlobal ? 'en_US' : 'en_IN'}" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${fullImageUrl}" />
    <meta name="twitter:site" content="@ticketbazaar" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="author" content="TicketBazaar" />
    <meta httpEquiv="content-language" content="${isGlobal ? 'en' : 'en-in'}" />
    <meta name="geo.region" content="${isGlobal ? 'GLOBAL' : 'IN'}" />
    <meta name="geo.placename" content="${isGlobal ? 'Global' : 'India'}" />
  `.trim();
}
