import React from "react";
import { Event, Ticket } from "@shared/schema";

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface UnifiedSchemaProps {
  event?: Event;
  ticket?: Ticket;
  faqs?: FAQItem[];
  breadcrumbs?: BreadcrumbItem[];
  includeOrganization?: boolean;
}

export const UnifiedSchema: React.FC<UnifiedSchemaProps> = ({
  event,
  ticket,
  faqs,
  breadcrumbs,
  includeOrganization = true,
}) => {
  const schemas = [];

  // Organization schema
  if (includeOrganization) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TicketHub",
      alternateName: "TicketHub Global",
      url: "https://tickethub.global",
      logo: "https://tickethub.global/logo.svg",
      sameAs: [
        "https://www.instagram.com/tickethub.global/",
        "https://www.facebook.com/tickethub.global/",
        "https://twitter.com/tickethub",
        "https://www.linkedin.com/company/tickethub-global/",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese"],
          serviceArea: "Worldwide"
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          availableLanguage: ["English"],
          serviceArea: "Global"
        }
      ],
      description:
        "Global ticket discovery and contact platform connecting verified buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals across multiple countries and currencies.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "GLOBAL",
        addressRegion: "Global",
      },
      areaServed: [
        {
          "@type": "Country",
          name: "United States",
        },
        {
          "@type": "Country", 
          name: "United Kingdom",
        },
        {
          "@type": "Country",
          name: "Canada",
        },
        {
          "@type": "Country",
          name: "Australia",
        },
        {
          "@type": "Country",
          name: "Germany",
        },
        {
          "@type": "Country",
          name: "France",
        },
        {
          "@type": "Country",
          name: "Spain",
        },
        {
          "@type": "Country",
          name: "Italy",
        },
        {
          "@type": "Country",
          name: "Japan",
        },
        {
          "@type": "Country",
          name: "Brazil",
        }
      ],
      serviceType: [
        "Ticket Discovery Platform",
        "Event Marketplace",
        "Buyer-Seller Connection Service",
        "Global Entertainment Platform"
      ],
      knowsAbout: [
        "Concert Tickets",
        "Comedy Show Tickets", 
        "Sports Event Tickets",
        "Travel Experience Tickets",
        "Movie Tickets",
        "Festival Tickets",
        "Theater Tickets",
        "Entertainment Events"
      ],
      potentialAction: {
        "@type": "SearchAction",
        target: "https://tickethub.global/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Global Event Tickets",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Concert Ticket Discovery",
              category: "Entertainment"
            }
          },
          {
            "@type": "Offer", 
            itemOffered: {
              "@type": "Service",
              name: "Sports Ticket Discovery",
              category: "Sports"
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service", 
              name: "Comedy Show Ticket Discovery",
              category: "Comedy"
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Travel Experience Discovery",
              category: "Travel"
            }
          }
        ]
      }
    });
  }

  // Event schema
  if (event) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.eventTitle,
      description: event.eventDescription,
      startDate: event.eventDate.toISOString(),
      location: {
        "@type": "Place",
        name: event.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressCountry: "IN",
        },
      },
      offers: {
        "@type": "Offer",
        price: event.price.toString(),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    });
  }

  // Ticket schema
  if (ticket) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${ticket.eventTitle} Ticket`,
      description: ticket.eventDescription,
      category: "Event Ticket",
      offers: {
        "@type": "Offer",
        price: ticket.price.toString(),
        priceCurrency: "INR",
        availability: ticket.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    });
  }

  // FAQ schema
  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    });
  }

  // Breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `https://ticketbazaar.co.in${item.url}`
      }))
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
};

// Common FAQs for the global platform
export const ticketHubGlobalFAQs: FAQItem[] = [
  {
    question: "How does TicketHub work as a global discovery platform?",
    answer: "TicketHub is a global discovery and contact platform that connects verified buyers and sellers worldwide. We help you find and connect with ticket holders for concerts, comedy shows, sports events, travel experiences, movies, and festivals across multiple countries. We don't handle payments or transactions - we facilitate secure connections between people."
  },
  {
    question: "What types of events can I discover tickets for on TicketHub?",
    answer: "You can discover tickets for concerts, comedy shows, sports events, travel experiences, movie premieres, festivals, theater performances, and entertainment events worldwide. Our platform covers events across major cities in the US, UK, Canada, Australia, Germany, France, Spain, Italy, Japan, Brazil, and many more countries."
  },
  {
    question: "Which countries and currencies does TicketHub support?",
    answer: "TicketHub operates globally with support for multiple currencies including USD, EUR, GBP, CAD, AUD, JPY, and more. We serve major cities worldwide including New York, London, Sydney, Tokyo, Berlin, Toronto, São Paulo, Paris, Rome, Madrid, and hundreds of other locations."
  },
  {
    question: "How do I verify ticket authenticity on TicketHub?",
    answer: "Our platform includes comprehensive verification features including QR code scanning, seller verification, and authenticity checks. We also provide trust scores and verification badges for both tickets and sellers to ensure secure connections."
  },
  {
    question: "Is TicketHub safe for international ticket discovery?",
    answer: "Yes, TicketHub prioritizes safety through verified user profiles, secure communication channels, and comprehensive verification systems. As a discovery platform, we connect you with verified sellers - all transactions and arrangements are made directly between users with our safety guidelines."
  },
  {
    question: "How quickly can I connect with ticket sellers on TicketHub?",
    answer: "Ticket listings are visible immediately and our real-time notification system ensures fast connections. Most users connect with sellers within hours, and many successful arrangements are made within 24-48 hours depending on event popularity and location."
  }
];

export type { FAQItem, BreadcrumbItem };