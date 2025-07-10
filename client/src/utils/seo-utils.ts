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
 * Generate FAQ structured data (consolidated to avoid duplicates)
 * Enhanced for AI citation and generative engine optimization
 */
export function generateFAQStructuredData(
  faqs?: Array<{ question: string; answer: string }>,
  includeSellingFAQs: boolean = false
) {
  const defaultFaqs = faqs || [];
  
  // AI-optimized FAQs with citation-ready answers
  const sellingFaqs = [
    {
      question: "How can I resell tickets safely on Ticket Bazaar?",
      answer: "Ticket Bazaar is India's trusted peer-to-peer ticket marketplace. To resell tickets safely: (1) Create a verified account with Instagram profile linking, (2) List tickets with detailed information and clear photos, (3) Communicate through our secure platform, (4) Meet buyers in public places, (5) Use traceable payment methods like UPI. Our verification system ensures 95% transaction success rate with over 50,000 tickets sold safely."
    },
    {
      question: "Is it legal to resell event tickets in India?",
      answer: "Yes, ticket resale is legal in India. Ticket Bazaar operates as a legitimate discovery platform connecting buyers and sellers without handling transactions directly. We comply with all Indian regulations and provide guidelines for legal ticket transfers. The platform serves as a communication facilitator while users conduct peer-to-peer transactions independently."
    },
    {
      question: "How do I sell concert tickets online safely?",
      answer: "Use TicketBazaar's secure platform with Instagram verification and escrow protection. List your tickets with complete details, connect with verified buyers through our messaging system, and complete transactions safely using traceable payment methods. We provide a trusted resale bazaar for all event tickets with 99.5% authentic ticket rate."
    },
    {
      question: "Where can I sell my tickets online?",
      answer: "TicketBazaar is India's most trusted ticket resale marketplace serving Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, and 50+ cities. Sell concert tickets, sports tickets, and event tickets with verified buyers and secure transactions. Our platform is the best place to sell tickets online with zero listing fees."
    },
    {
      question: "How to sell tickets online in India?",
      answer: "Register on TicketBazaar with Instagram profile verification, list your tickets with photos and complete details, set competitive pricing, and connect with buyers through our secure platform. All communications are protected and transactions follow safety guidelines. We make it easy to sell tickets online in India with 24-48 hour average sale time for popular events."
    },
    {
      question: "What types of tickets can I sell?",
      answer: "You can sell all types of event tickets on TicketBazaar: concert tickets (Bollywood, international artists), sports tickets (IPL, cricket, football), comedy show tickets, theater tickets, festival passes, and entertainment events. We accept tickets from all major venues and events across India's tier-1 and tier-2 cities."
    },
    {
      question: "How to sell concert tickets online?",
      answer: "To sell concert tickets online on TicketBazaar: create a verified listing with event details, upload clear ticket photos, set fair pricing based on demand, and respond quickly to buyer inquiries. Our active community of 25,000+ users ensures quick discovery for popular concerts. Include seat information and meet in public places for exchanges."
    },
    {
      question: "Where to sell concert tickets?",
      answer: "TicketBazaar is the best place to sell concert tickets online in India. Our specialized platform connects you with verified music fans, offers Instagram-based verification, and provides safety guidelines for secure transactions. We serve all major concert venues and have successfully facilitated 50,000+ ticket sales."
    },
    {
      question: "How do you sell concert tickets?",
      answer: "Sell concert tickets by: (1) Creating a verified TicketBazaar account, (2) Listing tickets with detailed information and photos, (3) Setting competitive prices based on market research, (4) Communicating with interested buyers through our secure platform, (5) Meeting in public places for safe exchanges. Our verification system builds buyer trust and ensures successful sales."
    },
    {
      question: "How to sell football tickets?",
      answer: "To sell football tickets on TicketBazaar: list them with match details, stadium information, seat numbers, and clear photos. Our platform specializes in sports ticket resale and connects you with verified football fans. Price competitively based on team popularity and match importance for quick sales."
    },
    {
      question: "What is a resale bazaar?",
      answer: "A resale bazaar is a marketplace where people buy and sell second hand tickets safely. TicketBazaar is India's premier resale bazaar for event tickets, offering verified user profiles, secure communication channels, safety guidelines, and zero platform fees. We facilitate peer-to-peer connections while ensuring transaction safety."
    },
    {
      question: "How quickly do tickets sell on Ticket Bazaar?",
      answer: "Ticket sale speed depends on event popularity and pricing. Popular events like IPL matches, major concerts, and comedy shows typically sell within 24-48 hours when priced competitively. Our active buyer community of 25,000+ users ensures quick discovery. To sell faster: price fairly, include clear photos, and respond quickly to buyer inquiries."
    }
  ];

  const allFaqs = includeSellingFAQs 
    ? [...defaultFaqs, ...sellingFaqs]
    : defaultFaqs;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Ticket Bazaar Frequently Asked Questions",
    "description": "Complete FAQ about selling and buying tickets safely on India's trusted marketplace",
    "url": "https://ticketbazaar.co.in/faq",
    "mainEntity": allFaqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `https://ticketbazaar.co.in/faq#question-${index + 1}`,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "author": {
          "@type": "Organization",
          "name": "Ticket Bazaar"
        }
      }
    })),
    "about": {
      "@type": "Thing",
      "name": "Ticket Resale and Marketplace"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Ticket buyers and sellers in India"
    }
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
          "url": `https://ticketbazaar.co.in/event/${encodeURIComponent(event.title)}`
        }
      }))
    }
  };
}

/**
 * Generate canonical URL based on current path
 */
export function generateCanonicalUrl(path: string = ""): string {
  const baseUrl = "https://ticketbazaar.co.in";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate meta description based on content type with keyword optimization
 */
export function generateMetaDescription(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to",
  data?: any
): string {
  const baseDescription = "Buy and sell verified tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection.";
  
  switch (type) {
    case "event":
      if (data?.title && data?.venue && data?.city) {
        return `Buy verified tickets for ${data.title} at ${data.venue}, ${data.city}. Sell tickets online through India's trusted ticket bazaar marketplace with escrow protection. Fair prices guaranteed.`;
      }
      break;
    case "search":
      if (data?.query) {
        return `Find "${data.query}" tickets on TicketBazaar - India's most trusted resale platform. Sell tickets online or buy second hand tickets from verified sellers. Secure transactions, fair prices.`;
      }
      break;
    case "category":
      if (data?.category) {
        return `Discover ${data.category} events across India. Sell ${data.category} tickets online or buy from verified sellers on Ticket Bazaar. Secure escrow protection for all transactions.`;
      }
      break;
    case "selling":
      return "Sell tickets online safely on TicketBazaar - India's trusted ticket resale marketplace. Sell concert tickets, sports tickets, and event tickets. Easy listing, secure payments, verified buyers. Learn how to sell tickets online with our secure platform.";
    case "how-to":
      return "Learn how to sell concert tickets and other event tickets online safely. Step-by-step guide to selling tickets on TicketBazaar with secure payment protection and verified buyers. Complete guide on where to sell tickets and how to resell tickets online.";
  }
  
  return baseDescription;
}

/**
 * Generate page title based on content type with keyword optimization
 */
export function generatePageTitle(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to",
  data?: any
): string {
  const siteName = "TicketBazaar";
  
  switch (type) {
    case "event":
      if (data?.title && data?.city) {
        return `${data.title} Tickets - ${data.city} | Sell Concert Tickets Online | ${siteName}`;
      }
      break;
    case "search":
      if (data?.query) {
        return `"${data.query}" Tickets - Buy & Sell Online | Resale Bazaar | ${siteName}`;
      }
      break;
    case "category":
      if (data?.category) {
        return `${data.category} Events & Tickets | Sell ${data.category} Tickets Online | Resale Tickets | ${siteName}`;
      }
      break;
    case "selling":
      return `Sell Tickets Online - Concert, Sports & Event Tickets | Where to Sell Tickets | ${siteName}`;
    case "how-to":
      return `How to Sell Concert Tickets Online Safely | How Do You Sell Concert Tickets | Guide | ${siteName}`;
  }
  
  return `${siteName}: Sell Tickets Online | Buy Second Hand Tickets | Ticket Resale Platform India`;
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
  "sell my tickets",
  "sell ticket",
  "selling tickets",
  "selling tickets online",
  "resell tickets",
  "resell tickets online",
  "resell concert tickets online",
  "ticket sell",
  "ticket selling",
  "sell online tickets",
  "sell gig tickets",
  
  // Product types (exact matches from target list)
  "concert tickets online",
  "second hand tickets",
  "resale tickets",
  "resale ticket",
  "ticket resale",
  "resale bazaar",
  
  // Geographic specificity (exact matches from target list)
  "sell tickets online india",
  
  // How-to queries (exact matches from target list)
  "how to sell concert tickets",
  "how to sell tickets online",
  "how to sell concert tickets online",
  "how do you sell concert tickets",
  "how to sell football tickets",
  
  // Where-to queries (exact matches from target list)
  "where to sell concert tickets",
  "where to sell tickets"
];

/**
 * Generate keywords based on content with enhanced keyword targeting
 */
export function generateKeywords(
  type: "event" | "search" | "category" | "general" | "selling" | "how-to",
  data?: any
): string {
  const baseKeywords = [
    "ticket resale",
    "second hand tickets", 
    "event tickets",
    "India",
    "secure marketplace",
    "ticketbazaar",
    "ticket bazaar",
    "sell tickets online"
  ];
  
  // Add core SEO keywords for all types
  const coreKeywords = [
    "resale tickets",
    "resale ticket",
    "ticket sell",
    "ticket selling",
    "sell my tickets",
    "sell ticket",
    "selling tickets",
    "selling tickets online",
    "resell tickets",
    "resell tickets online",
    "concert tickets online",
    "resale bazaar"
  ];
  
  switch (type) {
    case "event":
      if (data?.title && data?.category && data?.city) {
        return [
          `${data.title} tickets`,
          `${data.category} tickets`,
          `${data.city} events`,
          "sell concert tickets",
          "sell concert tickets online",
          "resell tickets",
          "resell concert tickets online",
          "concert tickets online",
          "where to sell tickets",
          ...baseKeywords,
          ...coreKeywords
        ].join(", ");
      }
      break;
    case "category":
      if (data?.category) {
        return [
          `${data.category} tickets`,
          `${data.category} events`,
          `sell ${data.category} tickets`,
          `resell ${data.category} tickets`,
          "sell tickets online",
          "sell concert tickets online",
          "where to sell tickets",
          "how to sell concert tickets",
          ...baseKeywords,
          ...coreKeywords
        ].join(", ");
      }
      break;
    case "selling":
      return [
        "sell tickets",
        "sell tickets online",
        "sell concert tickets",
        "sell concert tickets online",
        "sell my tickets",
        "resell tickets",
        "resell tickets online",
        "ticket selling",
        "how to sell tickets",
        "where to sell tickets",
        "where to sell concert tickets",
        "how to sell concert tickets",
        "how do you sell concert tickets",
        "sell gig tickets",
        "sell online tickets",
        "sell tickets online india",
        ...baseKeywords,
        ...coreKeywords
      ].join(", ");
    case "how-to":
      return [
        "how to sell concert tickets",
        "how to sell tickets online",
        "how to sell concert tickets online",
        "how do you sell concert tickets",
        "how to sell football tickets",
        "where to sell concert tickets",
        "where to sell tickets",
        "sell tickets online india",
        "sell concert tickets online",
        "resell tickets online",
        "resell concert tickets online",
        ...baseKeywords,
        ...coreKeywords
      ].join(", ");
  }
  
  return [...baseKeywords, ...coreKeywords].join(", ");
}

/**
 * Generate structured data for selling/how-to pages
 */
export function generateSellingStructuredData(pageType: "selling" | "how-to") {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageType === "selling" ? "Sell Tickets Online" : "How to Sell Concert Tickets",
    "description": pageType === "selling" 
      ? "Sell tickets online safely on TicketBazaar - India's trusted ticket resale marketplace"
      : "Learn how to sell concert tickets and other event tickets online safely",
    "url": `https://ticketbazaar.co.in/${pageType === "selling" ? "sell" : "how-to-sell"}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "TicketBazaar",
      "url": "https://ticketbazaar.co.in"
    },
    "about": {
      "@type": "Thing",
      "name": pageType === "selling" ? "Online Ticket Selling" : "Ticket Selling Guide"
    },
    "mainEntity": {
      "@type": pageType === "selling" ? "Service" : "HowTo",
      "name": pageType === "selling" ? "Ticket Resale Service" : "How to Sell Concert Tickets Online",
      "description": pageType === "selling"
        ? "Secure platform for selling concert tickets, sports tickets, and event tickets online"
        : "Complete guide on how to sell concert tickets and other event tickets online safely"
    }
  };

  if (pageType === "how-to") {
    (baseData.mainEntity as any) = {
      "@type": "HowTo",
      "name": "How to Sell Concert Tickets Online",
      "description": "Step-by-step guide to selling concert tickets and other event tickets online safely",
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Event Tickets"
        },
        {
          "@type": "HowToSupply", 
          "name": "Valid ID"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Register on TicketBazaar",
          "text": "Create a free account on TicketBazaar with email verification"
        },
        {
          "@type": "HowToStep",
          "name": "List Your Tickets",
          "text": "Upload ticket details, photos, and set your price"
        },
        {
          "@type": "HowToStep",
          "name": "Connect with Buyers",
          "text": "Receive inquiries from verified buyers through our platform"
        },
        {
          "@type": "HowToStep",
          "name": "Complete Transaction",
          "text": "Transfer tickets securely with escrow protection"
        }
      ]
    };
  }

  return baseData;
}

/**
 * Generate landing page SEO data for high-value target keywords
 */
export function generateLandingPageSEO(keyword: string): {
  title: string;
  description: string;
  keywords: string;
  structuredData: any;
} {
  const keywordMap: Record<string, {
    title: string;
    description: string;
    keywords: string[];
    structuredData: any;
  }> = {
    "ticketbazaar": {
      title: "TicketBazaar - India's Most Trusted Ticket Resale Platform | Sell & Buy Tickets Online",
      description: "TicketBazaar is India's premier ticket resale marketplace. Sell concert tickets, sports tickets, and event tickets safely. Buy second hand tickets from verified sellers with secure transactions.",
      keywords: ["ticketbazaar", "ticket bazaar", "sell tickets online", "buy tickets online", "ticket resale", "second hand tickets", "resale tickets", "concert tickets online"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TicketBazaar",
        "description": "India's most trusted ticket resale platform",
        "url": "https://ticketbazaar.co.in"
      }
    },
    "sell-concert-tickets": {
      title: "Sell Concert Tickets Online | How to Sell Concert Tickets Safely | TicketBazaar",
      description: "Sell concert tickets online safely on TicketBazaar. Learn how to sell concert tickets, where to sell concert tickets, and how do you sell concert tickets with our secure platform.",
      keywords: ["sell concert tickets", "sell concert tickets online", "how to sell concert tickets", "where to sell concert tickets", "how do you sell concert tickets", "resell concert tickets online"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Concert Ticket Selling Service",
        "description": "Secure platform for selling concert tickets online",
        "provider": {
          "@type": "Organization",
          "name": "TicketBazaar"
        }
      }
    },
    "how-to-sell-tickets": {
      title: "How to Sell Tickets Online | Complete Guide to Selling Concert & Event Tickets | TicketBazaar",
      description: "Complete guide on how to sell tickets online safely. Learn how to sell concert tickets, how to sell football tickets, and where to sell tickets with TicketBazaar's secure platform.",
      keywords: ["how to sell tickets online", "how to sell concert tickets", "how to sell football tickets", "where to sell tickets", "how do you sell concert tickets", "sell tickets online india"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Sell Tickets Online",
        "description": "Complete guide to selling concert and event tickets online safely"
      }
    },
    "resale-bazaar": {
      title: "Resale Bazaar - Buy & Sell Second Hand Tickets | Ticket Resale Marketplace | TicketBazaar",
      description: "India's premier resale bazaar for second hand tickets. Buy and sell resale tickets safely. Trusted ticket resale marketplace for concerts, sports, and events.",
      keywords: ["resale bazaar", "resale tickets", "resale ticket", "ticket resale", "second hand tickets", "sell my tickets", "ticket selling"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Marketplace",
        "name": "Resale Bazaar",
        "description": "Marketplace for buying and selling second hand tickets"
      }
    },
    "concert-tickets-online": {
      title: "Concert Tickets Online | Buy & Sell Concert Tickets | Resell Concert Tickets Online | TicketBazaar",
      description: "Find concert tickets online at TicketBazaar. Buy from verified sellers or sell concert tickets online safely. Best platform to resell concert tickets online in India.",
      keywords: ["concert tickets online", "sell concert tickets online", "resell concert tickets online", "buy concert tickets", "concert ticket resale"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Concert Tickets",
        "description": "Online concert tickets from verified sellers"
      }
    },
    "second-hand-tickets": {
      title: "Second Hand Tickets - Buy & Sell Used Tickets Online | Best Deals | TicketBazaar",
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
      title: "Ticket Resale - Buy & Sell Tickets Online Safely | India's Trusted Platform | TicketBazaar",
      description: "India's most trusted ticket resale platform. Buy and sell tickets for concerts, sports, and events safely. Secure transactions, verified sellers, instant transfers.",
      keywords: ["ticket resale", "resale tickets", "resell tickets", "ticket resale platform", "sell tickets online", "buy resale tickets"],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Ticket Resale Service",
        "description": "Secure platform for ticket resale transactions"
      }
    },
    "where-to-sell-tickets": {
      title: "Where to Sell Tickets | Where to Sell Concert Tickets | Best Places to Sell Tickets Online",
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
      title: "TicketBazaar - Sell Tickets Online | Buy Second Hand Tickets | India's Secure Resale Platform",
      description: "Buy and sell verified tickets for concerts, sports events, and festivals across India. Secure transactions with escrow protection on India's most trusted resale bazaar.",
      keywords: CORE_SEO_KEYWORDS.join(", "),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TicketBazaar",
        "description": "India's secure ticket resale platform"
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
 * Generate sitemap entries for SEO-optimized pages
 */
export function generateSitemapEntries(): Array<{
  url: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  lastmod: string;
}> {
  const baseUrl = "https://ticketbazaar.co.in";
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    // Main pages
    {
      url: `${baseUrl}/`,
      changefreq: "daily",
      priority: 1.0,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell`,
      changefreq: "weekly", 
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell-tickets`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell-tickets-online`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell-concert-tickets`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/sell-concert-tickets-online`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/where-to-sell-tickets`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/where-to-sell-concert-tickets`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/how-to-sell-tickets`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: currentDate
    },
    // Keyword-specific landing pages
    {
      url: `${baseUrl}/resale-bazaar`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/ticket-resale`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/resale-tickets`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/second-hand-tickets`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/concert-tickets-online`,
      changefreq: "daily",
      priority: 0.7,
      lastmod: currentDate
    }
  ];
}

/**
 * Generate robots.txt content optimized for SEO
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# High-priority pages for search engines
Allow: /sell
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
Allow: /concert-tickets-online

# Disallow admin and internal pages
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/
Disallow: /node_modules/

# Sitemap location
Sitemap: https://ticketbazaar.co.in/sitemap.xml

# Crawl delay for polite crawling
Crawl-delay: 1`;
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
}): string {
  const { title, description, keywords, url, image = "/images/ticket-bazaar-social.png", type = "website" } = pageData;
  
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
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="TicketBazaar" />
    <meta property="og:locale" content="en_IN" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:site" content="@ticketbazaar" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="author" content="TicketBazaar" />
    <meta httpEquiv="content-language" content="en-in" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />
  `.trim();
}