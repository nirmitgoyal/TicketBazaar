/**
 * SEO Performance Dashboard Page
 * Accessible at /seo-performance for monitoring and tracking SEO metrics
 */

import React from "react";
import { UnifiedSEO } from "@/components/unified-seo-component";
import SEOPerformanceMonitor from "@/components/seo-performance-monitor";

export default function SEOPerformancePage() {
  return (
    <>
      <UnifiedSEO
        type="general"
        title="SEO Performance Dashboard | TicketBazaar Analytics"
        description="Monitor and track TicketBazaar's search engine optimization performance, keyword rankings, and AI crawler support metrics."
        keywords="seo dashboard, search rankings, keyword performance, ai optimization, search analytics"
        canonical="https://ticketbazaar.co.in/seo-performance"
        robots="noindex, nofollow" // Internal tool - don't index
      />
      
      <SEOPerformanceMonitor />
    </>
  );
}