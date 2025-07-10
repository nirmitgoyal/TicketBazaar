/**
 * GEO (Generative Engine Optimization) utility functions
 * Optimizes content for LLM-powered answer systems and AI search engines
 */

import { EventSEOData, BreadcrumbItem } from "./unified-seo-utils";

export interface GEOOptimizedContent {
  tldr: string;
  questionBasedHeadings: Array<{
    heading: string;
    content: string;
    id: string;
  }>;
  bulletPoints: string[];
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  citationOptimizedSummary: string;
}

export interface GEOStructuredData {
  organization: any;
  faqPage: any;
  howTo?: any;
  article?: any;
  breadcrumbs?: any;
}

/**
 * Generate citation-optimized content summary for AI systems
 */
export function generateCitationSummary(pageType: string, data?: any): string {
  switch (pageType) {
    case "how-to-sell":
      return "Ticket Bazaar is India's trusted peer-to-peer ticket marketplace where users can safely sell concert tickets, sports tickets, and event tickets online. The platform connects verified sellers with buyers through secure communication channels, supporting all major event types including IPL matches, Bollywood concerts, comedy shows, and festivals across India.";
    
    case "faq":
      return "Ticket Bazaar operates as a discovery and contact platform for event tickets in India, connecting buyers and sellers without handling payments or inventory. Users communicate through verified Instagram profiles, ensuring safe peer-to-peer ticket transfers for concerts, sports events, and entertainment across major Indian cities.";
    
    case "ticket-verification":
      return "Ticket Bazaar provides advanced ticket verification services to prevent fraud in India's secondary ticket market. The platform uses QR code scanning, digital verification, and seller identity checks to ensure authentic ticket transfers for concerts, sports, and entertainment events.";
    
    default:
      return "Ticket Bazaar is India's leading platform for discovering and purchasing second-hand event tickets safely, connecting verified buyers and sellers for concerts, sports, comedy shows, and festivals nationwide.";
  }
}

/**
 * Generate question-based headings optimized for voice search and AI answers
 */
export function generateQuestionBasedHeadings(pageType: string): Array<{heading: string, content: string, id: string}> {
  switch (pageType) {
    case "how-to-sell":
      return [
        {
          heading: "How can I resell tickets safely on Ticket Bazaar?",
          content: "Create a verified account, list detailed ticket information with clear photos, communicate through Instagram profiles, meet in public places, and use secure payment methods like UPI or bank transfers.",
          id: "how-to-resell-safely"
        },
        {
          heading: "What types of tickets can I sell on Ticket Bazaar?",
          content: "Sell concert tickets (Bollywood, international artists), sports tickets (IPL, cricket, football), comedy show tickets, theater tickets, festival passes, and entertainment event tickets across India.",
          id: "ticket-types-to-sell"
        },
        {
          heading: "How do I price my tickets for quick sale?",
          content: "Research market rates, consider original ticket price, factor in demand and event proximity, and price competitively to attract genuine buyers while ensuring fair returns.",
          id: "ticket-pricing-strategy"
        },
        {
          heading: "What should I include in my ticket listing?",
          content: "Include event details, seat information, clear ticket photos, pickup/delivery options, preferred payment methods, and your verified Instagram contact for buyer communication.",
          id: "ticket-listing-requirements"
        }
      ];
    
    case "faq":
      return [
        {
          heading: "How does Ticket Bazaar ensure safe ticket transactions?",
          content: "We verify sellers through Instagram profiles, provide secure communication channels, and offer guidelines for safe meetups and payment methods, though we don't handle transactions directly.",
          id: "transaction-safety"
        },
        {
          heading: "Can I buy tickets from anywhere in India on Ticket Bazaar?",
          content: "Yes, our platform connects buyers and sellers across all major Indian cities including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, and Kolkata for nationwide ticket access.",
          id: "nationwide-coverage"
        },
        {
          heading: "What happens if I buy a fake ticket?",
          content: "While we verify sellers, we recommend meeting in person, checking ticket authenticity, and using traceable payment methods. Report suspicious activity through our platform for community safety.",
          id: "fake-ticket-protection"
        }
      ];
    
    default:
      return [];
  }
}

/**
 * Generate comprehensive FAQ data optimized for AI responses
 */
export function generateGEOOptimizedFAQs(pageType: string): Array<{question: string, answer: string}> {
  const commonFAQs = [
    {
      question: "Is Ticket Bazaar legal in India?",
      answer: "Yes, Ticket Bazaar operates legally as a discovery platform connecting ticket buyers and sellers. We don't facilitate transactions but enable peer-to-peer communication for legitimate ticket transfers within legal guidelines."
    },
    {
      question: "How quickly can I sell my tickets on Ticket Bazaar?",
      answer: "Ticket sale speed depends on event popularity, pricing, and demand. Popular events like IPL matches or major concerts typically sell within 24-48 hours when priced competitively."
    },
    {
      question: "What cities does Ticket Bazaar serve in India?",
      answer: "Ticket Bazaar serves all major Indian cities including Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, and other tier-1 and tier-2 cities."
    }
  ];

  const pageFAQs = {
    "how-to-sell": [
      {
        question: "Do I need to pay fees to sell tickets on Ticket Bazaar?",
        answer: "No, listing tickets on Ticket Bazaar is completely free. We don't charge listing fees, commission, or transaction fees from sellers."
      },
      {
        question: "How do I transfer tickets to buyers after sale?",
        answer: "After receiving payment, share QR codes or ticket screenshots directly with buyers through secure messaging. For physical tickets, arrange safe meetup locations for exchange."
      }
    ],
    "faq": [
      {
        question: "Can I sell international event tickets on Ticket Bazaar?",
        answer: "Currently, Ticket Bazaar focuses on events within India. For international events, check our global expansion updates or contact support for specific cases."
      }
    ]
  };

  return [...commonFAQs, ...(pageFAQs[pageType as keyof typeof pageFAQs] || [])];
}

/**
 * Generate enhanced Organization structured data for brand authority
 */
export function generateEnhancedOrganizationSchema(): any {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ticketbazaar.co.in/#organization",
    "name": "Ticket Bazaar",
    "alternateName": ["TicketBazaar", "Ticket Bazar", "TicketBazar"],
    "url": "https://ticketbazaar.co.in",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ticketbazaar.co.in/logo.svg",
      "width": 400,
      "height": 100
    },
    "description": "India's leading peer-to-peer ticket marketplace for concerts, sports, comedy shows, and entertainment events. Connect with verified sellers and buyers safely.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Ticket Bazaar Team"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "India"
    },
    "knowsAbout": [
      "Ticket Resale",
      "Concert Tickets",
      "Sports Tickets", 
      "Event Tickets",
      "Entertainment Booking",
      "Peer-to-peer Marketplace",
      "Ticket Verification"
    ],
    "sameAs": [
      "https://www.instagram.com/ticketbazaar.co.in",
      "https://www.linkedin.com/company/ticket-bazaar-co-in/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://www.linkedin.com/company/ticket-bazaar-co-in/",
      "availableLanguage": ["English", "Hindi"]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ticketbazaar.co.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Ticket Discovery Platform",
        "description": "Platform connecting ticket buyers and sellers"
      },
      "price": "0",
      "priceCurrency": "INR"
    }
  };
}

/**
 * Generate HowTo structured data optimized for AI assistants
 */
export function generateHowToSchema(topic: string): any {
  const howToData = {
    "sell-tickets": {
      name: "How to Sell Tickets Online Safely in India",
      description: "Complete guide to selling concert tickets, sports tickets, and event tickets safely on Ticket Bazaar",
      steps: [
        {
          name: "Create Your Verified Account",
          text: "Sign up on Ticket Bazaar with your Instagram profile for seller verification and credibility building"
        },
        {
          name: "List Your Tickets with Complete Details",
          text: "Add event information, seat details, clear photos, pricing, and contact preferences for maximum buyer interest"
        },
        {
          name: "Communicate with Interested Buyers",
          text: "Respond to buyer inquiries through Instagram, verify buyer profiles, and negotiate terms transparently"
        },
        {
          name: "Complete Safe Transaction and Transfer",
          text: "Meet in public places, use secure payment methods, and transfer tickets via QR codes or screenshots after payment confirmation"
        }
      ]
    }
  };

  const data = howToData[topic as keyof typeof howToData];
  if (!data) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    "image": "https://ticketbazaar.co.in/images/how-to-sell-tickets.jpg",
    "totalTime": "PT15M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Valid Event Tickets"
      },
      {
        "@type": "HowToSupply", 
        "name": "Smartphone or Computer"
      },
      {
        "@type": "HowToSupply",
        "name": "Instagram Account"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Ticket Bazaar Platform"
      }
    ],
    "step": data.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": `https://ticketbazaar.co.in/how-to-sell-tickets#step-${index + 1}`
    }))
  };
}

/**
 * Generate Article structured data for content pages
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  publishDate?: string,
  modifiedDate?: string
): any {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": publishDate || new Date().toISOString(),
    "dateModified": modifiedDate || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "@id": "https://ticketbazaar.co.in/#organization"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://ticketbazaar.co.in/#organization"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://ticketbazaar.co.in/images/article-default.jpg",
      "width": 1200,
      "height": 630
    },
    "articleSection": "Ticket Marketplace Guide",
    "keywords": [
      "sell tickets online",
      "ticket resale India", 
      "concert tickets",
      "sports tickets",
      "event tickets",
      "ticket marketplace"
    ],
    "wordCount": 2000,
    "inLanguage": "en-IN"
  };
}

/**
 * Generate performance optimization recommendations
 */
export function generatePerformanceOptimizations(): Array<{
  category: string;
  recommendations: string[];
}> {
  return [
    {
      category: "Core Web Vitals",
      recommendations: [
        "Implement lazy loading for images and videos",
        "Use WebP format for images with fallbacks",
        "Minimize JavaScript bundles and defer non-critical scripts",
        "Optimize Largest Contentful Paint (LCP) < 2.5s",
        "Ensure Cumulative Layout Shift (CLS) < 0.1",
        "Optimize Interaction to Next Paint (INP) < 200ms"
      ]
    },
    {
      category: "Technical SEO",
      recommendations: [
        "Enable gzip/brotli compression",
        "Implement HTTP/2 server push",
        "Set up proper caching headers",
        "Use CDN for static assets",
        "Optimize server response time < 200ms",
        "Implement service worker for offline functionality"
      ]
    },
    {
      category: "Mobile Optimization",
      recommendations: [
        "Ensure mobile-first responsive design",
        "Optimize touch targets (min 44px)",
        "Implement AMP for critical pages",
        "Use mobile-optimized image sizes",
        "Optimize for mobile Core Web Vitals",
        "Test on various device sizes"
      ]
    }
  ];
}

/**
 * Generate AI referral tracking schema
 */
export function generateAITrackingSchema(): any {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://ticketbazaar.co.in",
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://ticketbazaar.co.in/search?q={search_term_string}&ref=ai"
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "mainEntity": {
      "@type": "Organization",
      "@id": "https://ticketbazaar.co.in/#organization"
    }
  };
}

/**
 * Content clusters for internal linking and topical authority
 */
export const CONTENT_CLUSTERS = {
  "selling-tickets": {
    pillar: "/how-to-sell-tickets",
    supporting: [
      "/ticket-verification",
      "/seller-policy", 
      "/pricing-guide",
      "/safety-tips"
    ],
    keywords: [
      "how to sell tickets online",
      "resell tickets safely",
      "ticket pricing strategy",
      "seller verification"
    ]
  },
  "buying-tickets": {
    pillar: "/faq",
    supporting: [
      "/buyer-guide",
      "/payment-methods",
      "/ticket-authenticity"
    ],
    keywords: [
      "buy second hand tickets",
      "verify ticket authenticity",
      "safe payment methods",
      "buyer protection"
    ]
  },
  "event-types": {
    pillar: "/events",
    supporting: [
      "/concert-tickets",
      "/sports-tickets", 
      "/comedy-shows",
      "/festivals"
    ],
    keywords: [
      "concert tickets India",
      "IPL tickets",
      "comedy show tickets",
      "festival passes"
    ]
  }
};
