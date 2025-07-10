/**
 * GEO-optimized FAQ page route
 */

import React from "react";
import GEOOptimizedFAQ from "@/components/geo-optimized-faq";
import { UnifiedSEO } from "@/components/unified-seo-component";
import { generateFAQStructuredData, generateOrganizationStructuredData } from "@/utils/seo-utils";

export default function FAQPage() {
  const structuredData = [
    generateFAQStructuredData([], true), // Include selling FAQs
    generateOrganizationStructuredData()
  ];

  return (
    <>
      <UnifiedSEO
        type="general"
        title="Frequently Asked Questions | TicketBazaar - India's Trusted Ticket Marketplace"
        description="Get answers to all your questions about buying and selling tickets safely on TicketBazaar. Learn how to sell concert tickets, sports tickets, and event tickets in India."
        keywords="faq, frequently asked questions, how to sell tickets, ticket resale questions, buy tickets safely, sell concert tickets, ticket marketplace help"
        canonical="https://ticketbazaar.co.in/faq"
        structuredData={structuredData}
      />
      
      <GEOOptimizedFAQ />
    </>
  );
}
