/**
 * GEO Performance Monitoring Dashboard Route
 * Admin/Analytics page for tracking SEO and AI optimization performance
 */

import React from "react";
import GEOPerformanceMonitor from "@/components/geo-performance-monitor";
import { UnifiedSEO } from "@/components/unified-seo-component";
import { generateOrganizationStructuredData } from "@/utils/seo-utils";

export default function GEOPerformanceDashboard() {
  const structuredData = [
    generateOrganizationStructuredData()
  ];

  return (
    <>
      <UnifiedSEO
        type="general"
        title="GEO Performance Dashboard | TicketBazaar Analytics"
        description="Monitor SEO performance, AI citation rates, and Core Web Vitals for TicketBazaar's generative engine optimization."
        keywords="seo performance, ai citations, core web vitals, generative engine optimization"
        canonical="https://ticketbazaar.co.in/admin/geo-performance"
        structuredData={structuredData}
        noIndex={true}
      />
      
      <GEOPerformanceMonitor />
    </>
  );
}
