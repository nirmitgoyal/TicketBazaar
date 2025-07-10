/**
 * GEO-optimized How to Sell Tickets page route
 */

import React from "react";
import GEOOptimizedHowToSell from "@/components/geo-optimized-how-to-sell";
import { UnifiedSEO } from "@/components/unified-seo-component";
import { generateSellingStructuredData, generateOrganizationStructuredData } from "@/utils/seo-utils";
import { generateHowToSchema } from "@/utils/geo-optimization-utils";

export default function HowToSellTickets() {
  const structuredData = [
    generateSellingStructuredData("how-to"),
    generateHowToSchema("sell-tickets"),
    generateOrganizationStructuredData()
  ];

  return (
    <>
      <UnifiedSEO
        type="how-to"
        title="How to Sell Tickets Online Safely in India | Complete Guide | TicketBazaar"
        description="Learn how to sell concert tickets, sports tickets, and event tickets online safely in India. Step-by-step guide with pricing strategies, safety tips, and best practices for ticket resale."
        keywords="how to sell tickets online, how to sell concert tickets, how to sell tickets safely, sell tickets online india, ticket resale guide, where to sell tickets, how do you sell concert tickets"
        canonical="https://ticketbazaar.co.in/how-to-sell-tickets"
        structuredData={structuredData}
      />
      
      <GEOOptimizedHowToSell />
    </>
  );
}