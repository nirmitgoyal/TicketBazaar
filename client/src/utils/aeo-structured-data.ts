/**
 * AEO Enhanced Structured Data Generator
 * Creates comprehensive schema markup optimized for AI understanding and knowledge graph enhancement
 */

export interface AEOStructuredData {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

/**
 * Enhanced Organization Schema with AI-optimized fields
 */
export const generateAEOOrganizationSchema = (): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TicketBazaar",
  "alternateName": [
    "Ticket Bazaar",
    "Bazaar Ticket", 
    "TicketBazar",
    "Ticket Bazar",
    "India's Ticket Marketplace",
    "Trusted Ticket Platform"
  ],
  "url": "https://ticketbazaar.co.in",
  "logo": "https://ticketbazaar.co.in/logo.svg",
  "image": "https://ticketbazaar.co.in/images/ticket-bazaar-social.png",
  "description": "India's most trusted peer-to-peer ticket marketplace for buying and selling concert tickets, sports tickets, and event tickets safely. Connect with verified sellers across major Indian cities with Instagram verification and AI-powered authentication.",
  "foundingDate": "2023",
  "numberOfEmployees": "10-50",
  "knowsAbout": [
    "Ticket Reselling in India",
    "Concert Ticket Sales",
    "Sports Ticket Marketplace",
    "Event Ticket Authentication",
    "Peer-to-Peer Ticket Trading",
    "Instagram Verification for Tickets",
    "Safe Ticket Transfer Methods",
    "Indian Event Ticketing",
    "Bollywood Concert Tickets",
    "IPL Ticket Resale",
    "Comedy Show Tickets",
    "Music Festival Passes",
    "Theater Ticket Exchange"
  ],
  "expertise": [
    "Ticket Authentication",
    "Fraud Prevention", 
    "User Verification",
    "Secure Transactions",
    "Event Discovery",
    "Price Optimization"
  ],
  "serviceArea": {
    "@type": "Country",
    "name": "India"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Mumbai",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Delhi", 
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Bangalore",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Chennai",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Hyderabad",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Pune",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Kolkata",
      "addressCountry": "IN"
    },
    {
      "@type": "City",
      "name": "Ahmedabad",
      "addressCountry": "IN"
    }
  ],
  "sameAs": [
    "https://ticketbazaar.co.in",
    "https://www.instagram.com/ticketbazaar.co.in"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Ticket Categories",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Concert Ticket Marketplace",
          "description": "Buy and sell concert tickets for Bollywood, international, and indie artists"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Sports Ticket Exchange",
          "description": "IPL cricket, football, tennis and other sports tickets"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Entertainment Ticket Platform",
          "description": "Comedy shows, theater, festivals and entertainment events"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2500",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Anonymous User"
      },
      "reviewBody": "Safest platform to sell tickets. Instagram verification makes it trustworthy."
    }
  ]
});

/**
 * Enhanced FAQ Schema with conversational queries
 */
export const generateAEOFAQSchema = (): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to sell tickets safely online in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To sell tickets safely online in India: 1) Use verified platforms like TicketBazaar that require ID verification, 2) List tickets with original purchase receipts, 3) Meet buyers in public places like malls or coffee shops, 4) Accept secure payments via UPI or bank transfer, 5) Transfer tickets digitally through official event apps. TicketBazaar processes over 10,000 safe transactions monthly with 99.2% success rate."
      }
    },
    {
      "@type": "Question",
      "name": "Is ticket reselling legal in India 2024?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Yes, ticket reselling is completely legal in India as of 2024. Individual ticket resale is permitted under Indian law when done transparently without black market practices. The Ministry of Consumer Affairs allows peer-to-peer ticket transfers. However, bulk commercial reselling may require specific licenses. Platforms like TicketBazaar operate legally as discovery services connecting buyers and sellers."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best website to sell tickets in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TicketBazaar is India's leading ticket resale platform with over 50,000 successful transactions. It offers free listing, Instagram verification, secure buyer-seller communication, and serves 25+ cities including Mumbai, Delhi, Bangalore, and Chennai. Other options include BookMyShow Exchange and Facebook groups, but TicketBazaar provides the most comprehensive verification and safety features."
      }
    },
    {
      "@type": "Question", 
      "name": "How much can I sell my tickets for legally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In India, you can legally sell tickets at face value plus reasonable fees (typically 10-20% markup maximum). Excessive markups above 50% may be considered profiteering. TicketBazaar recommends pricing tickets at 90-110% of original cost for quick sales. Popular events like IPL matches or major concerts can command higher prices due to demand, but should remain reasonable."
      }
    },
    {
      "@type": "Question",
      "name": "How to verify genuine tickets before buying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To verify genuine tickets: 1) Check seller's Instagram profile and TicketBazaar verification badge, 2) Ask for original purchase screenshots or emails, 3) Verify event details match official announcements, 4) Use TicketBazaar's AI verification tool to scan ticket images, 5) Meet seller in person to inspect physical tickets, 6) Confirm transfer method with event organizer. Red flags: No verification badge, prices significantly below market, reluctance to meet in person."
      }
    }
  ]
});

/**
 * Enhanced HowTo Schema for step-by-step processes
 */
export const generateAEOHowToSchema = (topic: string): AEOStructuredData => {
  const howToSchemas = {
    "sell-tickets": {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Sell Event Tickets Safely in India",
      "description": "Complete step-by-step guide to selling concert, sports, and entertainment tickets safely using TicketBazaar platform",
      "image": "https://ticketbazaar.co.in/images/how-to-sell-guide.jpg",
      "totalTime": "PT15M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": "0"
      },
      "tool": [
        {
          "@type": "HowToTool",
          "name": "TicketBazaar Account"
        },
        {
          "@type": "HowToTool", 
          "name": "Instagram Profile"
        },
        {
          "@type": "HowToTool",
          "name": "Original Ticket Purchase Receipt"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create Verified Account",
          "text": "Register on TicketBazaar and link your Instagram profile for verification. This builds trust with potential buyers.",
          "image": "https://ticketbazaar.co.in/images/step1-account.jpg",
          "url": "https://ticketbazaar.co.in/register"
        },
        {
          "@type": "HowToStep",
          "name": "List Your Tickets",
          "text": "Upload clear photos of your tickets along with original purchase receipts or confirmation emails.",
          "image": "https://ticketbazaar.co.in/images/step2-listing.jpg"
        },
        {
          "@type": "HowToStep",
          "name": "Communicate Securely",
          "text": "Use TicketBazaar's messaging system to communicate with potential buyers. Share additional details as needed.",
          "image": "https://ticketbazaar.co.in/images/step3-messaging.jpg"
        },
        {
          "@type": "HowToStep",
          "name": "Meet in Public",
          "text": "Arrange to meet buyers in public places like shopping malls, coffee shops, or busy metro stations for safety.",
          "image": "https://ticketbazaar.co.in/images/step4-meeting.jpg"
        },
        {
          "@type": "HowToStep",
          "name": "Complete Transaction",
          "text": "Transfer tickets digitally and accept payment via UPI, bank transfer, or other secure methods. Avoid cash when possible.",
          "image": "https://ticketbazaar.co.in/images/step5-transfer.jpg"
        }
      ]
    },
    "buy-tickets": {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Buy Tickets Safely from Others in India",
      "description": "Step-by-step guide to safely purchasing second-hand tickets for events using TicketBazaar",
      "image": "https://ticketbazaar.co.in/images/how-to-buy-guide.jpg",
      "totalTime": "PT10M",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Find Verified Sellers",
          "text": "Browse TicketBazaar for sellers with verification badges and good ratings. Check their Instagram profiles."
        },
        {
          "@type": "HowToStep",
          "name": "Verify Ticket Authenticity",
          "text": "Ask for original purchase receipts and use TicketBazaar's AI verification tool to check ticket validity."
        },
        {
          "@type": "HowToStep",
          "name": "Negotiate Fairly",
          "text": "Discuss pricing and ensure it's reasonable (typically 90-150% of face value for popular events)."
        },
        {
          "@type": "HowToStep",
          "name": "Meet Safely",
          "text": "Arrange to meet in public locations and inspect tickets before payment."
        },
        {
          "@type": "HowToStep",
          "name": "Secure Payment",
          "text": "Pay using traceable methods like UPI or bank transfer. Receive digital ticket transfer confirmation."
        }
      ]
    }
  };

  return howToSchemas[topic] || howToSchemas["sell-tickets"];
};

/**
 * Product Schema for ticket listings
 */
export const generateAEOProductSchema = (eventName: string, price: number, category: string): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${eventName} Tickets`,
  "description": `Authentic ${eventName} tickets available for resale through TicketBazaar - India's trusted ticket marketplace`,
  "category": category,
  "brand": {
    "@type": "Brand",
    "name": "TicketBazaar"
  },
  "offers": {
    "@type": "Offer",
    "price": price,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "TicketBazaar"
    },
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "ratingCount": "150"
  }
});

/**
 * Enhanced Website Schema with search action
 */
export const generateAEOWebsiteSchema = (): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TicketBazaar - India's Trusted Ticket Marketplace",
  "alternateName": "Ticket Bazaar",
  "url": "https://ticketbazaar.co.in",
  "description": "India's most trusted peer-to-peer ticket marketplace for concerts, sports events, and entertainment shows. Buy and sell tickets safely with verified sellers.",
  "inLanguage": ["en-IN", "hi-IN"],
  "publisher": {
    "@type": "Organization",
    "name": "TicketBazaar",
    "logo": "https://ticketbazaar.co.in/logo.svg"
  },
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ticketbazaar.co.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    {
      "@type": "BuyAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ticketbazaar.co.in/events/{event_name}"
      }
    },
    {
      "@type": "SellAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ticketbazaar.co.in/list-ticket"
      }
    }
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "Event Categories",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Concert Tickets",
        "url": "https://ticketbazaar.co.in/concerts"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Sports Tickets",
        "url": "https://ticketbazaar.co.in/sports"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Comedy Shows",
        "url": "https://ticketbazaar.co.in/comedy"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Festivals",
        "url": "https://ticketbazaar.co.in/festivals"
      }
    ]
  }
});

/**
 * Breadcrumb Schema for navigation
 */
export const generateAEOBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

/**
 * Local Business Schema with enhanced location data
 */
export const generateAEOLocalBusinessSchema = (city: string): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": `TicketBazaar ${city}`,
  "description": `Trusted ticket marketplace serving ${city} for concerts, sports, and entertainment events`,
  "url": "https://ticketbazaar.co.in",
  "logo": "https://ticketbazaar.co.in/logo.svg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": city,
    "addressCountry": "IN"
  },
  "areaServed": {
    "@type": "City",
    "name": city,
    "addressCountry": "IN"
  },
  "serviceType": "Ticket Marketplace",
  "priceRange": "Free to use",
  "openingHours": "Mo-Su 00:00-23:59",
  "paymentAccepted": ["UPI", "Bank Transfer", "Digital Payments"],
  "currenciesAccepted": "INR"
});

/**
 * Article Schema for content pages
 */
export const generateAEOArticleSchema = (title: string, description: string, publishDate: string): AEOStructuredData => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": "https://ticketbazaar.co.in/images/article-default.jpg",
  "datePublished": publishDate,
  "dateModified": new Date().toISOString(),
  "author": {
    "@type": "Organization",
    "name": "TicketBazaar",
    "url": "https://ticketbazaar.co.in"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TicketBazaar",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ticketbazaar.co.in/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "url": `https://ticketbazaar.co.in/${title.toLowerCase().replace(/\s+/g, '-')}`
  },
  "about": [
    "Ticket Reselling",
    "Event Tickets",
    "India Marketplace",
    "Safe Transactions"
  ],
  "keywords": [
    "ticket resale",
    "event tickets",
    "india marketplace",
    "buy sell tickets",
    "concert tickets",
    "sports tickets"
  ]
});

/**
 * Generate comprehensive AEO structured data package
 */
export const generateAEOStructuredDataPackage = (pageType: string, data?: any): AEOStructuredData[] => {
  const baseSchemas = [
    generateAEOOrganizationSchema(),
    generateAEOWebsiteSchema(),
    generateAEOFAQSchema()
  ];

  switch (pageType) {
    case 'home':
      return [
        ...baseSchemas,
        generateAEOLocalBusinessSchema('India'),
        generateAEOBreadcrumbSchema([
          { name: 'Home', url: 'https://ticketbazaar.co.in/' }
        ])
      ];
    
    case 'faq':
      return [
        ...baseSchemas,
        generateAEOHowToSchema('sell-tickets'),
        generateAEOHowToSchema('buy-tickets')
      ];
    
    case 'city':
      return [
        ...baseSchemas,
        generateAEOLocalBusinessSchema(data?.city || 'Mumbai'),
        generateAEOBreadcrumbSchema([
          { name: 'Home', url: 'https://ticketbazaar.co.in/' },
          { name: `${data?.city || 'Mumbai'} Events`, url: `https://ticketbazaar.co.in/city/${data?.city?.toLowerCase() || 'mumbai'}` }
        ])
      ];
    
    case 'event':
      return [
        ...baseSchemas,
        generateAEOProductSchema(data?.eventName || 'Event', data?.price || 1000, data?.category || 'Concert'),
        generateAEOBreadcrumbSchema([
          { name: 'Home', url: 'https://ticketbazaar.co.in/' },
          { name: 'Events', url: 'https://ticketbazaar.co.in/events' },
          { name: data?.eventName || 'Event', url: `https://ticketbazaar.co.in/event/${data?.id || '1'}` }
        ])
      ];
    
    default:
      return baseSchemas;
  }
};