import React from "react";

/**
 * Creates schema.org structured data for the organization to enhance SEO
 */
export const OrganizationSchema = () => {
  const structuredData = {
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
    slogan: "Verified Second Hand Tickets with Secure Transactions",
    keywords:
      "ticket resale, second hand tickets, 2nd hand tickets, concert tickets, sports tickets, event tickets, India tickets",
  };

  return (
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  );
};
