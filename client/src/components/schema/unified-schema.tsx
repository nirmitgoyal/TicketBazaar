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
      name: "Ticket Bazaar",
      url: "https://ticketbazaar.co.in",
      logo: "https://ticketbazaar.co.in/logo.svg",
      sameAs: [
        "https://www.instagram.com/ticketbazaar.co.in/",
        "https://linkedin.com/in/nirmitgoyal",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
      },
      description:
        "India's secure second hand ticket marketplace for buying and selling verified 2nd hand event tickets. Buy and sell tickets for concerts, sports, and festivals with escrow protection.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://ticketbazaar.co.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
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

// Common FAQs for the platform
export const ticketBazaarFAQs: FAQItem[] = [
  {
    question: "Is it safe to buy second hand tickets on Ticket Bazaar?",
    answer: "Yes, Ticket Bazaar is a discovery and contact platform that connects verified buyers and sellers. We are not a reseller or broker - we don't handle payments, hold inventory, or facilitate transactions. We ensure trust through verified profiles and secure communication channels."
  },
  {
    question: "How do I verify if my tickets are authentic?",
    answer: "Our platform includes ticket verification features including QR code scanning and seller verification to ensure ticket authenticity."
  },
  {
    question: "What cities does Ticket Bazaar serve?",
    answer: "Ticket Bazaar serves major cities worldwide including New York, London, Sydney, Tokyo, Berlin, Toronto, São Paulo, and many more across multiple countries."
  },
  {
    question: "How quickly can I sell my tickets?",
    answer: "Tickets can be listed immediately and are visible to buyers right away. Many tickets sell within 24-48 hours depending on demand."
  },
  {
    question: "What types of events can I find tickets for?",
    answer: "You can find tickets for concerts, sports events, festivals, comedy shows, theatre performances, workshops, and other live events worldwide across multiple countries."
  }
];

export type { FAQItem, BreadcrumbItem };